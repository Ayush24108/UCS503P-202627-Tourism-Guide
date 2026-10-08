# Weekly Work Journal

## Week 1: Project Planning and Documentation


Work Done

Took part in team discussions to finalize the idea for the Tourism Guide Planner.
Identified the problems tourists face while planning trips, such as finding suitable destinations, organizing itineraries, and getting reliable travel information.
Helped define the project scope and main features: historical place information, guide booking, and an AI chatbot.
Contributed to the initial project proposal.

Outcome

Gained a clear understanding of the project's objectives, features, target users, and system requirements.
Week 2: Understanding LLMs and the AI Chatbot

Work Done

Studied Large Language Models (LLMs) and how they are used in real-world applications.
Learned that an application can use an existing LLM through an API instead of building a language model from scratch.
Identified an LLM-powered chatbot as a useful addition to the project, letting tourists ask questions about destinations, attractions, and travel plans in natural language.

Outcome

Developed a basic understanding of LLMs and their role in AI applications.
Helped refine the AI component of the project and planned its implementation.
Week 3: Exploring LLM API Integration

Work Done

Explored how an application sends user queries to an LLM API and receives generated responses.
Tried different tourism-related queries to see how relevant the responses were.
Explored basic prompt structuring so the model acts as a tourism assistant instead of giving generic answers.

Outcome

Gained hands-on experience with API requests and responses when interacting with an LLM.
Built an early understanding that served as the foundation for the full chatbot implementation in Week 4.
Week 4: Chatbot Implementation and Repository Submission

(8 October 2026)

Work Done

Designed the chatbot around two tasks: answering factual questions about a historical place, and recommending an itinerary on request.
Built it as a standalone Node.js module with separate files for API communication, prompt templates, intent routing, sample data, and testing.
Wrote a grounded prompt for factual answers that restricts the model to stored place data (history, architecture, cultural importance, events, interesting facts) to reduce incorrect answers.
Wrote an itinerary prompt that returns structured JSON (day, place ID, suggested time, duration) so the frontend can display it directly.
Added an intent-detection step that classifies each message as a fact question or an itinerary request.
Created sample data for Red Fort, Qutub Minar, and India Gate so the chatbot can be tested without waiting for the database.
Tested with the Gemini API and resolved API key problems, a retired model name, and server timeouts. Added timeout handling to the request code.
Switched to the Groq API (Llama 3.3 70B) for more reliable free access. Both test cases passed: a grounded fact answer and a valid JSON itinerary.
Stored the API key in a .env file excluded through .gitignore, with an env.example template for teammates.
Uploaded the module to a fork of the team repository and prepared a pull request for review.
