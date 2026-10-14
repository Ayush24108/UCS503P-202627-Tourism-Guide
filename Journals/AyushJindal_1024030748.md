# Weekly Work Journal

## Week 1: Project Planning and Documentation


### Work Done

Took part in team discussions to finalize the idea for the Tourism Guide Planner.
Identified the problems tourists face while planning trips, such as finding suitable destinations, organizing itineraries, and getting reliable travel information.
Helped define the project scope and main features: historical place information, guide booking, and an AI chatbot.
Contributed to the initial project proposal.

### Outcome

Gained a clear understanding of the project's objectives, features, target users, and system requirements.

## Week 2: Understanding LLMs and the AI Chatbot

### Work Done

Studied Large Language Models (LLMs) and how they are used in real-world applications.
Learned that an application can use an existing LLM through an API instead of building a language model from scratch.
Identified an LLM-powered chatbot as a useful addition to the project, letting tourists ask questions about destinations, attractions, and travel plans in natural language.

### Outcome

Developed a basic understanding of LLMs and their role in AI applications.
Helped refine the AI component of the project and planned its implementation.

## Week 3: Exploring LLM API Integration

### Work Done

Explored how an application sends user queries to an LLM API and receives generated responses.
Tried different tourism-related queries to see how relevant the responses were.
Explored basic prompt structuring so the model acts as a tourism assistant instead of giving generic answers.

### Outcome

Gained hands-on experience with API requests and responses when interacting with an LLM.
Built an early understanding that served as the foundation for the full chatbot implementation in Week 4.

## Week 4: Chatbot Implementation and Repository Submission


### Work Done

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

## Week 5: Debugging, Testing and Backend Preparation of the Chatbot

### Work Done

Reviewed the chatbot files and the chat page on the website, and found two problems: every itinerary request returned the same plan, and some facts were wrong.
Found three gaps in the chatbot module: it assumed a place was already selected, it took the number of days from outside instead of from the tourist’s message, and it did not check the places in the AI’s itinerary against the database.
Updated the chatbot to:
find the place from the tourist’s own words, including spelling variants like “Amber Fort” and follow-up questions like “when was it built?”
read the city, number of days, interests and start time from the message
plan only with places from the requested city
remove made-up or repeated places from the AI’s itinerary
Added three new features: travel-time estimates between two places (calculated from map coordinates instead of guessed by the AI), general travel advice answers, and support for trips covering more than one city.
Fixed an API failure caused by Groq retiring the model we used (404 error). Read Groq’s deprecation notice, switched to the recommended replacement model, and made the model name a setting in the .env file so future changes need no code edit. Also added a 20-second request timeout and clearer error messages.
Built a test suite with 37 scenarios: single-day and multi-day itineraries, place facts, travel time, general advice, and edge cases such as an unknown city, an unknown place, an empty message, an off-topic request and a prompt-injection attempt. Results are shown as PASS, FAIL, WARN or REVIEW, and the suite waits and retries automatically when the API rate limit is hit.
Ran the suite on the real model: 35 of 37 cases passed, 1 failed, and there were 3 soft warnings about the AI’s wording.
Prepared the backend integration: a controller and route (POST /api/chatbot, login required) that load places from MongoDB, pass them to the chatbot, and return an honest error instead of a fake reply if the chatbot fails. Tested it against a simulated database, with all 18 checks passing.

 ### Outcome

The chatbot now handles four request types (place facts, itineraries, travel time and general advice) and gives different, checked results for different queries.
Learned about handling retired API models, rate limits and timeouts, validating AI output against real data, building a structured test suite, and how grounding works: answers are only as correct as the facts stored in the database.
Next steps: review the 1 failed case and 3 warnings, ask the backend teammate to add coordinates, category, visit duration and area to HistoricalPlace, verify the database facts against reliable sources, and merge the chatbot route and connect it to the frontend.
