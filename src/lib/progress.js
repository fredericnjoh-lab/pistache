const STORAGE_KEY = "pistache-polyglot-v1";

const defaultState = () => ({
  childName: "",
  startedAt: null,
  /** @type {Record<string, WordStat>} key = `${objectId}:${lang}` */
  words: {},
  /** Daily session logs: { date, items: [{key, heard, said, correct}] } */
  days: {},
  /** Custom parent recordings: { [key]: dataUrl } */
  recordings: {},
  /** Words quietly dropped after 3 miss days */
  dropped: {},
  settings: {
    sessionMinutes: 11,
    maxNewPerDay: 2,
  },
});

/**
 * @typedef {Object} WordStat
 * @property {string} objectId
 * @property {string} lang
 * @property {number} heardCount
 * @property {number} correctCount
 * @property {number} missCount
 * @property {string|null} lastHeard
 * @property {string|null} lastCorrect
 * @property {number} consecutiveMissDays
 * @property {boolean} introduced
 */

export function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function wordKey(objectId, lang) {
  return `${objectId}:${lang}`;
}

export function ensureWord(state, objectId, lang) {
  const key = wordKey(objectId, lang);
  if (!state.words[key]) {
    state.words[key] = {
      objectId,
      lang,
      heardCount: 0,
      correctCount: 0,
      missCount: 0,
      lastHeard: null,
      lastCorrect: null,
      consecutiveMissDays: 0,
      introduced: false,
    };
  }
  return state.words[key];
}

export function daysBetween(a, b) {
  const ms = new Date(b).setHours(12, 0, 0, 0) - new Date(a).setHours(12, 0, 0, 0);
  return Math.round(ms / 86400000);
}

export function getDayLog(state, date = todayKey()) {
  if (!state.days[date]) {
    state.days[date] = { date, items: [], dinnerWords: [], completed: false };
  }
  return state.days[date];
}

export function recordAttempt(state, { objectId, lang, correct, heard = true }) {
  const key = wordKey(objectId, lang);
  const w = ensureWord(state, objectId, lang);
  const today = todayKey();
  w.introduced = true;
  if (heard) {
    w.heardCount += 1;
    w.lastHeard = today;
  }
  if (correct) {
    w.correctCount += 1;
    w.lastCorrect = today;
    w.consecutiveMissDays = 0;
  } else {
    w.missCount += 1;
  }

  const day = getDayLog(state);
  day.items.push({
    key,
    objectId,
    lang,
    correct: !!correct,
    at: Date.now(),
  });
  saveState(state);
  return state;
}

export function finalizeDayMissStreaks(state, date = todayKey()) {
  const day = state.days[date];
  if (!day) return state;

  const attempted = {};
  const anyCorrect = {};
  for (const item of day.items) {
    attempted[item.key] = true;
    if (item.correct) anyCorrect[item.key] = true;
  }

  for (const key of Object.keys(attempted)) {
    const w = state.words[key];
    if (!w) continue;
    if (!anyCorrect[key]) {
      w.consecutiveMissDays = (w.consecutiveMissDays || 0) + 1;
    }
  }
  saveState(state);
  return state;
}

export function getProgressSeries(state) {
  const dates = Object.keys(state.days).sort();
  const langs = ["en", "es", "zh", "ja"];
  const series = Object.fromEntries(langs.map((l) => [l, []]));
  const cumul = Object.fromEntries(langs.map((l) => [l, 0]));

  if (!state.startedAt && dates.length === 0) {
    return { dates: [], series };
  }

  const start = state.startedAt || dates[0];
  const end = dates[dates.length - 1] || todayKey();
  const allDates = [];
  const cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    allDates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }

  for (const d of allDates) {
    const day = state.days[d];
    if (day) {
      for (const item of day.items) {
        if (item.correct) cumul[item.lang] = (cumul[item.lang] || 0) + 1;
      }
    }
    for (const lang of langs) {
      series[lang].push(cumul[lang]);
    }
  }
  return { dates: allDates, series };
}

export function resetAll() {
  localStorage.removeItem(STORAGE_KEY);
  return defaultState();
}
