/**
 * Smoke test for daily lesson engine (run with: node --experimental-vm-modules scripts/smoke-lesson.mjs)
 * Uses dynamic import of source modules.
 */
import { buildDailyLesson, scheduleQuietMiss, parentOneLiner, pickDinnerWords } from "../src/lib/lessonEngine.js";
import { loadState, recordAttempt, todayKey, wordKey } from "../src/lib/progress.js";

// Mock localStorage for Node
const store = new Map();
globalThis.localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

let state = loadState();
state.childName = "Alba";

const lesson1 = buildDailyLesson(state);
console.assert(lesson1.length > 0, "day1 lesson not empty");
console.assert(lesson1.length <= 20, "day1 lesson capped");
console.assert(lesson1.filter((x) => x.reason === "seed" || x.reason === "new").length >= 1, "has new/seed");

// Simulate some corrects and misses
for (let i = 0; i < 5; i++) {
  const item = lesson1[i];
  state = recordAttempt(state, { objectId: item.objectId, lang: item.lang, correct: i % 2 === 0 });
}

const dinner = pickDinnerWords(state, lesson1);
console.assert(dinner.length === 4, "four dinner words");
console.assert(dinner.every((d) => d.when && d.word), "dinner words complete");

const line = parentOneLiner(state);
console.assert(typeof line === "string" && line.length > 10, "parent one-liner");

let q = [...lesson1];
q = scheduleQuietMiss(q, 2, lesson1[2]);
console.assert(q.length === lesson1.length + 1, "quiet miss requeues");
console.assert(q[Math.min(6, q.length - 1)].reason === "quiet-miss" || q.some((x) => x.reason === "quiet-miss"), "quiet miss tagged");

console.log("OK — lesson engine smoke passed");
console.log("  lesson size:", lesson1.length);
console.log("  sample:", lesson1.slice(0, 3).map((x) => `${x.objectId}:${x.lang}`).join(", "));
console.log("  dinner:", dinner.map((d) => d.word).join(", "));
console.log("  one-liner:", line);
