/**
 * Smoke test for daily lesson engine
 */
import { buildDailyLesson, scheduleQuietMiss, parentOneLiner, pickDinnerWords, refreshDinnerFromSession } from "../src/lib/lessonEngine.js";
import {
  activeChild,
  addChild,
  loadFamily,
  loadState,
  recordAttempt,
  saveFamily,
  updateChild,
} from "../src/lib/progress.js";
import { sayText, OBJECT_BY_ID } from "../src/data/vocabulary.js";

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

for (let i = 0; i < 5; i++) {
  const item = lesson1[i];
  state = recordAttempt(state, { objectId: item.objectId, lang: item.lang, correct: i % 2 === 0 });
}

const dinner = pickDinnerWords(state, lesson1);
console.assert(dinner.length === 4, "four dinner words");
console.assert(dinner.every((d) => d.when && d.word), "dinner words complete");
console.assert(dinner[0].when.includes("table"), "dinner moments in French");

const line = parentOneLiner(state);
console.assert(typeof line === "string" && line.length > 10, "parent one-liner");
console.assert(/Alba|Belle|écoute|Pas encore/i.test(line), "one-liner in French");

state = refreshDinnerFromSession(state);
console.assert(state.days[Object.keys(state.days)[0]].dinnerWords.length === 4, "session dinner refresh");

const apple = OBJECT_BY_ID.apple;
console.assert(sayText(apple, "zh") === "苹果", "native mandarin TTS");
console.assert(sayText(apple, "ja") === "りんご", "native japanese TTS");
console.assert(sayText(apple, "en") === "apple", "english falls back to words");

// Migration ancien profil -> famille + isolation de deux enfants
const migrated = loadFamily();
console.assert(migrated.children.length === 1, "legacy profile migrates to family");
console.assert(activeChild(migrated).childName === "Alba", "migrated child keeps identity");
let family = addChild(migrated, { name: "Noé", age: 5, avatar: "🐼" });
console.assert(family.children.length === 2, "second child added");
const albaId = family.children[0].id;
const noeId = family.children[1].id;
family = updateChild(family, noeId, (child) => ({ ...child, startedAt: "2026-09-01" }));
console.assert(family.children.find((c) => c.id === albaId).startedAt !== "2026-09-01", "child progress isolated");
console.assert(family.children.find((c) => c.id === noeId).startedAt === "2026-09-01", "active child updated");
saveFamily(family);
console.assert(loadFamily().children.length === 2, "family persists");

let q = [...lesson1];
q = scheduleQuietMiss(q, 2, lesson1[2]);
console.assert(q.length === lesson1.length + 1, "quiet miss requeues");
console.assert(q.some((x) => x.reason === "quiet-miss"), "quiet miss tagged");

console.log("OK — lesson engine smoke passed");
console.log("  lesson size:", lesson1.length);
console.log("  sample:", lesson1.slice(0, 3).map((x) => `${x.objectId}:${x.lang}`).join(", "));
console.log("  dinner:", dinner.map((d) => `${d.word} · ${d.when}`).join(" | "));
console.log("  one-liner:", line);
