import React, { useCallback, useEffect, useState } from "react";
import ChildPlay, { ChildPlayStyles } from "./components/ChildPlay.jsx";
import { ProgressChart, ParentSummary, VocabGrid, DinnerWords } from "./components/ParentPanels.jsx";
import { loadState, saveState, todayKey, finalizeDayMissStreaks, resetAll } from "./lib/progress.js";
import { buildDailyLesson } from "./lib/lessonEngine.js";
import { recordParentClip, speechRecognitionSupported } from "./lib/speech.js";
import { OBJECT_BY_ID, LANGUAGES } from "./data/vocabulary.js";

/**
 * Pistache Polyglot — voice-first language loop for ages 3–6.
 * Child screen: no text, no menus, no scores.
 * Parent screen: daily lesson, dinner words, quiet progress.
 */
export default function App() {
  const [state, setState] = useState(() => loadState());
  const [view, setView] = useState("home"); // home | play | done | vocab | chart
  const [lesson, setLesson] = useState([]);
  const [recording, setRecording] = useState(null); // {objectId, lang} while recording
  const canListen = speechRecognitionSupported();

  useEffect(() => {
    saveState(state);
  }, [state]);

  const day = state.days[todayKey()];
  const childName = state.childName || "your little one";

  const startLesson = useCallback(() => {
    const next = { ...state };
    if (!next.startedAt) next.startedAt = todayKey();
    const built = buildDailyLesson(next);
    setState({ ...next });
    setLesson(built);
    setView("play");
  }, [state]);

  const completeLesson = useCallback(() => {
    const next = finalizeDayMissStreaks({ ...state });
    const d = next.days[todayKey()];
    if (d) d.completed = true;
    // Refresh dinner words from today's attempts
    const rebuilt = buildDailyLesson(next);
    void rebuilt;
    setState({ ...next });
    setView("done");
  }, [state]);

  const handleRecord = async (objectId, lang) => {
    setRecording({ objectId, lang });
    try {
      const dataUrl = await recordParentClip(2200);
      const key = `${objectId}:${lang}`;
      setState((s) => ({
        ...s,
        recordings: { ...s.recordings, [key]: dataUrl },
      }));
    } catch {
      /* mic denied — TTS still works */
    } finally {
      setRecording(null);
    }
  };

  return (
    <div className="app">
      <GlobalStyles />
      <ChildPlayStyles />

      {view === "play" && (
        <ChildPlay
          state={state}
          setState={setState}
          lesson={lesson}
          onLessonChange={setLesson}
          onExit={() => setView("home")}
          onComplete={completeLesson}
        />
      )}

      {view !== "play" && (
        <>
          <header className="top">
            <div className="brand">
              <span className="brand-mark" aria-hidden>🌿</span>
              <div>
                <div className="brand-name">Pistache</div>
                <div className="brand-tag">four languages · sound first</div>
              </div>
            </div>
            <nav className="nav">
              {[
                { id: "home", label: "Today" },
                { id: "chart", label: "Days" },
                { id: "vocab", label: "Voices" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={view === t.id || (view === "done" && t.id === "home") ? "active" : ""}
                  onClick={() => setView(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </header>

          <main className="main">
            {(view === "home" || view === "done") && (
              <section className="hero-block">
                <p className="eyebrow">The daily loop · ~11 minutes</p>
                <h1>Same 30 words. All four languages. No reading required.</h1>
                <p className="lede">
                  {childName} taps one big picture, hears Mum or Dad (or the device), says it back.
                  Misses come back quietly — never a buzzer.
                </p>

                {!state.childName && (
                  <label className="name-field">
                    Her name
                    <input
                      value={state.childName}
                      placeholder="e.g. Alba"
                      onChange={(e) => setState((s) => ({ ...s, childName: e.target.value }))}
                    />
                  </label>
                )}

                <div className="cta-row">
                  <button type="button" className="cta" onClick={startLesson}>
                    {day?.completed ? "Practice again" : "Start today’s loop"}
                  </button>
                  {!canListen && (
                    <p className="hint">
                      This iPad can’t hear her — during listening, tap the picture again after she speaks.
                    </p>
                  )}
                </div>

                {view === "done" && (
                  <div className="done-panel pop">
                    <h2>Loop done</h2>
                    <ParentSummary state={state} />
                  </div>
                )}

                {view === "home" && day?.dinnerWords?.length > 0 && !day.completed && (
                  <DinnerWords words={day.dinnerWords} />
                )}

                {view === "home" && day?.completed && <ParentSummary state={state} />}
              </section>
            )}

            {view === "chart" && (
              <section>
                <ProgressChart state={state} />
                <div className="myth">
                  <h3>Nothing happens for three weeks</h3>
                  <p>
                    She may give nothing back at first. That quiet stretch is the point — ears before mouth.
                    Around day 21 the lines tend to turn together.
                  </p>
                </div>
              </section>
            )}

            {view === "vocab" && (
              <section>
                <h2 className="section-title">Mum & Dad voices</h2>
                <p className="lede tight">
                  Tap a chip to record that word in your voice (~2 seconds). Everything else uses the iPad’s speech.
                  Works offline once loaded.
                </p>
                {recording && (
                  <p className="recording-banner pop">
                    Recording {OBJECT_BY_ID[recording.objectId]?.emoji}{" "}
                    {OBJECT_BY_ID[recording.objectId]?.words[recording.lang]} (
                    {LANGUAGES.find((l) => l.id === recording.lang)?.label})…
                  </p>
                )}
                <VocabGrid state={state} onRecord={handleRecord} />
                <button
                  type="button"
                  className="ghost danger"
                  onClick={() => {
                    if (confirm("Reset all progress on this device?")) {
                      setState(resetAll());
                      setView("home");
                    }
                  }}
                >
                  Reset progress
                </button>
              </section>
            )}
          </main>
        </>
      )}
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@500;600;700;800&display=swap');

      :root {
        --paper: #E8F4F0;
        --ink: #1E2F33;
        --ink-soft: #5C6B73;
        --mint: #2A9D8F;
        --mint-deep: #1D7A6F;
        --sun: #E9C46A;
        --coral: #E76F51;
        --sea: #264653;
        --card: rgba(255,255,255,.72);
        --font-head: 'Baloo 2', system-ui, sans-serif;
        --font-body: 'Nunito', system-ui, sans-serif;
      }

      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: var(--font-body);
        color: var(--ink);
        background:
          radial-gradient(ellipse at 0% 0%, #FFF6D6 0%, transparent 42%),
          radial-gradient(ellipse at 100% 10%, #CDEDE4 0%, transparent 40%),
          linear-gradient(180deg, #F3FAF7 0%, #E8F4F0 50%, #D9EFE8 100%);
        min-height: 100vh;
      }
      button, input { font: inherit; }
      button:focus-visible, input:focus-visible { outline: 3px solid var(--mint); outline-offset: 2px; }

      .app { min-height: 100vh; }
      .top {
        position: sticky; top: 0; z-index: 5;
        backdrop-filter: blur(10px);
        background: color-mix(in srgb, #F3FAF7 80%, transparent);
        border-bottom: 1px solid rgba(38,70,83,.08);
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 18px; gap: 12px; flex-wrap: wrap;
      }
      .brand { display: flex; align-items: center; gap: 10px; }
      .brand-mark { font-size: 28px; }
      .brand-name {
        font-family: var(--font-head); font-weight: 800; font-size: 22px;
        color: var(--mint-deep); letter-spacing: -0.02em; line-height: 1;
      }
      .brand-tag { font-size: 12px; font-weight: 700; color: var(--ink-soft); }
      .nav { display: flex; gap: 6px; }
      .nav button {
        border: none; background: transparent; color: var(--ink-soft);
        font-family: var(--font-head); font-weight: 700; font-size: 14px;
        padding: 8px 14px; border-radius: 999px; cursor: pointer;
      }
      .nav button.active { background: #fff; color: var(--mint-deep); box-shadow: 0 2px 10px rgba(38,70,83,.08); }

      .main {
        max-width: 720px; margin: 0 auto;
        padding: 28px 18px 80px;
      }
      .hero-block { display: grid; gap: 16px; }
      .eyebrow {
        margin: 0; font-weight: 800; font-size: 12px; letter-spacing: .08em;
        text-transform: uppercase; color: var(--coral);
      }
      h1 {
        margin: 0; font-family: var(--font-head); font-weight: 800;
        font-size: clamp(28px, 6vw, 40px); line-height: 1.1; letter-spacing: -0.02em;
        max-width: 16ch;
      }
      h2, h3 { font-family: var(--font-head); font-weight: 800; margin: 0; }
      .lede { margin: 0; font-size: 16px; line-height: 1.55; color: var(--ink-soft); max-width: 42ch; }
      .lede.tight { margin-bottom: 12px; }
      .section-title { font-size: 26px; margin-bottom: 6px; }

      .name-field {
        display: grid; gap: 6px; font-weight: 800; font-size: 13px; color: var(--ink-soft);
        max-width: 280px;
      }
      .name-field input {
        padding: 12px 14px; border-radius: 14px; border: 1.5px solid rgba(38,70,83,.15);
        background: #fff; font-weight: 700; color: var(--ink);
      }

      .cta-row { display: grid; gap: 10px; justify-items: start; }
      .cta {
        font-family: var(--font-head); font-weight: 800; font-size: 18px;
        background: linear-gradient(135deg, var(--mint) 0%, var(--mint-deep) 100%);
        color: #fff; border: none; border-radius: 999px;
        padding: 16px 28px; cursor: pointer;
        box-shadow: 0 10px 24px rgba(42,157,143,.28);
        transition: transform .15s ease;
      }
      .cta:active { transform: scale(.97); }
      .hint { margin: 0; font-size: 13px; color: var(--ink-soft); max-width: 36ch; }

      .done-panel, .dinner, .summary, .myth, .chart-wrap {
        background: var(--card);
        border: 1px solid rgba(38,70,83,.08);
        border-radius: 20px;
        padding: 20px;
        backdrop-filter: blur(8px);
      }
      .dinner { margin-top: 8px; }
      .dinner h3, .summary .one-liner { margin-bottom: 6px; }
      .dinner-sub, .muted, .when { color: var(--ink-soft); }
      .dinner ul { list-style: none; padding: 0; margin: 14px 0 0; display: grid; gap: 12px; }
      .dinner li { display: flex; gap: 12px; align-items: flex-start; }
      .dinner-emoji { font-size: 28px; }
      .when { font-size: 13px; font-weight: 700; margin-top: 2px; }
      .one-liner {
        font-family: var(--font-head); font-size: 22px; font-weight: 700; line-height: 1.25;
      }
      .summary-stats {
        display: flex; gap: 14px; font-size: 13px; font-weight: 800; color: var(--ink-soft); margin: 8px 0 12px;
      }
      .myth { margin-top: 16px; }
      .myth p { margin: 8px 0 0; color: var(--ink-soft); line-height: 1.55; }

      .chart-wrap { display: grid; gap: 8px; }
      .chart-kicker { font-size: 12px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: var(--coral); }
      .chart-svg { width: 100%; height: auto; }
      .chart-legend { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; font-weight: 800; }
      .chart-note, .chart-empty p { color: var(--ink-soft); font-size: 14px; line-height: 1.5; }

      .vocab-grid { display: grid; gap: 10px; margin: 16px 0 24px; }
      .vocab-card {
        display: grid; grid-template-columns: 52px 1fr; gap: 10px; align-items: start;
        background: var(--card); border-radius: 16px; padding: 12px;
        border: 1px solid rgba(38,70,83,.08);
      }
      .vocab-emoji { font-size: 36px; }
      .vocab-words { display: flex; flex-wrap: wrap; gap: 6px; }
      .vocab-chip {
        display: inline-flex; align-items: center; gap: 5px;
        border: 1px solid rgba(38,70,83,.12); background: #fff;
        border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 700;
        cursor: pointer; color: var(--ink);
      }
      .vocab-chip.has-rec { border-color: var(--mint); background: #E7F6F2; }
      .vocab-chip .dot { width: 7px; height: 7px; border-radius: 50%; }
      .vocab-chip .dot.ok { background: var(--mint); }
      .vocab-chip .dot.rec { background: var(--coral); }

      .recording-banner {
        background: #FFF3C4; border-radius: 12px; padding: 10px 14px;
        font-weight: 800; color: var(--sea);
      }
      .ghost {
        background: transparent; border: 1.5px solid rgba(38,70,83,.2);
        border-radius: 999px; padding: 10px 16px; cursor: pointer; font-weight: 700; color: var(--ink-soft);
      }
      .ghost.danger { border-color: var(--coral); color: var(--coral); }

      .pop { animation: popIn .35s ease both; }
      @keyframes popIn {
        0% { transform: scale(.96); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      @media (prefers-reduced-motion: reduce) {
        .pop, .cta { animation: none !important; transition: none !important; }
      }
    `}</style>
  );
}
