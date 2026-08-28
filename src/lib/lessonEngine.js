import { OBJECTS, EASY_ALTERNATES, OBJECT_BY_ID, LANGUAGES } from "../data/vocabulary.js";
import {
  ensureWord,
  wordKey,
  todayKey,
  daysBetween,
  getDayLog,
  saveState,
} from "./progress.js";

/**
 * Prompt 02 — The Daily Lesson
 * Priority:
 *  1. Yesterday's misses first
 *  2. Words not heard in four days
 *  3. At most two brand-new words
 * Drop any word missed three days in a row; swap for an easier object in same language.
 *
 * Target ~11 minutes: ~18–22 turns at ~30s each (tap, hear, speak, celebrate).
 */
const TARGET_TURNS = 20;

function yesterdayKey(today = todayKey()) {
  const d = new Date(today);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function getMissesForDay(state, date) {
  const day = state.days[date];
  if (!day) return [];
  const byKey = {};
  for (const item of day.items) {
    if (!byKey[item.key]) byKey[item.key] = { ...item, anyCorrect: false };
    if (item.correct) byKey[item.key].anyCorrect = true;
  }
  return Object.values(byKey)
    .filter((x) => !x.anyCorrect)
    .map((x) => ({ objectId: x.objectId, lang: x.lang, key: x.key, reason: "yesterday-miss" }));
}

function notHeardInDays(state, days, today = todayKey()) {
  const out = [];
  for (const obj of OBJECTS) {
    for (const lang of LANGUAGES) {
      const key = wordKey(obj.id, lang.id);
      if (state.dropped[key]) continue;
      const w = state.words[key];
      if (!w || !w.introduced) continue;
      if (!w.lastHeard || daysBetween(w.lastHeard, today) >= days) {
        out.push({ objectId: obj.id, lang: lang.id, key, reason: "stale" });
      }
    }
  }
  return out;
}

function introducedCount(state) {
  return Object.values(state.words).filter((w) => w.introduced).length;
}

function pickNewWords(state, count, excludeKeys) {
  const candidates = [];
  // Prefer easier/common objects first (front of list), rotate languages
  const langOrder = ["en", "es", "zh", "ja"];
  for (const obj of OBJECTS) {
    for (const lang of langOrder) {
      const key = wordKey(obj.id, lang);
      if (excludeKeys.has(key) || state.dropped[key]) continue;
      const w = state.words[key];
      if (w?.introduced) continue;
      candidates.push({ objectId: obj.id, lang, key, reason: "new" });
    }
  }
  return candidates.slice(0, count);
}

function applyDrops(state) {
  for (const [key, w] of Object.entries(state.words)) {
    if (w.consecutiveMissDays >= 3 && !state.dropped[key]) {
      const alt = EASY_ALTERNATES[w.objectId];
      state.dropped[key] = {
        at: todayKey(),
        replacedBy: alt ? wordKey(alt, w.lang) : null,
      };
    }
  }
}

function maybeReplaceDropped(item, state) {
  const drop = state.dropped[item.key];
  if (!drop?.replacedBy) return item;
  const [objectId, lang] = drop.replacedBy.split(":");
  if (!OBJECT_BY_ID[objectId]) return item;
  return {
    objectId,
    lang,
    key: drop.replacedBy,
    reason: "easier-swap",
  };
}

function interleave(items) {
  // Soft spacing: if same object appears twice, push gap of ~3
  const result = [];
  const queue = [...items];
  while (queue.length) {
    let placed = false;
    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      const recent = result.slice(-3).some((r) => r.objectId === item.objectId && r.lang === item.lang);
      if (!recent || queue.length <= 3) {
        result.push(item);
        queue.splice(i, 1);
        placed = true;
        break;
      }
    }
    if (!placed) result.push(queue.shift());
  }
  return result;
}

/**
 * Quiet miss: re-queue the same word three turns later within the session.
 */
export function scheduleQuietMiss(queue, currentIndex, item) {
  const insertAt = Math.min(currentIndex + 4, queue.length);
  const copy = {
    ...item,
    reason: "quiet-miss",
    soft: true,
  };
  const next = [...queue];
  next.splice(insertAt, 0, copy);
  return next;
}

export function buildDailyLesson(state) {
  applyDrops(state);
  const today = todayKey();
  const day = getDayLog(state, today);

  if (day.lesson?.length && !day.forceRebuild) {
    return day.lesson;
  }

  const selected = [];
  const used = new Set();

  const add = (item) => {
    const fixed = maybeReplaceDropped(item, state);
    if (used.has(fixed.key)) return false;
    if (state.dropped[fixed.key] && !fixed.reason?.includes("swap")) return false;
    used.add(fixed.key);
    ensureWord(state, fixed.objectId, fixed.lang);
    selected.push(fixed);
    return true;
  };

  // 1. Yesterday's misses
  for (const m of getMissesForDay(state, yesterdayKey(today))) {
    if (selected.length >= TARGET_TURNS) break;
    add(m);
  }

  // 2. Not heard in 4 days
  for (const m of notHeardInDays(state, 4, today)) {
    if (selected.length >= TARGET_TURNS - 2) break;
    add(m);
  }

  // 3. At most 2 new words
  const news = pickNewWords(state, state.settings?.maxNewPerDay ?? 2, used);
  for (const n of news) add(n);

  // Fill remaining with rotation of introduced words (all 4 langs, varied)
  if (selected.length < TARGET_TURNS) {
    const pool = [];
    for (const obj of OBJECTS) {
      for (const lang of LANGUAGES) {
        const key = wordKey(obj.id, lang.id);
        if (used.has(key) || state.dropped[key]) continue;
        const w = state.words[key];
        if (w?.introduced) {
          pool.push({ objectId: obj.id, lang: lang.id, key, reason: "rotation" });
        }
      }
    }
    // Prefer lower correct rates
    pool.sort((a, b) => {
      const wa = state.words[a.key];
      const wb = state.words[b.key];
      const ra = wa.heardCount ? wa.correctCount / wa.heardCount : 0;
      const rb = wb.heardCount ? wb.correctCount / wb.heardCount : 0;
      return ra - rb;
    });
    for (const p of pool) {
      if (selected.length >= TARGET_TURNS) break;
      add(p);
    }
  }

  // Bootstrap day 1: seed first lesson with one language per early object
  if (selected.length === 0 || introducedCount(state) === 0) {
    const seed = [
      { objectId: "apple", lang: "en" },
      { objectId: "dog", lang: "es" },
      { objectId: "water", lang: "zh" },
      { objectId: "shoe", lang: "ja" },
      { objectId: "ball", lang: "en" },
      { objectId: "cat", lang: "es" },
      { objectId: "sun", lang: "zh" },
      { objectId: "hand", lang: "ja" },
      { objectId: "cup", lang: "en" },
      { objectId: "door", lang: "es" },
      { objectId: "flower", lang: "zh" },
      { objectId: "car", lang: "ja" },
      { objectId: "banana", lang: "en" },
      { objectId: "book", lang: "es" },
      { objectId: "moon", lang: "zh" },
      { objectId: "tree", lang: "ja" },
      { objectId: "milk", lang: "en" },
      { objectId: "fish", lang: "es" },
      { objectId: "star", lang: "zh" },
      { objectId: "eye", lang: "ja" },
    ];
    selected.length = 0;
    used.clear();
    for (const s of seed) {
      add({ ...s, key: wordKey(s.objectId, s.lang), reason: "seed" });
    }
  }

  const lesson = interleave(selected).slice(0, TARGET_TURNS);
  day.lesson = lesson;
  day.dinnerWords = pickDinnerWords(state, lesson);
  day.forceRebuild = false;
  if (!state.startedAt) state.startedAt = today;
  saveState(state);
  return lesson;
}

/**
 * Four specific words for parents to say at dinner, with when to say them.
 */
export function pickDinnerWords(state, lesson) {
  const picks = [];
  const seenObj = new Set();

  // Prefer misses and new words from today's lesson
  const ranked = [...lesson].sort((a, b) => {
    const score = (x) =>
      (x.reason === "yesterday-miss" || x.reason === "quiet-miss" ? 3 : 0) +
      (x.reason === "new" || x.reason === "seed" ? 2 : 0) +
      (x.reason === "stale" ? 1 : 0);
    return score(b) - score(a);
  });

  const moments = [
    "en s’asseyant à table",
    "quand tu tends l’eau",
    "au moment du dessert",
    "en disant bonne nuit",
  ];

  for (const item of ranked) {
    if (picks.length >= 4) break;
    if (seenObj.has(item.objectId)) continue;
    seenObj.add(item.objectId);
    const obj = OBJECT_BY_ID[item.objectId];
    const lang = LANGUAGES.find((l) => l.id === item.lang);
    picks.push({
      objectId: item.objectId,
      lang: item.lang,
      word: obj.words[item.lang],
      emoji: obj.emoji,
      language: lang?.label || item.lang,
      when: moments[picks.length],
    });
  }
  return picks;
}

/** Recalcule les 4 mots du dîner à partir de la vraie session du jour */
export function refreshDinnerFromSession(state, date = todayKey()) {
  const day = getDayLog(state, date);
  if (!day.items?.length) return state;

  const byKey = {};
  for (const item of day.items) {
    if (!byKey[item.key]) {
      byKey[item.key] = { objectId: item.objectId, lang: item.lang, key: item.key, hits: 0, misses: 0 };
    }
    if (item.correct) byKey[item.key].hits += 1;
    else byKey[item.key].misses += 1;
  }

  const ranked = Object.values(byKey)
    .map((x) => ({
      ...x,
      reason: x.misses > x.hits ? "yesterday-miss" : x.hits ? "rotation" : "new",
    }))
    .sort((a, b) => b.misses - a.misses || a.hits - b.hits);

  day.dinnerWords = pickDinnerWords(state, ranked);
  saveState(state);
  return state;
}

export function parentOneLiner(state, date = todayKey()) {
  const day = state.days[date];
  const name = state.childName || "Ton enfant";
  if (!day?.items?.length) {
    return `Pas encore de mots aujourd’hui — onze minutes suffisent.`;
  }

  const byKey = {};
  for (const item of day.items) {
    if (!byKey[item.key]) byKey[item.key] = { ...item, hits: 0, misses: 0 };
    if (item.correct) byKey[item.key].hits += 1;
    else byKey[item.key].misses += 1;
  }

  const has = Object.values(byKey).filter((x) => x.hits > 0);
  const lacks = Object.values(byKey).filter((x) => x.hits === 0 && x.misses > 0);

  const fmt = (x) => {
    const obj = OBJECT_BY_ID[x.objectId];
    const word = obj?.words[x.lang] || x.objectId;
    const lang = LANGUAGES.find((l) => l.id === x.lang)?.label || x.lang;
    return `${word} (${lang})`;
  };

  if (has.length && lacks.length) {
    return `${name} a ${fmt(has[0])} mais pas encore ${fmt(lacks[0])}.`;
  }
  if (has.length) {
    return `Belle journée — ${fmt(has[0])} a accroché. Ressers-le au dîner.`;
  }
  return `Journée d’écoute — rien forcé. Jour 21 : rester le cap.`;
}
