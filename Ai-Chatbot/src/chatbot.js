// This file's job: figure out WHAT the tourist wants, then call the
// right prompt and return a clean answer.

import { callGroq } from './callGroq.js';
import { buildFactPrompt, buildItineraryPrompt, buildIntentPrompt } from './prompts.js';

/**
 * Step A: figure out if this is a FACT question or an ITINERARY request.
 * We make a tiny, fast call to the AI just to classify the message.
 */
async function classifyIntent(userMessage) {
  const reply = await callGroq(buildIntentPrompt(), [
    { role: 'user', content: userMessage }
  ]);
  const cleaned = reply.trim().toUpperCase();
  return cleaned.includes('ITINERARY') ? 'ITINERARY' : 'FACT';
}

/**
 * Step B1: handle a fact question about one specific place.
 */
async function handleFactQuestion(userMessage, place) {
  const systemPrompt = buildFactPrompt(place);
  const answer = await callGroq(systemPrompt, [
    { role: 'user', content: userMessage }
  ]);
  return { type: 'FACT', answer };
}

/**
 * Step B2: handle an itinerary request.
 */
async function handleItineraryRequest(userMessage, places, preferences) {
  const systemPrompt = buildItineraryPrompt(places, preferences);
  const rawReply = await callGroq(systemPrompt, [
    { role: 'user', content: userMessage }
  ]);

  // The AI was told to return JSON only - we parse it into a real object.
  // Gemini sometimes wraps JSON in ```json fences even when told not to,
  // so we strip those defensively before parsing.
  const cleaned = rawReply.trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');

  try {
    const itinerary = JSON.parse(cleaned);
    return { type: 'ITINERARY', itinerary };
  } catch (err) {
    // If parsing fails, the AI didn't follow instructions exactly -
    // in a real project you'd log this and maybe retry.
    return { type: 'ITINERARY', error: 'Could not parse itinerary', raw: rawReply };
  }
}

/**
 * THE MAIN ENTRY POINT.
 * This is the one function the rest of the app (frontend/backend) calls.
 *
 * @param {string} userMessage - what the tourist typed
 * @param {object} context - { place, places, preferences } depending on intent
 */
export async function handleUserMessage(userMessage, context) {
  const intent = await classifyIntent(userMessage);

  if (intent === 'FACT') {
    return handleFactQuestion(userMessage, context.place);
  } else {
    return handleItineraryRequest(userMessage, context.places, context.preferences);
  }
}
