import React, { useEffect, useRef, useState } from "react";
import { OBJECT_BY_ID, sayText, LANGUAGES } from "../data/vocabulary.js";
import {
  speakWord,
  stopSpeaking,
  listenWithRetry,
  speechRecognitionSupported,
  matchesAccepted,
  playCelebrateChime,
  unlockAudio,
} from "../lib/speech.js";
import { scheduleQuietMiss } from "../lib/lessonEngine.js";
import { recordAttempt, wordKey } from "../lib/progress.js";

const PHASE_LABEL = {
  ready: "Touche l’image",
  playing: "Écoute…",
  listening: "À toi — dis le mot",
  celebrate: "Bravo !",
  model: "Écoute encore — on le reverra",
  leaving: "",
};

/** Les 3 temps de la boucle, montrés en direct */
const STEPS = [
  { id: "touch", icon: "👆", label: "Touche" },
  { id: "hear", icon: "🔊", label: "Écoute" },
  { id: "say", icon: "🗣️", label: "Redis" },
];

function activeStep(phase) {
  if (phase === "playing" || phase === "model") return "hear";
  if (phase === "listening") return "say";
  if (phase === "celebrate") return "say";
  return "touch";
}

/**
 * Écran enfant : une grande image, le mot écrit dessous, et une barre
 * de navigation toujours visible (retour, précédent, réécouter, suivant).
 */
export default function ChildPlay({
  state,
  setState,
  lesson,
  onLessonChange,
  onExit,
  onComplete,
}) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("ready");
  const [pulse, setPulse] = useState(false);
  const [slide, setSlide] = useState("in");
  const busy = useRef(false);
  const cancelled = useRef(false);
  const stateRef = useRef(state);
  const lessonRef = useRef(lesson);
  const wakeLock = useRef(null);
  const canListen = speechRecognitionSupported();

  stateRef.current = state;
  lessonRef.current = lesson;

  const item = lesson[index];
  const obj = item ? OBJECT_BY_ID[item.objectId] : null;
  const showLabels = state.settings?.showLabels !== false;

  useEffect(() => {
    unlockAudio();
    (async () => {
      try {
        if (navigator.wakeLock?.request) {
          wakeLock.current = await navigator.wakeLock.request("screen");
        }
      } catch {
        /* pas de wake lock sur iOS */
      }
    })();
    return () => {
      cancelled.current = true;
      stopSpeaking();
      wakeLock.current?.release?.().catch(() => {});
    };
  }, []);

  const leave = () => {
    cancelled.current = true;
    stopSpeaking();
    onExit();
  };

  if (!item || !obj) {
    return (
      <div className="child-stage done">
        <div className="child-done-card">
          <span className="big-emoji float" aria-hidden>
            🌟
          </span>
          <p>Boucle terminée</p>
          <button type="button" className="child-cta" onClick={onComplete}>
            Voir le résumé
          </button>
        </div>
      </div>
    );
  }

  const spoken = sayText(obj, item.lang);
  const targetWord = obj.words[item.lang];
  const frWord = obj.words.fr;
  const langMeta = LANGUAGES.find((l) => l.id === item.lang);
  const recording = state.recordings?.[wordKey(item.objectId, item.lang)];
  const stat = state.words?.[wordKey(item.objectId, item.lang)];
  const timesOk = stat?.correctCount || 0;

  const jumpTo = (nextIndex, nextLesson) => {
    const list = nextLesson || lessonRef.current;
    if (nextIndex < 0) return;
    if (nextIndex >= list.length) {
      setPhase("leaving");
      onComplete();
      return;
    }
    stopSpeaking();
    setSlide("out");
    setTimeout(() => {
      if (cancelled.current) return;
      setIndex(nextIndex);
      setSlide("in");
      setPhase("ready");
      busy.current = false;
    }, 160);
  };

  const goNext = (nextLesson) => jumpTo(index + 1, nextLesson);
  const goPrev = () => jumpTo(Math.max(0, index - 1));

  const replay = async (e) => {
    e?.stopPropagation?.();
    if (phase === "listening") return;
    unlockAudio();
    setPhase("playing");
    await speakWord({ text: spoken, lang: item.lang, recordingDataUrl: recording, rate: 0.8 });
    if (!cancelled.current) setPhase("ready");
  };

  const runTurn = async () => {
    if (busy.current) return;
    if (phase === "listening" || phase === "playing" || phase === "model") return;
    if (phase === "celebrate" || phase === "leaving") return;

    busy.current = true;
    unlockAudio();
    setPulse(true);
    setTimeout(() => setPulse(false), 380);
    setPhase("playing");

    await speakWord({ text: spoken, lang: item.lang, recordingDataUrl: recording, rate: 0.8 });
    await wait(400);
    if (cancelled.current) return;
    await speakWord({ text: spoken, lang: item.lang, recordingDataUrl: recording, rate: 0.88 });
    await wait(360);
    if (cancelled.current) return;

    setPhase("listening");

    let correct = false;
    if (canListen) {
      const result = await listenWithRetry({ lang: item.lang, timeoutMs: 4800 });
      const accepted = obj.accept?.[item.lang] || [targetWord, spoken];
      if (
        result.reason === "not-allowed" ||
        result.reason === "service-not-allowed" ||
        result.reason === "unsupported"
      ) {
        correct = await waitForAffirmTap(3200);
      } else {
        correct = result.ok && matchesAccepted(result.transcript, accepted, result.alternatives);
        if (!correct && (!result.transcript || result.reason === "timeout" || result.reason === "no-speech")) {
          correct = await waitForAffirmTap(2200);
        }
      }
    } else {
      correct = await waitForAffirmTap(3200);
    }
    if (cancelled.current) return;

    const nextState = recordAttempt({ ...stateRef.current }, {
      objectId: item.objectId,
      lang: item.lang,
      correct,
    });
    setState(nextState);
    stateRef.current = nextState;

    if (correct) {
      setPhase("celebrate");
      playCelebrateChime();
      await wait(700);
      if (cancelled.current) return;
      goNext();
    } else {
      setPhase("model");
      await speakWord({ text: spoken, lang: item.lang, recordingDataUrl: recording, rate: 0.78 });
      const requeued = scheduleQuietMiss(lessonRef.current, index, item);
      onLessonChange(requeued);
      lessonRef.current = requeued;
      await wait(500);
      if (cancelled.current) return;
      goNext(requeued);
    }
  };

  const total = lesson.length;
  const progress = total ? Math.min(1, (index + (phase === "celebrate" ? 1 : 0)) / total) : 0;

  return (
    <div className={`child-stage lang-${item.lang} phase-${phase}`} style={{ "--accent": obj.color }}>
      <div className="child-sky" />

      <header className="child-top">
        <button type="button" className="child-back" onClick={leave}>
          <span aria-hidden>‹</span> Quitter
        </button>
        <div className="child-count">
          <strong>{Math.min(index + 1, total)}</strong> / {total}
        </div>
        <div className="child-lang" style={{ background: langColor(item.lang) }}>
          {langMeta?.flag} {langMeta?.label}
        </div>
      </header>

      <div className="child-center">
        <button
          type="button"
          className={`picture-btn ${pulse ? "pulse" : ""} ${phase} slide-${slide}`}
          onClick={runTurn}
          aria-label={`Écouter et dire : ${targetWord}`}
        >
          <span className="big-emoji" aria-hidden>
            {obj.emoji}
          </span>
          {phase === "ready" && <span className="tap-hint" aria-hidden />}
          {phase === "listening" && <span className="mic-rings" aria-hidden />}
          {phase === "celebrate" && (
            <span className="sparkles" aria-hidden>
              ✨
            </span>
          )}
        </button>

        {showLabels && (
          <div className={`word-card slide-${slide}`}>
            <div className="word-target">{targetWord}</div>
            <div className="word-fr">{frWord}</div>
            {timesOk > 0 && (
              <div className="word-stars" aria-label={`${timesOk} fois réussi`}>
                {"★".repeat(Math.min(3, timesOk))}
                {"☆".repeat(Math.max(0, 3 - Math.min(3, timesOk)))}
              </div>
            )}
          </div>
        )}

        <p className={`phase-label ${phase}`}>{PHASE_LABEL[phase]}</p>

        <div className="step-track" aria-hidden>
          {STEPS.map((s) => (
            <span key={s.id} className={`step-chip ${activeStep(phase) === s.id ? "on" : ""}`}>
              <i>{s.icon}</i>
              {s.label}
            </span>
          ))}
        </div>
      </div>

      <div className="child-progress" aria-hidden>
        <div className="child-progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <nav className="child-bar" aria-label="Navigation">
        <button type="button" className="child-nav" onClick={goPrev} disabled={index === 0} aria-label="Mot précédent">
          ◀
        </button>
        <button type="button" className="child-nav wide" onClick={replay} aria-label="Réécouter le mot">
          🔊 Réécouter
        </button>
        <button type="button" className="child-nav" onClick={() => goNext()} aria-label="Mot suivant">
          ▶
        </button>
      </nav>
    </div>
  );
}

function langColor(lang) {
  return { en: "#2A9D8F", es: "#E76F51", zh: "#E9C46A", ja: "#264653" }[lang] || "#2A9D8F";
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function waitForAffirmTap(ms) {
  return new Promise((resolve) => {
    let affirmed = false;
    const onKey = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        affirmed = true;
        cleanup();
        resolve(true);
      }
    };
    const onClick = (e) => {
      // les commandes de navigation ne valident pas le mot
      if (e.target?.closest?.(".child-bar, .child-top")) return;
      affirmed = true;
      cleanup();
      resolve(true);
    };
    const cleanup = () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onClick, true);
      clearTimeout(t);
    };
    window.addEventListener("keydown", onKey);
    setTimeout(() => window.addEventListener("pointerdown", onClick, true), 220);
    const t = setTimeout(() => {
      cleanup();
      if (!affirmed) resolve(false);
    }, ms);
  });
}

export function ChildPlayStyles() {
  return (
    <style>{`
      .child-stage {
        position: fixed; inset: 0; z-index: 40;
        display: grid;
        grid-template-rows: auto 1fr auto auto;
        background: radial-gradient(ellipse at 30% 18%, #FFF6E0 0%, #E8F4F0 48%, #CDE8DF 100%);
        overflow: hidden; touch-action: manipulation;
        user-select: none; -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
      }
      .child-stage.done { place-items: center; grid-template-rows: 1fr; }
      .child-done-card {
        display: grid; gap: 14px; justify-items: center; text-align: center;
        font-family: var(--font-head); font-weight: 800; font-size: 22px; color: var(--sea);
      }
      .child-done-card p { margin: 0; }
      .child-cta {
        font-family: var(--font-head); font-weight: 800; font-size: 17px;
        background: linear-gradient(135deg, #2A9D8F, #1D7A6F); color: #fff;
        border: none; border-radius: 999px; padding: 14px 26px; cursor: pointer;
      }
      .child-sky {
        position: absolute; inset: 0; pointer-events: none;
        background:
          radial-gradient(circle at 88% 12%, rgba(255,220,120,.5), transparent 34%),
          radial-gradient(circle at 8% 78%, rgba(120,200,180,.35), transparent 42%);
      }

      .child-top {
        position: relative; z-index: 2;
        display: flex; align-items: center; justify-content: space-between; gap: 10px;
        padding: 12px 14px 4px;
      }
      .child-back {
        display: inline-flex; align-items: center; gap: 4px;
        font-family: var(--font-head); font-weight: 800; font-size: 15px;
        color: #1E2F33; background: rgba(255,255,255,.9);
        border: 1px solid rgba(38,70,83,.12); border-radius: 999px;
        padding: 10px 16px; min-height: 44px; cursor: pointer;
        box-shadow: 0 2px 10px rgba(38,70,83,.1);
      }
      .child-back span { font-size: 20px; line-height: 1; }
      .child-count {
        font-family: var(--font-head); font-weight: 700; font-size: 15px; color: #5C6B73;
        background: rgba(255,255,255,.75); border-radius: 999px; padding: 8px 14px;
      }
      .child-count strong { color: #1E2F33; font-size: 17px; }
      .child-lang {
        font-family: var(--font-body); font-weight: 800; font-size: 12px; color: #fff;
        border-radius: 999px; padding: 8px 12px; white-space: nowrap;
      }

      .child-center {
        position: relative; z-index: 1;
        display: grid; place-content: center; justify-items: center; gap: 14px;
        padding: 4px 16px;
      }
      .picture-btn {
        position: relative; border: none; cursor: pointer;
        width: min(58vw, 300px); height: min(58vw, 300px);
        max-width: 42vh; max-height: 42vh;
        border-radius: 50%; display: grid; place-items: center;
        background: linear-gradient(160deg, #fff 0%, color-mix(in srgb, var(--accent) 20%, #fff) 100%);
        box-shadow:
          0 0 0 12px color-mix(in srgb, var(--accent) 24%, transparent),
          0 24px 56px rgba(38, 70, 83, 0.18);
        transition: transform .26s ease, box-shadow .26s ease, opacity .16s ease;
      }
      .picture-btn.slide-out { opacity: 0; transform: scale(.92) translateY(10px); }
      .picture-btn.slide-in { opacity: 1; transform: scale(1); }
      .picture-btn.pulse { transform: scale(1.06); }
      .picture-btn.ready { animation: invite 2.4s ease-in-out infinite; }
      .picture-btn.listening {
        box-shadow:
          0 0 0 16px color-mix(in srgb, var(--accent) 38%, transparent),
          0 24px 56px rgba(38, 70, 83, 0.22);
        animation: breathe 1.35s ease-in-out infinite;
      }
      .picture-btn.celebrate { animation: popJoy .55s ease; }
      .big-emoji {
        font-size: min(30vw, 150px); line-height: 1;
        filter: drop-shadow(0 8px 16px rgba(0,0,0,.1));
      }
      .tap-hint {
        position: absolute; inset: -6%; border-radius: 50%;
        border: 3px dashed color-mix(in srgb, var(--accent) 45%, transparent);
        animation: ring 2.4s ease-out infinite; pointer-events: none;
      }
      .mic-rings::before, .mic-rings::after {
        content: ""; position: absolute; inset: -10%; border-radius: 50%;
        border: 3px solid color-mix(in srgb, var(--accent) 55%, transparent);
        animation: ring 1.5s ease-out infinite;
      }
      .mic-rings::after { animation-delay: .45s; }
      .sparkles {
        position: absolute; top: 4%; right: 8%; font-size: 44px;
        animation: floaty .9s ease-in-out infinite;
      }

      .word-card {
        display: grid; justify-items: center; gap: 2px; text-align: center;
        background: rgba(255,255,255,.88); border: 1px solid rgba(38,70,83,.1);
        border-radius: 20px; padding: 12px 26px; min-width: min(80vw, 300px);
        box-shadow: 0 6px 20px rgba(38,70,83,.08);
        transition: opacity .16s ease;
      }
      .word-card.slide-out { opacity: 0; }
      .word-target {
        font-family: var(--font-head); font-weight: 800;
        font-size: clamp(28px, 8vw, 44px); line-height: 1.1; color: #1E2F33;
        letter-spacing: -0.01em;
      }
      .word-fr {
        font-family: var(--font-body); font-weight: 700; font-size: 15px; color: #5C6B73;
      }
      .word-stars { font-size: 14px; color: #E9C46A; letter-spacing: 2px; margin-top: 2px; }

      .phase-label {
        margin: 0; font-family: var(--font-head); font-weight: 700; font-size: 16px;
        color: #5C6B73; min-height: 22px; text-align: center;
      }
      .phase-label.listening { color: #1D7A6F; }
      .phase-label.celebrate { color: #E76F51; }

      .step-track { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
      .step-chip {
        display: inline-flex; align-items: center; gap: 5px;
        font-family: var(--font-body); font-weight: 800; font-size: 12px;
        color: #8C9BA5; background: rgba(255,255,255,.6);
        border: 1px solid rgba(38,70,83,.08);
        border-radius: 999px; padding: 6px 11px;
        transition: color .2s, background .2s, transform .2s;
      }
      .step-chip i { font-style: normal; font-size: 14px; }
      .step-chip.on {
        color: #fff; background: var(--accent); border-color: transparent;
        transform: scale(1.06);
      }

      .child-progress {
        position: relative; z-index: 2;
        margin: 0 14% 10px; height: 10px; border-radius: 99px;
        background: rgba(38,70,83,.12); overflow: hidden;
      }
      .child-progress-fill {
        height: 100%; border-radius: 99px;
        background: linear-gradient(90deg, #2A9D8F, #E9C46A);
        transition: width .45s ease;
      }

      .child-bar {
        position: relative; z-index: 2;
        display: flex; gap: 10px; justify-content: center; align-items: center;
        padding: 0 14px 16px;
      }
      .child-nav {
        min-height: 52px; min-width: 62px;
        font-family: var(--font-head); font-weight: 800; font-size: 18px; color: #1E2F33;
        background: rgba(255,255,255,.92); border: 1px solid rgba(38,70,83,.12);
        border-radius: 18px; cursor: pointer;
        box-shadow: 0 2px 10px rgba(38,70,83,.08);
      }
      .child-nav.wide { flex: 1; max-width: 220px; font-size: 16px; }
      .child-nav:disabled { opacity: .35; cursor: default; }
      .child-nav:active:not(:disabled) { transform: scale(.97); }

      @keyframes invite { 0%,100% { transform: scale(1); } 50% { transform: scale(1.035); } }
      @keyframes breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.035); } }
      @keyframes ring {
        0% { transform: scale(.9); opacity: .65; }
        100% { transform: scale(1.18); opacity: 0; }
      }
      @keyframes popJoy {
        0% { transform: scale(1); } 40% { transform: scale(1.14); } 100% { transform: scale(1); }
      }
      @keyframes floaty {
        0%,100% { transform: translateY(0) rotate(-6deg); }
        50% { transform: translateY(-12px) rotate(6deg); }
      }
      .float { animation: floaty 2.2s ease-in-out infinite; }

      @media (max-height: 620px) {
        .picture-btn { width: min(42vw, 200px); height: min(42vw, 200px); }
        .big-emoji { font-size: min(22vw, 100px); }
        .word-target { font-size: clamp(24px, 7vw, 34px); }
      }
      @media (prefers-reduced-motion: reduce) {
        .picture-btn.ready, .picture-btn.listening, .tap-hint,
        .mic-rings::before, .mic-rings::after, .sparkles, .float { animation: none !important; }
      }
    `}</style>
  );
}
