import React, { useCallback, useEffect, useState } from "react";
import ChildPlay, { ChildPlayStyles } from "./components/ChildPlay.jsx";
import {
  ProgressChart,
  VocabGrid,
  WordStatusBoard,
} from "./components/ParentPanels.jsx";
import Landing3D, { Landing3DStyles } from "./components/Landing3D.jsx";
import {
  AddChild,
  ChildHistory,
  ChildOverview,
  ChildSwitcher,
  FamilyDashboardStyles,
} from "./components/FamilyDashboard.jsx";
import {
  activeChild,
  addChild,
  agePath,
  finalizeDayMissStreaks,
  loadFamily,
  saveFamily,
  todayKey,
  updateChild,
} from "./lib/progress.js";
import { buildDailyLesson, refreshDinnerFromSession } from "./lib/lessonEngine.js";
import {
  recordParentClip,
  ensureMicPermission,
  unlockAudio,
  speakWord,
} from "./lib/speech.js";
import { OBJECT_BY_ID, LANGUAGES } from "./data/vocabulary.js";

export default function App() {
  const [family, setFamily] = useState(() => loadFamily());
  const [space, setSpace] = useState("landing"); // landing | family | course
  const [tab, setTab] = useState("overview");
  const [showAdd, setShowAdd] = useState(false);
  const [editingChild, setEditingChild] = useState(null);
  const [lesson, setLesson] = useState([]);
  const [courseIndex, setCourseIndex] = useState(0);
  const [recording, setRecording] = useState(null);
  const child = activeChild(family);

  useEffect(() => {
    saveFamily(family);
  }, [family]);

  const enterFamily = () => {
    setFamily((f) => ({ ...f, hasSeenLanding: true }));
    setSpace("family");
    setTab("overview");
    if (!family.children.length) setShowAdd(true);
  };

  const setChildState = useCallback((nextChild) => {
    setFamily((current) =>
      updateChild(current, current.activeChildId, typeof nextChild === "function" ? nextChild : () => nextChild)
    );
  }, []);

  const startLesson = useCallback(async () => {
    if (!child) return;
    unlockAudio();
    await ensureMicPermission();
    const next = structuredClone(child);
    if (!next.startedAt) next.startedAt = todayKey();
    const built = buildDailyLesson(next);
    next.resume = { lesson: built, index: 0, savedAt: Date.now() };
    setChildState(next);
    setLesson(built);
    setCourseIndex(0);
    setSpace("course");
  }, [child, setChildState]);

  const resumeLesson = useCallback(() => {
    if (!child?.resume?.lesson?.length) return startLesson();
    setLesson(child.resume.lesson);
    setCourseIndex(child.resume.index || 0);
    setSpace("course");
  }, [child, startLesson]);

  const completeLesson = useCallback(() => {
    if (!child) return;
    let next = finalizeDayMissStreaks(structuredClone(child));
    const d = next.days[todayKey()];
    if (d) d.completed = true;
    next = refreshDinnerFromSession(next);
    next.resume = null;
    setChildState(next);
    setSpace("family");
    setTab("overview");
  }, [child, setChildState]);

  const handleRecord = async (objectId, lang) => {
    if (!child) return;
    unlockAudio();
    setRecording({ objectId, lang });
    try {
      const dataUrl = await recordParentClip(2200);
      const key = `${objectId}:${lang}`;
      setChildState((s) => ({
        ...s,
        recordings: { ...s.recordings, [key]: dataUrl },
      }));
    } catch {
      /* micro refusé */
    } finally {
      setRecording(null);
    }
  };

  const playRecording = (key) => {
    const dataUrl = child?.recordings?.[key];
    if (!dataUrl) return;
    const [objectId, lang] = key.split(":");
    const obj = OBJECT_BY_ID[objectId];
    speakWord({
      text: obj?.words[lang] || "",
      lang,
      recordingDataUrl: dataUrl,
    });
  };

  const deleteRecording = (key) => {
    setChildState((s) => {
      const recordings = { ...s.recordings };
      delete recordings[key];
      return { ...s, recordings };
    });
  };

  const createChild = (profile) => {
    setFamily((f) => addChild(f, profile));
    setShowAdd(false);
    setTab("overview");
  };

  const editChild = (profile) => {
    if (!editingChild) return;
    const path = agePath(profile.age);
    setFamily((f) =>
      updateChild(f, editingChild.id, (current) => ({
        ...current,
        ...profile,
        childName: profile.name,
        settings: {
          ...current.settings,
          sessionMinutes: path.minutes,
          targetTurns: path.turns,
          maxNewPerDay: path.newPerDay,
        },
      }))
    );
    setEditingChild(null);
  };

  const selectChild = (id) => {
    setFamily((f) => ({ ...f, activeChildId: id }));
    setTab("overview");
  };

  const checkpoint = (index, currentLesson) => {
    setChildState((c) => ({
      ...c,
      resume: { lesson: currentLesson, index, savedAt: Date.now() },
    }));
  };

  if (space === "landing") {
    return (
      <>
        <GlobalStyles />
        <Landing3DStyles />
        <Landing3D onEnter={enterFamily} />
      </>
    );
  }

  if (space === "course" && child) {
    return (
      <>
        <GlobalStyles />
        <ChildPlayStyles />
        <ChildPlay
          state={child}
          setState={setChildState}
          lesson={lesson}
          initialIndex={courseIndex}
          onCheckpoint={checkpoint}
          onLessonChange={setLesson}
          onExit={() => {
            setSpace("family");
            setTab("overview");
          }}
          onComplete={completeLesson}
        />
      </>
    );
  }

  return (
    <div className="family-shell">
      <GlobalStyles />
      <ChildPlayStyles />
      <FamilyDashboardStyles />

      <header className="family-header">
        <button type="button" className="family-brand brand-button" onClick={() => setSpace("landing")}>
          <span>🌿</span> LingoPousse
        </button>
        <nav className="family-actions">
          {[
            ["overview", "Accueil"],
            ["words", "Mots"],
            ["history", "Historique"],
            ["chart", "Progression"],
            ["voices", "Voix"],
          ].map(([id, label]) => (
            <button type="button" key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="family-main">
        <ChildSwitcher family={family} onSelect={selectChild} onAdd={() => setShowAdd(true)} />

        {!child ? (
          <div className="no-child">
            <span>🌱</span>
            <h1>Créons son parcours.</h1>
            <p>Chaque enfant avance avec ses propres mots, à son rythme.</p>
            <button type="button" className="cta" onClick={() => setShowAdd(true)}>Ajouter un enfant</button>
          </div>
        ) : (
          <>
            {tab === "overview" && (
              <ChildOverview
                child={child}
                onStart={startLesson}
                onResume={resumeLesson}
                onOpenWords={() => setTab("words")}
                onOpenHistory={() => setTab("history")}
                onEdit={() => setEditingChild(child)}
              />
            )}
            {tab === "words" && (
              <section>
                <p className="eyebrow">Parcours de {child.name}</p>
                <h1 className="page-title">Ses mots</h1>
                <WordStatusBoard state={child} />
              </section>
            )}
            {tab === "history" && <ChildHistory child={child} />}
            {tab === "chart" && (
              <section>
                <p className="eyebrow">Parcours de {child.name}</p>
                <h1 className="page-title">Sa progression</h1>
                <ProgressChart state={child} />
              </section>
            )}
            {tab === "voices" && (
              <section>
                <p className="eyebrow">Voix familières pour {child.name}</p>
                <h1 className="page-title">Enregistrer vos voix</h1>
                <p className="page-intro">Touchez un mot pour l’enregistrer. Il remplacera la voix du téléphone pour ce profil.</p>
                {recording && (
                  <p className="recording-banner">
                    Enregistrement {OBJECT_BY_ID[recording.objectId]?.emoji}{" "}
                    {OBJECT_BY_ID[recording.objectId]?.words[recording.lang]} (
                    {LANGUAGES.find((l) => l.id === recording.lang)?.label})…
                  </p>
                )}
                <VocabGrid state={child} onRecord={handleRecord} onPlay={playRecording} onDelete={deleteRecording} />
              </section>
            )}
          </>
        )}
      </main>

      {showAdd && <AddChild onAdd={createChild} onClose={() => family.children.length && setShowAdd(false)} />}
      {editingChild && (
        <AddChild initialProfile={editingChild} onAdd={editChild} onClose={() => setEditingChild(null)} />
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
        --card: rgba(255,255,255,.78);
        --font-head: 'Baloo 2', system-ui, sans-serif;
        --font-body: 'Nunito', system-ui, sans-serif;
      }

      * { box-sizing: border-box; }
      html, body { height: 100%; }
      body {
        margin: 0;
        font-family: var(--font-body);
        color: var(--ink);
        background:
          radial-gradient(ellipse at 0% 0%, #FFF6D6 0%, transparent 42%),
          radial-gradient(ellipse at 100% 8%, #CDEDE4 0%, transparent 40%),
          linear-gradient(180deg, #F3FAF7 0%, #E8F4F0 50%, #D9EFE8 100%);
        min-height: 100vh;
        min-height: 100dvh;
      }
      button, input { font: inherit; }
      button:focus-visible, input:focus-visible { outline: 3px solid var(--mint); outline-offset: 2px; }

      .app { min-height: 100vh; min-height: 100dvh; }
      .brand-button { border: 0; background: transparent; cursor: pointer; }
      .page-title { max-width: none; font-size: clamp(30px,5vw,42px); margin-bottom: 14px; }
      .page-intro { color: var(--ink-soft); line-height: 1.55; margin: -6px 0 16px; }
      .no-child {
        min-height: 58vh; display: grid; place-content: center; justify-items: center;
        gap: 12px; text-align: center;
      }
      .no-child > span { font-size: 62px; }
      .no-child h1 { max-width: none; }
      .no-child p { margin: 0 0 8px; color: var(--ink-soft); }
      .top {
        position: sticky; top: 0; z-index: 5;
        backdrop-filter: blur(12px);
        background: color-mix(in srgb, #F3FAF7 82%, transparent);
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

      .main { max-width: 720px; margin: 0 auto; padding: 28px 18px 80px; }
      .hero-block, .onboard { display: grid; gap: 16px; }
      .eyebrow {
        margin: 0; font-weight: 800; font-size: 12px; letter-spacing: .08em;
        text-transform: uppercase; color: var(--coral);
      }
      h1 {
        margin: 0; font-family: var(--font-head); font-weight: 800;
        font-size: clamp(28px, 6vw, 40px); line-height: 1.1; letter-spacing: -0.02em;
        max-width: 18ch;
      }
      h2, h3 { font-family: var(--font-head); font-weight: 800; margin: 0; }
      .lede { margin: 0; font-size: 16px; line-height: 1.55; color: var(--ink-soft); max-width: 44ch; }
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
      .name-edit {
        justify-self: start; border: none; background: transparent;
        color: var(--ink-soft); font-weight: 700; font-size: 13px;
        text-decoration: underline; text-underline-offset: 3px; cursor: pointer; padding: 0;
      }
      .mini-loop {
        display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
        background: var(--card); border: 1px solid rgba(38,70,83,.08);
        border-radius: 999px; padding: 10px 16px; justify-self: start;
        font-size: 14px; font-weight: 800; color: var(--ink);
      }
      .mini-loop em { color: var(--mint); font-style: normal; font-weight: 800; }

      .explainer {
        background: var(--card); border: 1px solid rgba(38,70,83,.08);
        border-radius: 18px; padding: 4px 16px;
      }
      .explainer summary {
        cursor: pointer; padding: 12px 0; list-style: none;
        font-family: var(--font-head); font-weight: 800; font-size: 16px; color: var(--mint-deep);
        display: flex; align-items: center; gap: 8px;
      }
      .explainer summary::-webkit-details-marker { display: none; }
      .explainer summary::after { content: "▾"; margin-left: auto; transition: transform .2s; }
      .explainer[open] summary::after { transform: rotate(180deg); }
      .explainer-body { padding: 4px 0 16px; }

      .onboard-dots { display: flex; gap: 6px; justify-content: center; }
      .onboard-dots span {
        width: 8px; height: 8px; border-radius: 50%; background: rgba(38,70,83,.18);
        transition: background .2s, width .2s;
      }
      .onboard-dots span.on { background: var(--mint); width: 22px; border-radius: 99px; }
      .onboard-step { display: grid; gap: 14px; }
      .onboard-visual {
        display: flex; align-items: center; gap: 10px; justify-content: center;
        background: var(--card); border: 1px solid rgba(38,70,83,.08);
        border-radius: 18px; padding: 18px; font-size: 40px;
      }
      .onboard-visual .arrow { font-size: 24px; color: var(--mint); }
      .onboard-nav {
        display: flex; align-items: center; justify-content: space-between; gap: 12px;
        margin-top: 4px;
      }
      .skip {
        justify-self: center; border: none; background: transparent; cursor: pointer;
        color: var(--ink-soft); font-size: 13px; font-weight: 700;
        text-decoration: underline; text-underline-offset: 3px;
      }

      .row-opts { display: grid; gap: 10px; justify-items: start; }
      .toggle {
        display: inline-flex; align-items: center; gap: 8px;
        font-size: 13px; font-weight: 700; color: var(--ink-soft); cursor: pointer;
      }
      .toggle input { width: 20px; height: 20px; accent-color: var(--mint); }

      .words-board { display: grid; gap: 14px; margin-top: 4px; }
      .words-legend { display: flex; flex-wrap: wrap; gap: 10px; }
      .legend-item {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 12px; font-weight: 700; color: var(--ink-soft);
        background: var(--card); border: 1px solid rgba(38,70,83,.08);
        border-radius: 999px; padding: 6px 12px;
      }
      .legend-item i { width: 9px; height: 9px; border-radius: 50%; }
      .legend-item strong { color: var(--ink); }
      .lang-filter { display: flex; flex-wrap: wrap; gap: 6px; }
      .lang-filter button {
        border: 1px solid rgba(38,70,83,.12); background: #fff; color: var(--ink-soft);
        border-radius: 999px; padding: 8px 14px; font-size: 13px; font-weight: 700; cursor: pointer;
      }
      .lang-filter button.active { background: var(--mint); border-color: var(--mint); color: #fff; }
      .words-help {
        margin: 0; font-size: 13.5px; line-height: 1.55; color: var(--ink-soft);
        background: var(--card); border: 1px solid rgba(38,70,83,.08);
        border-radius: 16px; padding: 14px 16px;
      }
      .words-help strong { color: var(--ink); }
      .words-list { display: grid; gap: 10px; }
      .word-row {
        background: var(--card); border: 1px solid rgba(38,70,83,.08);
        border-radius: 16px; padding: 12px 14px; display: grid; gap: 10px;
      }
      .word-row-head { display: flex; align-items: center; gap: 10px; }
      .word-row-emoji { font-size: 30px; }
      .word-row-fr { font-family: var(--font-head); font-weight: 800; font-size: 17px; }
      .word-row-cells {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px;
      }
      .word-cell {
        display: grid; gap: 2px; background: #fff;
        border: 1px solid; border-left-width: 4px; border-radius: 12px; padding: 8px 10px;
      }
      .word-cell-top { font-size: 13px; color: var(--ink-soft); }
      .word-cell-top strong { color: var(--ink); }
      .word-cell-status { font-size: 11.5px; font-weight: 800; }

      .checklist { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
      .checklist li { font-size: 14px; font-weight: 700; color: var(--ink-soft); }
      .checklist li.ok { color: var(--mint-deep); }

      .cta-row { display: grid; gap: 10px; justify-items: start; }
      .cta {
        font-family: var(--font-head); font-weight: 800; font-size: 18px;
        background: linear-gradient(135deg, var(--mint) 0%, var(--mint-deep) 100%);
        color: #fff; border: none; border-radius: 999px;
        padding: 16px 28px; cursor: pointer;
        box-shadow: 0 10px 24px rgba(42,157,143,.28);
        transition: transform .15s ease;
      }
      .cta:disabled { opacity: .45; cursor: default; box-shadow: none; }
      .cta:active:not(:disabled) { transform: scale(.97); }
      .hint { margin: 0; font-size: 13px; color: var(--ink-soft); max-width: 40ch; line-height: 1.45; }

      .preview {
        background: var(--card); border: 1px solid rgba(38,70,83,.08);
        border-radius: 18px; padding: 14px 16px;
      }
      .preview-meta {
        display: flex; gap: 8px; flex-wrap: wrap;
        font-size: 12px; font-weight: 800; color: var(--ink-soft); margin-bottom: 10px;
      }
      .preview-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
      .preview-pill {
        width: 36px; height: 36px; border-radius: 12px; display: grid; place-items: center;
        background: #fff; font-size: 20px; border: 1px solid rgba(38,70,83,.08);
      }
      .preview-more { font-size: 12px; font-weight: 800; color: var(--ink-soft); }

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
      .chart-note, .chart-empty p { color: var(--ink-soft); font-size: 14px; line-height: 1.5; margin: 0; }

      .vocab-grid { display: grid; gap: 10px; margin: 16px 0 24px; }
      .vocab-card {
        display: grid; grid-template-columns: 52px 1fr; gap: 10px; align-items: start;
        background: var(--card); border-radius: 16px; padding: 12px;
        border: 1px solid rgba(38,70,83,.08);
      }
      .vocab-emoji { font-size: 36px; }
      .vocab-words { display: flex; flex-wrap: wrap; gap: 6px; }
      .vocab-chip-wrap { display: inline-flex; align-items: center; gap: 2px; }
      .vocab-chip {
        display: inline-flex; align-items: center; gap: 5px;
        border: 1px solid rgba(38,70,83,.12); background: #fff;
        border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 700;
        cursor: pointer; color: var(--ink);
      }
      .vocab-chip-wrap.has-rec .vocab-chip { border-color: var(--mint); background: #E7F6F2; }
      .vocab-chip .dot { width: 7px; height: 7px; border-radius: 50%; }
      .vocab-chip .dot.ok { background: var(--mint); }
      .vocab-chip .dot.rec { background: var(--coral); }
      .vocab-actions { display: inline-flex; gap: 2px; }
      .mini {
        width: 26px; height: 26px; border-radius: 999px; border: 1px solid rgba(38,70,83,.12);
        background: #fff; cursor: pointer; font-size: 12px; font-weight: 800; color: var(--ink-soft);
      }

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
