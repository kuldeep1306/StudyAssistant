const REQUEST_TIMEOUT_MS = 28000;

async function postJson(path, payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('The AI took too long to respond. Please try again.');
    }
    throw new Error('Could not reach the server. Is it running?');
  } finally {
    clearTimeout(timeoutId);
  }

  let body = null;
  try {
    body = await response.json();
  } catch {
    throw new Error('Received an invalid response from the server.');
  }

  if (!response.ok) {
    throw new Error(body?.error || 'The server returned an error.');
  }

  return body;
}

/**
 * Calls our own backend (never the AI provider directly) so the API key
 * never reaches the browser.
 */
export async function fetchStudyMaterial(text) {
  const body = await postJson('/api/generate', { text });
  return sanitizeStudyData(body);
}

/**
 * Refinement loop: sends the current study set + a plain-English instruction
 * so the model edits it in place instead of the app regenerating everything
 * from the original notes.
 */
export async function fetchRefinement(current, instruction) {
  const body = await postJson('/api/refine', { current, instruction });
  return sanitizeStudyData(body);
}

/**
 * The model is asked to return structured JSON, but small/free models can still
 * send the wrong shape, partial data, or extra junk fields. Rather than reject
 * the whole response, we salvage every well-formed item and drop the rest.
 * We only throw if nothing usable survives.
 */
export function sanitizeStudyData(raw) {
  const flashcards = Array.isArray(raw?.flashcards)
    ? raw.flashcards
        .filter(
          (c) =>
            c &&
            typeof c.front === 'string' &&
            c.front.trim() &&
            typeof c.back === 'string' &&
            c.back.trim()
        )
        .map((c, i) => ({
          id: `card-${i}`,
          front: c.front.trim(),
          back: c.back.trim(),
        }))
    : [];

  const quiz = Array.isArray(raw?.quiz)
    ? raw.quiz
        .filter(
          (q) =>
            q &&
            typeof q.question === 'string' &&
            q.question.trim() &&
            Array.isArray(q.options) &&
            q.options.length >= 2 &&
            q.options.every((o) => typeof o === 'string' && o.trim()) &&
            Number.isInteger(q.answerIndex) &&
            q.answerIndex >= 0 &&
            q.answerIndex < q.options.length
        )
        .map((q, i) => ({
          id: `q-${i}`,
          question: q.question.trim(),
          options: q.options.map((o) => o.trim()),
          answerIndex: q.answerIndex,
          explanation: typeof q.explanation === 'string' ? q.explanation.trim() : '',
        }))
    : [];

  if (flashcards.length === 0 && quiz.length === 0) {
    throw new Error(
      "The AI didn't return any usable flashcards or quiz questions. Try again, or use different notes."
    );
  }

  return { flashcards, quiz };
}
