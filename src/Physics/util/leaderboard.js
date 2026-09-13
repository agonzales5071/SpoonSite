const STORAGE_VERSION = 1;
const MAX_ENTRIES = 10;

function storageKey(gameKey) {
  return `spoondrop:${gameKey}:scores`;
}

export function getScores(gameKey) {
  try {
    const raw = localStorage.getItem(storageKey(gameKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.entries)) {
      return []; // unknown/old schema treat as empty
    }
    return parsed.entries;
  } catch {
    return []; // corrupted value fail safe
  }
}

export function getPersonalBest(gameKey) {
  const entries = getScores(gameKey);
  return entries.length > 0 ? entries[0].score : null;
}

export function recordScore(gameKey, score, initials = null) {
  const entries = getScores(gameKey);
  const newEntry = { score, date: new Date().toISOString(), initials };

  const updated = [...entries, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(
      storageKey(gameKey),
      JSON.stringify({ version: STORAGE_VERSION, entries: updated })
    );
  } catch {
    // storage full or unavailable  doesn't persist
  }

  const isNewBest = updated[0] === newEntry;
  return { topScores: updated, personalBest: updated[0].score, isNewBest };
}