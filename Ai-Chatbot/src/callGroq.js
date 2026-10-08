// This file's ONE job: send text to Groq (running Llama models), get text back.
// Groq uses the same request format as OpenAI, so we use plain fetch -
// no extra npm package needed for this one.

import 'dotenv/config'; // loads your .env file automatically

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Sends a message to Groq and returns its reply as plain text.
 *
 * @param {string} systemPrompt - instructions that set the AI's "role"
 * @param {Array} messages - the conversation so far, e.g. [{ role: 'user', content: 'Hi' }]
 * @returns {Promise<string>} - the model's reply
 */
export async function callGroq(systemPrompt, messages) {
  // Groq/OpenAI format wants the system prompt as the first message
  // in the same list, not passed separately like Gemini wanted it.
  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b", // free, fast, capable model on Groq
      messages: allMessages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
