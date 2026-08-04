# Study Assistant

An AI-powered study tool built with React. Paste your notes or a topic, and the app generates interactive flashcards and quizzes — powered by structured JSON output from an LLM, not a chatbot.

## Features

- 📝 Paste free-form notes or a topic
- 🃏 Auto-generated flashcards (flip to reveal answers)
- ❓ Auto-generated quiz with instant scoring
- 🔁 Re-test only the questions you got wrong
- ⚠️ Graceful handling of bad/slow/failed AI responses
- 📱 Fully responsive (mobile-friendly)

## Tech Stack

- **Frontend:** React (hooks, functional components) + [Vite / Next.js — *update this*]
- **Styling:** [Tailwind CSS / plain CSS — *update this*]
- **AI Provider:** [Gemini / Groq / OpenRouter / OpenAI — *update this*]
- **Backend:** Node.js/Express (serverless-style route) — used only to keep the API key off the client

## Setup & Installation

1. Clone the repo
   ```bash
   git clone <your-repo-url>
   cd study-assistant
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Add your API key
   Create a `.env` file in the root (never commit this file):
   ```
   AI_API_KEY=your_api_key_here
   ```

4. Run the app
   ```bash
   npm run dev
   ```
   App will be available at `http://localhost:5173` (or `http://localhost:3000` if using Next.js).

## How It Works

1. User pastes notes or types a topic into the input box.
2. The app sends the text to a small backend route (`/api/generate`), which calls the AI model with a prompt instructing it to return **strict JSON** — either a flashcard array or a quiz question array (with question, options, correct answer).
3. The backend forwards the AI's response back to the frontend.
4. The frontend parses the JSON and renders it as interactive components:
   - **Flashcard mode:** click/tap to flip between question and answer.
   - **Quiz mode:** select an answer, get instant feedback, see a final score, and retake only the questions answered incorrectly.

## Handling Bad AI Output

Since AI output is unpredictable, the app defends against:

- **Malformed JSON** — response is validated before rendering; on failure, the user sees a clear error message with a **Retry** button instead of a crash.
- **Wrong shape** — if required fields are missing, the app falls back to an error state rather than rendering broken UI.
- **Empty response** — shown as an "empty state" prompting the user to try again with different input.
- **Slow/failed requests** — a loading state is shown; failed requests surface a retry option.
- **Stale responses** — each request is tagged with an ID/timestamp; if a newer request is in flight, an older response arriving late is discarded so it can't overwrite fresher data.

## AI Usage Note

I used [Claude / ChatGPT ] to help with:
Scaffolding the initial component structure (notes input, flashcard view, quiz view, state management)
Drafting the prompt for structured JSON output (converting raw notes into flashcard Q&A pairs and multiple-choice quiz questions)
Debugging edge cases in parsing AI responses — handling malformed/inconsistent JSON when the model didn't strictly follow the schema

All code was reviewed, understood, and modified by me — I can walk through and extend any part of it.

## Known Limitations

Quiz supports only multiple-choice questions, not fill-in-the-blank or short answer
No persistence — refreshing the page clears current flashcards/quiz session
Smaller/free-tier models occasionally produce inconsistent JSON on very long notes, requiring a retry or manual fix
No support for image-based notes — text input only

## Time Spent

Approximately **[2] hours**, broken down roughly as:
- Planning & setup: 30min
- AI integration & prompt design: 30min
- UI/UX (flashcards, quiz, states): 20min
- Error handling & edge cases: 30min
- Polish & README: 20min


