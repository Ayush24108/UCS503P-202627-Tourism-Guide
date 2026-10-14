// This file's job: work out WHAT the tourist wants (a fact, an itinerary, a
// travel time, or general advice), call the AI or our own code, and hand back
// a clean, checked answer.

import { callGroq } from './callGroq.js';
import {
  buildIntentPrompt,
  buildPlacePickerPrompt,
  buildFactPrompt,
  buildGeneralPrompt,
  buildTripParamsPrompt,
  buildItineraryPrompt,
  toText,
} from './prompts.js';

const MAX_PLACES_IN_PROMPT = 30; // keeps prompts small so free-tier limits last
const MAX_DAYS = 7;

/* ====================== small helpers ====================== */

// The AI sometimes adds words or ```json fences around JSON.
// We grab everything from the first { to the last } and parse that.
function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) throw new Error('No JSON found in reply');
  return JSON.parse(text.slice(start, end + 1));
}

// All places whose exact name appears in the text, in the order they appear.
function findPlacesByName(text, places) {
  const t = text.toLowerCase();
  const hits = [];
  for (const p of places) {
    const name = String(p.name || '').toLowerCase();
    const idx = name ? t.indexOf(name) : -1;
    if (idx !== -1) hits.push({ place: p, idx, len: name.length });
  }
  // ignore a match that is only a piece of a longer matched name
  const kept = hits.filter(h => !hits.some(o =>
    o !== h && o.len > h.len && o.idx <= h.idx && o.idx + o.len >= h.idx + h.len));
  return kept.sort((a, b) => a.idx - b.idx).map(h => h.place);
}

// One place named in the text (the longest name wins).
function findPlaceByName(text, places) {
  const found = findPlacesByName(text, places);
  if (found.length === 0) return null;
  return found.reduce((best, p) => (String(p.name).length > String(best.name).length ? p : best));
}

// A place mentioned earlier in the conversation (most recent first).
function findEarlierPlace(history, places) {
  const list = Array.isArray(history) ? history : [];
  for (let i = list.length - 1; i >= 0; i--) {
    const found = list[i] && findPlaceByName(String(list[i].content || ''), places);
    if (found) return found;
  }
  return null;
}

function cleanHistory(history) {
  return (Array.isArray(history) ? history : [])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && m.content)
    .slice(-6);
}

// cityText can hold several cities, e.g. "Delhi and Jaipur"
function matchesCity(place, cityText) {
  const haystack = [place.name, place.location, place.area, place.city]
    .map(toText).join(' ').toLowerCase();
  const cities = cityText.split(/,|&|\band\b/i).map(s => s.trim().toLowerCase()).filter(Boolean);
  return cities.some(c => haystack.includes(c));
}

const namesOf = places => places.slice(0, 10).map(p => p.name).join(', ');

/* ====================== step 1: what does the tourist want? ====================== */

async function classifyIntent(userMessage) {
  const reply = (await callGroq(
    buildIntentPrompt(),
    [{ role: 'user', content: userMessage }],
    { temperature: 0 }
  )).trim().toUpperCase();

  if (reply.includes('TRAVEL')) return 'TRAVEL_TIME';
  if (reply.includes('ITINERARY')) return 'ITINERARY';
  if (reply.includes('GENERAL')) return 'GENERAL';
  return 'FACT';
}

/* ====================== FACT questions ====================== */

// Which place is the tourist asking about?
async function resolvePlace(userMessage, context, places) {
  // 1. An exact place name in the message: no AI needed.
  const named = findPlaceByName(userMessage, places);
  if (named) return named;
  if (places.length === 1) return places[0];

  // 2. Otherwise let the AI choose FROM OUR LIST, using what the website knows
  //    (the page being viewed, earlier messages). This handles spelling
  //    variants like "Amber Fort" and words like "it" or "this".
  const reply = await callGroq(
    buildPlacePickerPrompt(places.slice(0, 100), context.place || null, findEarlierPlace(context.history, places)),
    [{ role: 'user', content: userMessage }],
    { temperature: 0 }
  );
  const token = reply.trim().split(/[\s|,]+/)[0].replace(/[^\w-]/g, '');
  // Only accept an id that really exists in our data (never trust the AI blindly).
  return places.find(p => String(p.id) === token) || null;
}

async function handleFactQuestion(userMessage, context, places) {
  const place = await resolvePlace(userMessage, context, places);

  if (!place) {
    return {
      type: 'FACT',
      topic: 'clarification',
      answer: `I'm not sure which place you mean, or I don't have it in my guide yet. I can tell you about: ${namesOf(places)}. Which one would you like to know about?`,
    };
  }

  const answer = await callGroq(
    buildFactPrompt(place),
    [...cleanHistory(context.history), { role: 'user', content: userMessage }]
  );
  return { type: 'FACT', topic: 'fact', answer, placeId: String(place.id) };
}

/* ====================== TRAVEL TIME (calculated by our code, not guessed by the AI) ====================== */

// Reads a latitude/longitude from the common ways a database might store it.
function getCoords(place) {
  const num = v => (v === null || v === undefined || v === '' ? NaN : Number(v));
  const valid = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) &&
    Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  const c = place.coordinates && !Array.isArray(place.coordinates) ? place.coordinates : {};
  const pairs = [
    [place.lat, place.lng], [place.lat, place.lon], [place.latitude, place.longitude],
    [c.lat, c.lng], [c.latitude, c.longitude],
  ];
  for (const [lat, lng] of pairs) {
    if (valid(num(lat), num(lng))) return { lat: num(lat), lng: num(lng) };
  }
  // GeoJSON style (MongoDB convention): [longitude, latitude]
  const arr = Array.isArray(place.coordinates) ? place.coordinates
    : (place.location && Array.isArray(place.location.coordinates) ? place.location.coordinates : null);
  if (arr && arr.length >= 2 && valid(num(arr[1]), num(arr[0]))) {
    return { lat: num(arr[1]), lng: num(arr[0]) };
  }
  return null;
}

// Straight-line distance between two points on Earth (haversine formula).
function haversineKm(a, b) {
  const R = 6371;
  const rad = d => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const roundTo5 = m => Math.max(5, Math.round(m / 5) * 5);
const fmtDuration = m =>
  m >= 60 ? `${Math.floor(m / 60)} hr${m % 60 ? ` ${m % 60} min` : ''}` : `${m} min`;

// Rough estimate: roads are longer than a straight line, and speeds depend on
// whether the trip is inside a city or between cities.
function estimateTravel(straightKm) {
  const far = straightKm > 40;
  const roadKm = straightKm * (far ? 1.25 : 1.35);
  const [fast, slow] = far ? [60, 45] : [30, 20]; // average km/h
  return {
    far,
    roadKm: Math.round(roadKm * 10) / 10,
    carMinutes: [roundTo5((roadKm / fast) * 60), roundTo5((roadKm / slow) * 60)],
    walkMinutes: straightKm <= 2.5 ? roundTo5((roadKm / 5) * 60) : null,
  };
}

async function handleTravelTime(userMessage, context, places) {
  const named = findPlacesByName(userMessage, places);
  let from = named[0];
  let to = named[1];

  // "How far is Hawa Mahal from here?" -> "here" is the page being viewed
  if (named.length === 1 && context.place && String(context.place.id) !== String(named[0].id)) {
    from = context.place;
    to = named[0];
  }

  if (!from || !to || String(from.id) === String(to.id)) {
    return {
      type: 'FACT',
      topic: 'clarification',
      answer: `Which two places would you like the travel time between? For example: "Red Fort to Qutub Minar". I know about: ${namesOf(places)}.`,
    };
  }

  const ca = getCoords(from);
  const cb = getCoords(to);
  if (!ca || !cb) {
    const missing = [!ca && from.name, !cb && to.name].filter(Boolean).join(' and ');
    return {
      type: 'FACT',
      topic: 'no_data',
      answer: `I don't have map coordinates for ${missing} yet, so I can't estimate the travel time.`,
    };
  }

  const t = estimateTravel(haversineKm(ca, cb));
  const [lo, hi] = t.carMinutes;
  const range = lo === hi ? fmtDuration(lo) : `${fmtDuration(lo)} to ${fmtDuration(hi)}`;

  let answer = `${from.name} to ${to.name} is about ${t.roadKm} km by road. By car or taxi, expect roughly ${range}, depending on traffic.`;
  if (t.walkMinutes) answer += ` It is also walkable: about ${fmtDuration(t.walkMinutes)} on foot.`;
  if (t.far) answer += ' They are far apart, so it is best to visit them on different days.';
  answer += ' (This is a rough estimate from map distance, not live traffic.)';

  return {
    type: 'FACT',
    topic: 'travel_time',
    answer,
    travel: {
      from: { id: String(from.id), name: from.name },
      to: { id: String(to.id), name: to.name },
      roadKm: t.roadKm,
      carMinutes: t.carMinutes,
      walkMinutes: t.walkMinutes,
    },
  };
}

/* ====================== GENERAL travel advice ====================== */

async function handleGeneralAdvice(userMessage, context) {
  const answer = await callGroq(
    buildGeneralPrompt(),
    [...cleanHistory(context.history), { role: 'user', content: userMessage }]
  );
  return { type: 'FACT', topic: 'general', answer };
}

/* ====================== ITINERARY requests ====================== */

// Reads days / city / interests / etc. from the tourist's message.
// If the website's "Plan Trip" form sent preferences, those win for days & interests.
async function extractTripParams(userMessage, context) {
  const prefs = context.preferences || {};
  let parsed = {};
  try {
    const reply = await callGroq(
      buildTripParamsPrompt(),
      [{ role: 'user', content: userMessage }],
      { temperature: 0 }
    );
    parsed = extractJson(reply);
  } catch {
    parsed = {}; // fall back to sensible defaults below
  }

  let days = parseInt(prefs.days, 10);
  if (!(days > 0)) days = parseInt(parsed.days, 10);
  if (!(days > 0)) days = 1;
  days = Math.min(days, MAX_DAYS);

  // A city in the message wins; otherwise the website may tell us the city.
  const pick = v => (typeof v === 'string' && v.trim() ? v.trim() : null);
  const city = pick(parsed.city) || pick(context.city);

  let interests = [];
  if (Array.isArray(prefs.interests) && prefs.interests.length) interests = prefs.interests;
  else if (Array.isArray(parsed.interests)) interests = parsed.interests;
  interests = interests.filter(s => typeof s === 'string').slice(0, 5);

  const n = parseInt(parsed.numPlaces, 10);
  const numPlaces = n > 0 ? Math.min(n, 20) : null;

  const st = typeof parsed.startTime === 'string' ? parsed.startTime.trim() : '';
  const startTime = /^\d{1,2}(:\d{2})?\s?(am|pm)$/i.test(st) || /^([01]?\d|2[0-3]):[0-5]\d$/.test(st)
    ? st.toUpperCase() : null;

  const h = Number(parsed.hoursAvailable);
  const hoursAvailable = h >= 1 && h <= 14 ? h : null;

  return { days, city, interests, numPlaces, startTime, hoursAvailable, pace: prefs.pace };
}

// The AI's itinerary is only trusted after we check it against our own data:
// unknown place ids are dropped, repeats are dropped, names come from our data.
function validateItinerary(parsed, places) {
  const byId = new Map(places.map(p => [String(p.id), p]));
  const used = new Set();
  const days = [];

  for (const day of Array.isArray(parsed.days) ? parsed.days : []) {
    const stops = [];
    for (const s of Array.isArray(day.stops) ? day.stops : []) {
      const place = byId.get(String(s.placeId));
      if (!place || used.has(String(place.id))) continue;
      used.add(String(place.id));
      stops.push({
        placeId: String(place.id),
        name: place.name,
        suggestedTime: s.suggestedTime || '',
        durationMins: Number(s.durationMins) || place.avgVisitDurationMins || 60,
      });
    }
    if (stops.length) days.push({ day: days.length + 1, stops });
  }
  return days.length ? { days } : null;
}

async function handleItineraryRequest(userMessage, context, places) {
  const trip = await extractTripParams(userMessage, context);

  // Only plan with places from the city the tourist asked about.
  let candidates = places;
  if (trip.city) {
    candidates = places.filter(p => matchesCity(p, trip.city));
    if (candidates.length === 0) {
      return {
        type: 'FACT',
        topic: 'no_data',
        answer: `I don't have any places listed for ${trip.city} yet. I can plan trips using the places currently in our guide: ${namesOf(places)}.`,
      };
    }
  }
  candidates = candidates.slice(0, MAX_PLACES_IN_PROMPT);

  const rawReply = await callGroq(
    buildItineraryPrompt(candidates, trip),
    [{ role: 'user', content: userMessage }]
  );

  let parsed;
  try {
    parsed = extractJson(rawReply);
  } catch {
    return { type: 'ITINERARY', error: 'Could not parse itinerary', raw: rawReply };
  }

  const itinerary = validateItinerary(parsed, candidates);
  if (!itinerary) {
    return { type: 'ITINERARY', error: 'Itinerary had no valid places', raw: rawReply };
  }
  return { type: 'ITINERARY', itinerary, city: trip.city };
}

/* ====================== THE MAIN ENTRY POINT ====================== */

/**
 * The one function the backend calls.
 *
 * @param {string} userMessage - what the tourist typed
 * @param {object} context
 *   - places       (needed)   all places from the database, as plain objects with a string `id`
 *   - place        (optional) the place the tourist is currently viewing
 *   - history      (optional) earlier messages: [{ role: 'user' | 'assistant', content }]
 *   - preferences  (optional) { days, interests, pace } from a "Plan Trip" form
 *   - city         (optional) the city the tourist is in / planning for, if the website knows it
 *
 * @returns {object} one of:
 *   { type: 'ITINERARY', itinerary: { days: [...] }, city }
 *   { type: 'FACT', topic, answer, ... }   <- any plain-text reply. `topic` is one of:
 *        'fact' | 'travel_time' | 'general' | 'clarification' | 'no_data'
 */
export async function handleUserMessage(userMessage, context = {}) {
  const message = String(userMessage || '').trim();
  if (!message) {
    return { type: 'FACT', topic: 'clarification', answer: 'Please type a question, or ask me to plan a trip.' };
  }

  const places = Array.isArray(context.places) && context.places.length
    ? context.places
    : (context.place ? [context.place] : []);
  if (places.length === 0) {
    return { type: 'FACT', topic: 'no_data', answer: "I don't have any place information loaded right now, so I can't help yet." };
  }

  const intent = await classifyIntent(message);
  switch (intent) {
    case 'ITINERARY': return handleItineraryRequest(message, context, places);
    case 'TRAVEL_TIME': return handleTravelTime(message, context, places);
    case 'GENERAL': return handleGeneralAdvice(message, context);
    default: return handleFactQuestion(message, context, places);
  }
}
