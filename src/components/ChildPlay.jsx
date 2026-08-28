import React, { useEffect, useRef, useState } from "react";
import { OBJECT_BY_ID, sayText } from "../data/vocabulary.js";
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

/**
 * Mode enfant : une seule grande image, zéro texte lisible.
 * Tap → entendre 2× → dire → célébration douce ou refile silencieuse.
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
  const [phase, setPhase] = useState("ready"); // ready | playing | listening | celebrate | model | leaving
  const [pulse, setPulse] = useState(false);
  const [slide, setSlide] = useState("in");
  const busy = useRef(false);
  const stateRef = useRef(state);
  const lessonRef = useRef(lesson);
  const wakeLock = useRef(null);
  const canListen = speechRecognitionSupported();

  stateRef.current = state;
  lessonRef.current = lesson;

  const item = lesson[index];
  const obj = item ? OBJECT_BY_ID[item.objectId] : null;
  const progress = lesson.length
    ? Math.min(1, (index + (phase === "celebrate" ? 1 : 0)) / lesson.length)
    : 0;

  useEffect(() => {
    unlockAudio();
    let released = false;
    (async () => {
      try {
        if (navigator.wakeLock?.request) {
          wakeLock.current = await navigator.wakeLock.request("screen");
        }
      } catch {
        /* ancien iPad : pas de wake lock */
      }
    })();
    return () => {
      released = true;
      stopSpeaking();
      wakeLock.current?.release?.().catch(() => {});
      void released;
    };
  }, []);

  // Sortie parent : appui long (~600ms) OU 3 taps rapides dans le coin
  const exitTimer = useRef(null);
  const exitTaps = useRef([]);
  const startExitHold = (e) => {
    e.stopPropagation();
    e.preventDefault();
    exitTimer.current = setTimeout(() => {
      stopSpeaking();
      onExit();
    }, 600);
  };
  const cancelExitHold = (e) => {
    e?.stopPropagation?.();
    clearTimeout(exitTimer.current);
  };
  const tapExitCorner = (e) => {
    e.stopPropagation();
    const now = Date.now();
    exitTaps.current = [...exitTaps.current.filter((t) => now - t < 1100), now];
    if (exitTaps.current.length >= 3) {
      exitTaps.current = [];
      clearTimeout(exitTimer.current);
      stopSpeaking();
      onExit();
    }
  };

  if (!item || !obj) {
    return (
      <div className="child-stage done">
        <button type="button" className="big-emoji float" onClick={onComplete} aria-label="Terminé">
          🌟
        </button>
      </div>
    );
  }

  const spoken = sayText(obj, item.lang);
  const recording = state.recordings?.[wordKey(item.objectId, item.lang)];

  const goNext = async (nextLesson) => {
    const list = nextLesson || lessonRef.current;
    const next = index + 1;
    if (next >= list.length) {
      setPhase("leaving");
      onComplete();
      return;
    }
    setSlide("out");
    await wait(180);
    setIndex(next);
    setSlide("in");
    setPhase("ready");
    busy.current = false;
  };

  const handleTap = async () => {
    if (busy.current || phase === "listening" || phase === "playing" || phase === "model") return;
    if (phase === "celebrate" || phase === "leaving") return;
    busy.current = true;
    unlockAudio();
    setPulse(true);
    setTimeout(() => setPulse(false), 380);
    setPhase("playing");

    // Entendre deux fois — les tout-petits ont besoin de la répétition
    await speakWord({ text: spoken, lang: item.lang, recordingDataUrl: recording, rate: 0.8 });
    await wait(420);
    await speakWord({ text: spoken, lang: item.lang, recordingDataUrl: recording, rate: 0.88 });
    await wait(380);

    setPhase("listening");

    let correct = false;
    let usedFallback = false;

    if (canListen) {
      const result = await listenWithRetry({ lang: item.lang, timeoutMs: 4800 });
      const accepted = obj.accept?.[item.lang] || [obj.words[item.lang], spoken];
      if (result.reason === "not-allowed" || result.reason === "service-not-allowed" || result.reason === "unsupported") {
        usedFallback = true;
        correct = await waitForAffirmTap(3200);
      } else {
        correct = result.ok && matchesAccepted(result.transcript, accepted, result.alternatives);
        // Si silence total, une 2e chance via tap parent (pas un échec sec)
        if (!correct && (!result.transcript || result.reason === "timeout" || result.reason === "no-speech")) {
          correct = await waitForAffirmTap(2200);
          usedFallback = correct;
        }
      }
    } else {
      usedFallback = true;
      correct = await waitForAffirmTap(3200);
    }

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
      await wait(650);
      await goNext();
    } else {
      // Pas de buzzer : remodeler le mot, puis refile silencieuse dans ~3 tours
      setPhase("model");
      await speakWord({ text: spoken, lang: item.lang, recordingDataUrl: recording, rate: 0.78 });
      const requeued = scheduleQuietMiss(lessonRef.current, index, item);
      onLessonChange(requeued);
      lessonRef.current = requeued;
      await wait(500);
      await goNext(requeued);
    }
    void usedFallback;
  };

  return (
    <div
      className={`child-stage lang-${item.lang} phase-${phase}`}
      style={{ "--accent": obj.color }}
      onClick={handleTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleTap();
      }}
      aria-label="Toucher l'image"
    >
      <div className="child-sky" />
      <div className={`picture-wrap ${pulse ? "pulse" : ""} ${phase} slide-${slide}`}>
        <span className="big-emoji" aria-hidden>
          {obj.emoji}
        </span>
        {phase === "ready" && <div className="tap-hint" aria-hidden />}
        {phase === "listening" && <div className="mic-rings" aria-hidden />}
        {phase === "celebrate" && (
          <div className="sparkles" aria-hidden>
            ✨
          </div>
        )}
      </div>

      <div className="lang-dot" style={{ background: langColor(item.lang) }} aria-hidden />

      <div className="child-progress" aria-hidden>
        <div className="child-progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <button
        type="button"
        className="parent-exit"
        aria-label="Sortie parent — appuyer longuement ou taper 3 fois"
        onPointerDown={startExitHold}
        onPointerUp={cancelExitHold}
        onPointerLeave={cancelExitHold}
        onPointerCancel={cancelExitHold}
        onClick={tapExitCorner}
      />
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
      // ignorer le coin sortie parent
      if (e.target?.closest?.(".parent-exit")) return;
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
        display: grid; place-items: center;
        background: radial-gradient(ellipse at 30% 18%, #FFF6E0 0%, #E8F4F0 48%, #CDE8DF 100%);
        overflow: hidden; cursor: pointer; touch-action: manipulation;
        user-select: none; -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
      .child-stage.done { background: radial-gradient(circle at 50% 40%, #FFF3C4, #E8F4F0 70%); }
      .child-sky {
        position: absolute; inset: 0; pointer-events: none;
        background:
          radial-gradient(circle at 88% 12%, rgba(255,220,120,.5), transparent 34%),
          radial-gradient(circle at 8% 78%, rgba(120,200,180,.35), transparent 42%);
      }
      .picture-wrap {
        position: relative;
        width: min(74vw, 440px); height: min(74vw, 440px);
        max-width: 86vh; max-height: 86vh;
        border-radius: 50%;
        display: grid; place-items: center;
        background: linear-gradient(160deg, #fff 0%, color-mix(in srgb, var(--accent) 20%, #fff) 100%);
        box-shadow:
          0 0 0 14px color-mix(in srgb, var(--accent) 24%, transparent),
          0 28px 64px rgba(38, 70, 83, 0.18);
        transition: transform .28s ease, box-shadow .28s ease, opacity .18s ease;
      }
      .picture-wrap.slide-out { opacity: 0; transform: scale(.92) translateY(12px); }
      .picture-wrap.slide-in { opacity: 1; transform: scale(1); }
      .picture-wrap.pulse { transform: scale(1.07); }
      .picture-wrap.ready { animation: invite 2.4s ease-in-out infinite; }
      .picture-wrap.listening {
        box-shadow:
          0 0 0 18px color-mix(in srgb, var(--accent) 38%, transparent),
          0 28px 64px rgba(38, 70, 83, 0.22);
        animation: breathe 1.35s ease-in-out infinite;
      }
      .picture-wrap.celebrate { animation: popJoy .55s ease; }
      .picture-wrap.model {
        box-shadow:
          0 0 0 14px color-mix(in srgb, var(--accent) 18%, transparent),
          0 20px 40px rgba(38, 70, 83, 0.12);
      }
      .big-emoji {
        font-size: min(40vw, 220px); line-height: 1;
        filter: drop-shadow(0 10px 18px rgba(0,0,0,.1));
      }
      .tap-hint {
        position: absolute; inset: -6%; border-radius: 50%;
        border: 3px dashed color-mix(in srgb, var(--accent) 45%, transparent);
        animation: ring 2.4s ease-out infinite;
        pointer-events: none;
      }
      .mic-rings::before, .mic-rings::after {
        content: ""; position: absolute; inset: -10%; border-radius: 50%;
        border: 3px solid color-mix(in srgb, var(--accent) 55%, transparent);
        animation: ring 1.5s ease-out infinite;
      }
      .mic-rings::after { animation-delay: .45s; }
      .sparkles {
        position: absolute; top: 6%; right: 10%; font-size: 52px;
        animation: floaty .9s ease-in-out infinite;
      }
      .lang-dot {
        position: absolute; top: max(18px, env(safe-area-inset-top));
        right: 22px; width: 16px; height: 16px; border-radius: 50%;
        box-shadow: 0 0 0 5px rgba(255,255,255,.75);
      }
      .child-progress {
        position: absolute; left: 12%; right: 12%;
        bottom: max(28px, env(safe-area-inset-bottom));
        height: 10px; border-radius: 99px; background: rgba(38,70,83,.12); overflow: hidden;
      }
      .child-progress-fill {
        height: 100%; border-radius: 99px;
        background: linear-gradient(90deg, #2A9D8F, #E9C46A);
        transition: width .45s ease;
      }
      .parent-exit {
        position: absolute; top: 0; left: 0; width: 88px; height: 88px;
        opacity: 0.01; border: none; background: transparent; cursor: pointer;
        z-index: 5; touch-action: manipulation;
      }
      @keyframes invite {
        0%,100% { transform: scale(1); }
        50% { transform: scale(1.035); }
      }
      @keyframes breathe {
        0%,100% { transform: scale(1); }
        50% { transform: scale(1.035); }
      }
      @keyframes ring {
        0% { transform: scale(.9); opacity: .65; }
        100% { transform: scale(1.18); opacity: 0; }
      }
      @keyframes popJoy {
        0% { transform: scale(1); }
        40% { transform: scale(1.14); }
        100% { transform: scale(1); }
      }
      @keyframes floaty {
        0%,100% { transform: translateY(0) rotate(-6deg); }
        50% { transform: translateY(-12px) rotate(6deg); }
      }
      .float { animation: floaty 2.2s ease-in-out infinite; border: none; background: transparent; cursor: pointer; }
      @media (prefers-reduced-motion: reduce) {
        .picture-wrap.ready, .picture-wrap.listening, .tap-hint,
        .mic-rings::before, .mic-rings::after, .sparkles, .float { animation: none !important; }
      }
    `}</style>
  );
}
