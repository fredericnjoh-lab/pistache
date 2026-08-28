import { LANGUAGES } from "../data/vocabulary.js";

let voicesCache = [];

function refreshVoices() {
  if (typeof speechSynthesis === "undefined") return [];
  voicesCache = speechSynthesis.getVoices();
  return voicesCache;
}

if (typeof window !== "undefined" && typeof speechSynthesis !== "undefined") {
  refreshVoices();
  speechSynthesis.onvoiceschanged = refreshVoices;
}

export function findVoice(langId) {
  const voices = voicesCache.length ? voicesCache : refreshVoices();
  const meta = LANGUAGES.find((l) => l.id === langId);
  if (!meta) return null;
  for (const hint of meta.voiceHints) {
    const match = voices.find((v) => v.lang?.toLowerCase().startsWith(hint.toLowerCase()));
    if (match) return match;
  }
  return null;
}

/**
 * Speak a word. Prefer parent recording (data URL), else device TTS.
 */
export function speakWord({ text, lang, recordingDataUrl, rate = 0.85 }) {
  return new Promise((resolve) => {
    if (recordingDataUrl) {
      const audio = new Audio(recordingDataUrl);
      audio.onended = () => resolve("recording");
      audio.onerror = () => resolve(speakTts(text, lang, rate));
      audio.play().catch(() => resolve(speakTts(text, lang, rate)));
      return;
    }
    resolve(speakTts(text, lang, rate));
  });
}

function speakTts(text, lang, rate) {
  return new Promise((resolve) => {
    if (typeof speechSynthesis === "undefined") {
      resolve("unavailable");
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = findVoice(lang);
    if (voice) u.voice = voice;
    const meta = LANGUAGES.find((l) => l.id === lang);
    u.lang = meta?.voiceHints[0] || "en-US";
    u.rate = rate;
    u.pitch = 1.05;
    u.onend = () => resolve("tts");
    u.onerror = () => resolve("error");
    speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

export function speechRecognitionSupported() {
  return !!(
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  );
}

/**
 * Listen for one short utterance. Returns transcript or null.
 * Soft matching is done by the caller.
 */
export function listenOnce({ lang, timeoutMs = 5000 }) {
  return new Promise((resolve) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      resolve({ ok: false, reason: "unsupported", transcript: "" });
      return;
    }

    const rec = new SR();
    const meta = LANGUAGES.find((l) => l.id === lang);
    rec.lang = meta?.voiceHints[0] || "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 3;
    rec.continuous = false;

    let done = false;
    const finish = (result) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      resolve(result);
    };

    const timer = setTimeout(() => finish({ ok: false, reason: "timeout", transcript: "" }), timeoutMs);

    rec.onresult = (event) => {
      const alts = [];
      for (let i = 0; i < event.results[0].length; i++) {
        alts.push(event.results[0][i].transcript);
      }
      finish({ ok: true, transcript: alts[0] || "", alternatives: alts });
    };
    rec.onerror = (e) => finish({ ok: false, reason: e.error || "error", transcript: "" });
    rec.onend = () => {
      if (!done) finish({ ok: false, reason: "ended", transcript: "" });
    };

    try {
      rec.start();
    } catch (e) {
      finish({ ok: false, reason: String(e), transcript: "" });
    }
  });
}

/** Normalize for fuzzy toddler matching */
export function normalizeSpeech(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9fff\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesAccepted(transcript, acceptedList) {
  const said = normalizeSpeech(transcript);
  if (!said) return false;
  return acceptedList.some((a) => {
    const target = normalizeSpeech(a);
    if (!target) return false;
    if (said === target) return true;
    if (said.includes(target) || target.includes(said)) return true;
    // tiny edit distance for short words
    if (target.length <= 8 && levenshtein(said, target) <= 1) return true;
    return false;
  });
}

function levenshtein(a, b) {
  const m = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) m[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + cost);
    }
  }
  return m[a.length][b.length];
}

export async function recordParentClip(maxMs = 2500) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);

  return new Promise((resolve, reject) => {
    recorder.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    };
    recorder.onerror = reject;
    recorder.start();
    setTimeout(() => {
      if (recorder.state === "recording") recorder.stop();
    }, maxMs);
  });
}
