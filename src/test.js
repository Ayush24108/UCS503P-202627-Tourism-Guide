// Run this file with: npm test
// (make sure you've set up your .env file with a real Gemini API key first)

import { handleUserMessage } from './chatbot.js';
import { mockPlaces } from './mockData.js';

async function runTests() {
  console.log('--- TEST 1: Fact question about Red Fort ---');
  const redFort = mockPlaces.find(p => p.id === 'redfort');
  const factResult = await handleUserMessage(
    'Who built this and why is it important?',
    { place: redFort }
  );
  console.log(factResult);

  console.log('\n--- TEST 2: Itinerary request ---');
  const itineraryResult = await handleUserMessage(
    'Can you plan my 1 day trip? I like history and monuments.',
    {
      places: mockPlaces,
      preferences: { days: 1, interests: ['history', 'monuments'], pace: 'moderate' },
    }
  );
  console.log(JSON.stringify(itineraryResult, null, 2));
}

runTests().catch(err => console.error('Test failed:', err));
