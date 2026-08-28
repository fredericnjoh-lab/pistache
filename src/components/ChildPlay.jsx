import React, { useEffect, useRef, useState } from "react";
import { OBJECT_BY_ID } from "../data/vocabulary.js";
import { speakWord, stopSpeaking, listenOnce, speechRecognitionSupported, matchesAccepted } from "../lib/speech.js";
import { scheduleQuietMiss } from "../lib/lessonEngine.js";
import { recordAttempt, wordKey } from "../lib/progress.js";

/**
 * Child mode: one big picture, no text, no scores, no menus.
 * Flow: idle picture → tap → hear word → listen → soft celebrate or quiet requeue.
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
  const [phase, setPhase] = useState("ready"); // ready | playing | listening | celebrate | miss
  const [pulse, setPulse] = useState(false);
  const busy = useRef(false);
  const canListen = speechRecognitionSupported();

  const item = lesson[index];
  const obj = item ? OBJECT_BY_ID[item.objectId] : null;
  const progress = lesson.length ? (index + (phase === "celebrate" ? 1 : 0)) / lesson.length : 0;

  useEffect(() => () => stopSpeaking(), []);

  if (!item || !obj) {
    return (
      <div className="child-stage done">
        <button type="button" className="big-emoji float" onClick={onComplete} aria-label="Done">
          🌟
        </button>
        <div className="soft-glow" />
      </div>
    );
  }

  const word = obj.words[item.lang];
  const recording = state.recordings?.[wordKey(item.objectId, item.lang)];

  const advance = (nextLesson = lesson) => {
    const next = index + 1;
    if (next >= nextLesson.length) {
      onComplete();
      return;
    }
    setIndex(next);
    setPhase("ready");
    busy.current = false;
  };

  const handleTap = async () => {
    if (busy.current || phase === "listening" || phase === "playing") return;
    busy.current = true;
    setPulse(true);
    setTimeout(() => setPulse(false), 400);
    setPhase("playing");

    await speakWord({ text: word, lang: item.lang, recordingDataUrl: recording });

    // Brief pause then listen
    await wait(350);
    setPhase("listening");

    let correct = false;
    if (canListen) {
      const result = await listenOnce({ lang: item.lang, timeoutMs: 4500 });
      const accepted = obj.accept?.[item.lang] || [word];
      correct = result.ok && matchesAccepted(result.transcript, accepted);
    } else {
      // Old iPad without speech recognition: parent/child double-tap affirms
      correct = await waitForAffirmTap(2800);
    }

    const nextState = recordAttempt({ ...state }, {
      objectId: item.objectId,
      lang: item.lang,
      correct,
    });
    setState(nextState);

    if (correct) {
      setPhase("celebrate");
      await speakWord({ text: softYes(item.lang), lang: item.lang, rate: 1 });
      await wait(500);
      advance();
    } else {
      // No buzzers — quiet miss: reappear ~3 turns later + continue
      setPhase("miss");
      const requeued = scheduleQuietMiss(lesson, index, item);
      onLessonChange(requeued);
      await wait(600);
      advance(requeued);
    }
  };

  return (
    <div
      className={`child-stage lang-${item.lang}`}
      style={{ "--accent": obj.color }}
      onClick={handleTap}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleTap()}
      aria-label="Tap the picture"
    >
      <div className="child-sky" />
      <div className={`picture-wrap ${pulse ? "pulse" : ""} ${phase}`}>
        <span className="big-emoji" aria-hidden>
          {obj.emoji}
        </span>
        {phase === "listening" && <div className="mic-rings" aria-hidden />}
        {phase === "celebrate" && <div className="sparkles" aria-hidden>✨</div>}
      </div>

      {/* Language color dot only — no readable text for the child */}
      <div className="lang-dot" style={{ background: langColor(item.lang) }} aria-hidden />

      <div className="child-progress" aria-hidden>
        <div className="child-progress-fill" style={{ width: `${Math.min(100, progress * 100)}%` }} />
      </div>

      {/* Hidden parent escape — long-press corner */}
      <button
        type="button"
        className="parent-exit"
        aria-label="Parent exit"
        onClick={(e) => {
          e.stopPropagation();
          stopSpeaking();
          onExit();
        }}
      />
    </div>
  );
}

function langColor(lang) {
  return { en: "#2A9D8F", es: "#E76F51", zh: "#E9C46A", ja: "#264653" }[lang] || "#2A9D8F";
}

function softYes(lang) {
  return { en: "yes", es: "sí", zh: "hǎo", ja: "hai" }[lang] || "yes";
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
    const onClick = () => {
      affirmed = true;
      cleanup();
      resolve(true);
    };
    const cleanup = () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick, true);
      clearTimeout(t);
    };
    window.addEventListener("keydown", onKey);
    // Second tap during listen window = "I said it"
    setTimeout(() => window.addEventListener("click", onClick, true), 200);
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
        background: radial-gradient(ellipse at 30% 20%, #FFF6E0 0%, #E8F4F0 45%, #D4EBE3 100%);
        overflow: hidden; cursor: pointer; touch-action: manipulation;
        user-select: none; -webkit-user-select: none;
      }
      .child-stage.done { background: radial-gradient(circle at 50% 40%, #FFF3C4, #E8F4F0 70%); }
      .child-sky {
        position: absolute; inset: 0;
        background:
          radial-gradient(circle at 85% 15%, rgba(255,220,120,.45), transparent 35%),
          radial-gradient(circle at 10% 80%, rgba(120,200,180,.3), transparent 40%);
        pointer-events: none;
      }
      .picture-wrap {
        position: relative;
        width: min(72vw, 420px); height: min(72vw, 420px);
        border-radius: 50%;
        display: grid; place-items: center;
        background: linear-gradient(160deg, #fff 0%, color-mix(in srgb, var(--accent) 18%, #fff) 100%);
        box-shadow:
          0 0 0 12px color-mix(in srgb, var(--accent) 22%, transparent),
          0 24px 60px rgba(38, 70, 83, 0.18);
        transition: transform .25s ease, box-shadow .25s ease;
      }
      .picture-wrap.pulse { transform: scale(1.06); }
      .picture-wrap.listening {
        box-shadow:
          0 0 0 16px color-mix(in srgb, var(--accent) 35%, transparent),
          0 24px 60px rgba(38, 70, 83, 0.2);
        animation: breathe 1.4s ease-in-out infinite;
      }
      .picture-wrap.celebrate { animation: popJoy .5s ease; }
      .big-emoji {
        font-size: min(38vw, 210px); line-height: 1;
        filter: drop-shadow(0 8px 16px rgba(0,0,0,.08));
      }
      .mic-rings::before, .mic-rings::after {
        content: ""; position: absolute; inset: -8%; border-radius: 50%;
        border: 3px solid color-mix(in srgb, var(--accent) 50%, transparent);
        animation: ring 1.6s ease-out infinite;
      }
      .mic-rings::after { animation-delay: .5s; }
      .sparkles {
        position: absolute; top: 8%; right: 12%; font-size: 48px;
        animation: floaty 1s ease-in-out infinite;
      }
      .lang-dot {
        position: absolute; top: max(18px, env(safe-area-inset-top));
        right: 22px; width: 14px; height: 14px; border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(255,255,255,.7);
      }
      .child-progress {
        position: absolute; left: 12%; right: 12%; bottom: max(28px, env(safe-area-inset-bottom));
        height: 8px; border-radius: 99px; background: rgba(38,70,83,.12); overflow: hidden;
      }
      .child-progress-fill {
        height: 100%; border-radius: 99px;
        background: linear-gradient(90deg, #2A9D8F, #E9C46A);
        transition: width .4s ease;
      }
      .parent-exit {
        position: absolute; top: 0; left: 0; width: 56px; height: 56px;
        opacity: 0; border: none; background: transparent; cursor: pointer;
      }
      @keyframes breathe {
        0%,100% { transform: scale(1); }
        50% { transform: scale(1.03); }
      }
      @keyframes ring {
        0% { transform: scale(.92); opacity: .7; }
        100% { transform: scale(1.15); opacity: 0; }
      }
      @keyframes popJoy {
        0% { transform: scale(1); }
        40% { transform: scale(1.12); }
        100% { transform: scale(1); }
      }
      @keyframes floaty {
        0%,100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      .float { animation: floaty 2.2s ease-in-out infinite; border: none; background: transparent; cursor: pointer; }
      @media (prefers-reduced-motion: reduce) {
        .picture-wrap.listening, .mic-rings::before, .mic-rings::after, .sparkles, .float { animation: none !important; }
      }
    `}</style>
  );
}
