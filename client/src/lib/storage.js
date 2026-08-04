const SESSION_KEY = 'study-assistant:session';
const THEME_KEY = 'study-assistant:theme';

export function saveSession({ notes, data }) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ notes, data, savedAt: Date.now() }));
  } catch {
    // localStorage can fail (private browsing, quota) — losing the save isn't fatal.
  }
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.data) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function loadTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  } catch {
    return 'dark';
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}
