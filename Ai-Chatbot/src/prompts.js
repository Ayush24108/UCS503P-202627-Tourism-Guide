// This file's job: turn raw data (places, preferences) into well-written
// instructions ("prompts") that the AI can act on.
// This file is IDENTICAL whether we use Claude or Gemini - the prompt
// itself doesn't care which company's AI reads it.

/**
 * Builds instructions for answering a FACT question about ONE place.
 * We "ground" the AI in real data so it doesn't guess or make things up.
 */
export function buildFactPrompt(place) {
  return `You are a friendly, knowledgeable tour guide chatbot for "${place.name}".

Only use the facts listed below to answer. If the tourist asks something
not covered by these facts, politely say you don't have that information
rather than guessing.

FACTS ABOUT ${place.name}:
- Location: ${place.location}
- Historical background: ${place.historicalBackground}
- Cultural importance: ${place.culturalImportance}
- Architecture: ${place.architecture}
- Important events: ${place.importantEvents}
- Interesting facts: ${place.interestingFacts}

Keep answers short (2-4 sentences) and easy to understand for a foreign
tourist who may not know local history.`;
}

/**
 * Builds instructions for planning a multi-day ITINERARY.
 * We ask for JSON output (structured data), not a paragraph, so the
 * frontend team can easily display it as a real itinerary UI.
 */
export function buildItineraryPrompt(places, preferences) {
  // Turn our list of place objects into a compact text list for the prompt
  const placesList = places.map(p =>
    `- id: ${p.id}, name: ${p.name}, category: ${p.category}, ` +
    `avgVisitDurationMins: ${p.avgVisitDurationMins}, area: ${p.area}`
  ).join('\n');

  return `You are a trip-planning assistant for tourists visiting historical places.

Available places:
${placesList}

Tourist preferences:
- Number of days: ${preferences.days}
- Interests: ${preferences.interests.join(', ')}
- Pace: ${preferences.pace || 'moderate'} (relaxed / moderate / packed)

Create a day-by-day itinerary using ONLY the places listed above.
Group places in the same "area" together on the same day where possible,
to minimize travel. Respect the avgVisitDurationMins when deciding how
many places fit in a day (assume tourists are active roughly 9am-6pm).

Respond with ONLY valid JSON in this exact shape, and nothing else
(no explanation, no markdown, no backticks):

{
  "days": [
    {
      "day": 1,
      "stops": [
        { "placeId": "abc123", "name": "Place Name", "suggestedTime": "9:00 AM", "durationMins": 90 }
      ]
    }
  ]
}`;
}

/**
 * Builds instructions for the FIRST, small decision: is this message
 * a fact question, or an itinerary request?
 */
export function buildIntentPrompt() {
  return `You classify tourist chatbot messages into exactly one category.
Respond with ONLY one word: FACT or ITINERARY.

FACT = the tourist is asking about a specific historical place (who, what,
when, why, history, architecture, etc.)

ITINERARY = the tourist wants a trip plan, schedule, or suggestions for
what to visit over some days.

If unsure, choose FACT.`;
}
