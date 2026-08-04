require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';
const REQUEST_TIMEOUT_MS = 30000;
const MAX_INPUT_LENGTH = 8000;
const MAX_INSTRUCTION_LENGTH = 500;

// Wide open by default (fine for local dev / grading). In production, set
// CLIENT_ORIGIN to your deployed frontend URL (comma-separate for multiple)
// to restrict which sites can call this API.
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : {}));
app.use(express.json({ limit: '1mb' }));

const JSON_SHAPE = `{
  "flashcards": [{ "front": "short question or term", "back": "concise answer" }],
  "quiz": [{ "question": "...", "options": ["...", "...", "...", "..."], "answerIndex": 0, "explanation": "one line explaining the correct answer" }]
}`;

function buildGeneratePrompt(userText) {
  return `You are a study assistant. Read the user's notes or topic and turn them into study material.
Return ONLY a JSON object with this exact shape and nothing else (no markdown fences, no commentary):

${JSON_SHAPE}

Rules:
- Generate 6 to 10 flashcards and 5 to 8 quiz questions.
- Each quiz question needs exactly 4 options and answerIndex must be the 0-based index of the correct option.
- Base everything strictly on the provided notes/topic. Do not invent facts that contradict the source text.
- Keep flashcard answers and quiz explanations short (1-2 sentences).

Notes/topic from the user:
"""
${userText}
"""`;
}

function buildRefinePrompt(currentData, instruction) {
  return `You are a study assistant. A study set (flashcards + quiz) already exists as JSON below.
The user wants a specific change made to it. Apply ONLY the requested change — keep every other
flashcard and quiz question exactly as they are, in the same order, unless the instruction clearly
requires reordering or resizing the set.

Return ONLY a JSON object with this exact shape and nothing else (no markdown fences, no commentary):

${JSON_SHAPE}

Current study set:
"""
${JSON.stringify(currentData)}
"""

Requested change:
"""
${instruction}
"""`;
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Calls Gemini with a prompt, enforces JSON output, and returns the parsed
 * object. Throws an HttpError with a user-safe message on any failure — the
 * caller turns that into an HTTP response.
 */
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new HttpError(500, 'Server is missing GEMINI_API_KEY. Add it to server/.env and restart.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('Gemini API error', response.status, body);
      throw new HttpError(502, 'The AI service returned an error. Please try again in a moment.');
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText || !rawText.trim()) {
      throw new HttpError(502, 'The AI returned an empty response. Please try again.');
    }

    try {
      return JSON.parse(rawText);
    } catch (err) {
      console.error('Failed to parse model output as JSON:', rawText);
      throw new HttpError(502, 'The AI returned data in an unexpected format. Please try again.');
    }
  } catch (err) {
    if (err instanceof HttpError) throw err;
    if (err.name === 'AbortError') {
      throw new HttpError(504, 'The AI took too long to respond. Please try again.');
    }
    console.error('Unexpected error calling Gemini:', err);
    throw new HttpError(500, 'Something went wrong on the server. Please try again.');
  } finally {
    clearTimeout(timeout);
  }
}

app.post('/api/generate', async (req, res) => {
  const text = req.body && req.body.text;

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Please paste some notes or type a topic first.' });
  }
  if (text.length > MAX_INPUT_LENGTH) {
    return res.status(400).json({ error: `That's too long. Please keep it under ${MAX_INPUT_LENGTH} characters.` });
  }

  try {
    const parsed = await callGemini(buildGeneratePrompt(text.trim()));
    return res.json(parsed);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

// Refinement loop: edits the existing study set in place instead of
// regenerating from scratch. The current data + a short instruction go to
// the model together, so it only has to change what's asked.
app.post('/api/refine', async (req, res) => {
  const { current, instruction } = req.body || {};

  if (!current || (!Array.isArray(current.flashcards) && !Array.isArray(current.quiz))) {
    return res.status(400).json({ error: 'Nothing to refine yet — generate a study set first.' });
  }
  if (!instruction || typeof instruction !== 'string' || !instruction.trim()) {
    return res.status(400).json({ error: 'Please describe what you want changed.' });
  }
  if (instruction.length > MAX_INSTRUCTION_LENGTH) {
    return res.status(400).json({ error: `Keep the instruction under ${MAX_INSTRUCTION_LENGTH} characters.` });
  }

  try {
    const parsed = await callGemini(buildRefinePrompt(current, instruction.trim()));
    return res.json(parsed);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Study assistant server running on http://localhost:${PORT}`);
});