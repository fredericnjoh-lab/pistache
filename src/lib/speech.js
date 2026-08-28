import { LANGUAGES } from "../data/vocabulary.js";

let voicesCache = [];
let audioCtx = null;

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
    const match =
      voices.find((v) => v.lang?.toLowerCase() === hint.toLowerCase()) ||
      voices.find((v) => v.lang?.toLowerCase().startsWith(hint.toLowerCase()));
    if (match) return match;
  }
  return null;
}

export function unlockAudio() {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    // Warm TTS on iOS (must be in user gesture)
    if (typeof speechSynthesis !== "undefined") {
      const warm = new SpeechSynthesisUtterance(" ");
      warm.volume = 0;
      speechSynthesis.speak(warm);
      speechSynthesis.cancel();
    }
  } catch {
    /* ignore */
  }
}

/** Soft positive chime — never a buzzer */
export function playCelebrateChime() {
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    const now = audioCtx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02 + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35 + i * 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + 0.45 + i * 0.08);
    });
  } catch {
    /* ignore */
  }
}

/**
 * Speak a word. Prefer parent recording, else device TTS (native script via `text`).
 */
export function speakWord({ text, lang, recordingDataUrl, rate = 0.82 }) {
  return new Promise((resolve) => {
    if (recordingDataUrl) {
      const audio = new Audio(recordingDataUrl);
      audio.onended = () => resolve("recording");
      audio.onerror = () => {
        speakTts(text, lang, rate).then(resolve);
      };
      audio.play().catch(() => {
        speakTts(text, lang, rate).then(resolve);
      });
      return;
    }
    speakTts(text, lang, rate).then(resolve);
  });
}

function speakTts(text, lang, rate) {
  return new Promise((resolve) => {
    if (typeof speechSynthesis === "undefined") {
      resolve("unavailable");
      return;
    }
    speechSynthesis.cancel();
    let done = false;
    const finish = (v) => {
      if (done) return;
      done = true;
      resolve(v);
    };
    // Tiny delay helps some iOS builds after cancel
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(text);
      const voice = findVoice(lang);
      if (voice) u.voice = voice;
      const meta = LANGUAGES.find((l) => l.id === lang);
      u.lang = meta?.voiceHints[0] || "en-US";
      u.rate = rate;
      u.pitch = 1.08;
      u.onend = () => finish("tts");
      u.onerror = () => finish("error");
      speechSynthesis.speak(u);
      // Safety: some browsers never fire onend
      setTimeout(() => finish("tts-timeout"), Math.max(2500, text.length * 420));
    }, 40);
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
 * Listen once. Returns { ok, transcript, alternatives, reason }.
 */
export function listenOnce({ lang, timeoutMs = 5500 }) {
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
    rec.maxAlternatives = 5;
    rec.continuous = false;

    let done = false;
    const finish = (result) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        rec.abort();
      } catch {
        try {
          rec.stop();
        } catch {
          /* ignore */
        }
      }
      resolve(result);
    };

    const timer = setTimeout(
      () => finish({ ok: false, reason: "timeout", transcript: "" }),
      timeoutMs
    );

    rec.onresult = (event) => {
      const alts = [];
      for (let i = 0; i < event.results[0].length; i++) {
        alts.push(event.results[0][i].transcript);
      }
      finish({ ok: true, transcript: alts[0] || "", alternatives: alts });
    };
    rec.onerror = (e) =>
      finish({ ok: false, reason: e.error || "error", transcript: "" });
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

/** Listen, and if empty/timeout, give one more chance (toddlers hesitate). */
export async function listenWithRetry({ lang, timeoutMs = 5000 }) {
  const first = await listenOnce({ lang, timeoutMs });
  if (first.ok && first.transcript) return first;
  if (first.reason === "not-allowed" || first.reason === "service-not-allowed") {
    return first;
  }
  await wait(280);
  return listenOnce({ lang, timeoutMs: timeoutMs + 800 });
}

export function normalizeSpeech(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9fff\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesAccepted(transcript, acceptedList, alternatives = []) {
  const candidates = [transcript, ...(alternatives || [])];
  return candidates.some((raw) => {
    const said = normalizeSpeech(raw);
    if (!said) return false;
    return acceptedList.some((a) => {
      const target = normalizeSpeech(a);
      if (!target) return false;
      if (said === target) return true;
      if (said.includes(target) || target.includes(said)) return true;
      const maxDist = target.length <= 4 ? 1 : target.length <= 8 ? 2 : 2;
      if (levenshtein(said, target) <= maxDist) return true;
      return false;
    });
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

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function recordParentClip(maxMs = 2200) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : MediaRecorder.isTypeSupported("audio/mp4")
      ? "audio/mp4"
      : "";
  const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  const chunks = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
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

export async function ensureMicPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}
