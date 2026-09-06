import React, { useMemo, useState } from "react";
import { LANGUAGES, OBJECT_BY_ID, OBJECTS } from "../data/vocabulary.js";
import { getProgressSeries, todayKey, wordStatus, STATUS_META } from "../lib/progress.js";
import { parentOneLiner } from "../lib/lessonEngine.js";
import { LOOP_STEPS } from "./HowItWorks.jsx";

const LANG_COLORS = { en: "#2A9D8F", es: "#E76F51", zh: "#E9C46A", ja: "#264653" };

export function ProgressChart({ state }) {
  const { dates, series } = useMemo(() => getProgressSeries(state), [state]);
  const W = 560;
  const H = 200;
  const pl = 36;
  const pr = 16;
  const pt = 16;
  const pb = 28;

  if (!dates.length) {
    return (
      <div className="chart-wrap chart-empty">
        <span className="chart-kicker">Jour 0</span>
        <h3>Rien sur le graphique encore</h3>
        <p>Onze minutes aujourd’hui — et la ligne démarre.</p>
      </div>
    );
  }

  const maxY = Math.max(8, ...Object.values(series).flatMap((s) => s));
  const x = (i) => pl + (i * (W - pl - pr)) / Math.max(1, dates.length - 1);
  const y = (v) => pt + (1 - v / maxY) * (H - pt - pb);

  const quietDay = 21;
  const dayIndex = (d) => {
    const start = new Date(dates[0]);
    return Math.round((new Date(d) - start) / 86400000);
  };

  const paths = LANGUAGES.map((lang) => {
    const pts = series[lang.id] || [];
    const d = pts
      .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
      .join(" ");
    return { lang, d, last: pts[pts.length - 1] || 0 };
  });

  const quietX = dates.length > 1 ? x(Math.min(quietDay, dates.length - 1)) : null;
  const daysIn = Math.max(0, dayIndex(todayKey()));

  return (
    <div className="chart-wrap">
      <div className="chart-title">
        <span className="chart-kicker">{daysIn} jour{daysIn > 1 ? "s" : ""}</span>
        <h3>Elle ou il écoutait déjà tout ce temps</h3>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" role="img" aria-label="Progression des quatre langues">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={pl}
            x2={W - pr}
            y1={y(maxY * f)}
            y2={y(maxY * f)}
            stroke="rgba(38,70,83,.1)"
            strokeDasharray="3 6"
          />
        ))}
        {quietX != null && dates.length > 10 && (
          <>
            <line x1={quietX} x2={quietX} y1={pt} y2={H - pb} stroke="rgba(38,70,83,.35)" strokeDasharray="4 5" />
            <text x={quietX + 6} y={pt + 12} fontSize="10" fill="#5C6B73" fontFamily="var(--font-body)">
              jour 21
            </text>
          </>
        )}
        {paths.map(({ lang, d }) => (
          <path
            key={lang.id}
            d={d}
            fill="none"
            stroke={LANG_COLORS[lang.id]}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        {paths.map(({ lang, last }) => (
          <text
            key={`lbl-${lang.id}`}
            x={W - pr}
            y={y(last) - 6}
            textAnchor="end"
            fontSize="11"
            fontWeight="700"
            fill={LANG_COLORS[lang.id]}
            fontFamily="var(--font-body)"
          >
            {last}
          </text>
        ))}
      </svg>
      <div className="chart-legend">
        {LANGUAGES.map((l) => (
          <span key={l.id} style={{ color: LANG_COLORS[l.id] }}>
            {l.flag} {l.label}
          </span>
        ))}
      </div>
      {daysIn < 21 && (
        <p className="chart-note">
          Le jour 21, presque tous les parents abandonnent. Reste — les quatre lignes partent ensemble.
        </p>
      )}
    </div>
  );
}

export function DinnerWords({ words }) {
  if (!words?.length) return null;
  return (
    <div className="dinner">
      <h3>Ce soir à table</h3>
      <p className="dinner-sub">Dis-les à voix haute — exactement au moment indiqué. Pas de quiz, juste de l’air.</p>
      <ul>
        {words.map((w) => (
          <li key={`${w.objectId}-${w.lang}`}>
            <span className="dinner-emoji" aria-hidden>
              {w.emoji}
            </span>
            <div>
              <strong>{w.word}</strong>
              <span className="muted"> · {w.language}</span>
              <div className="when">{w.when}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ParentSummary({ state }) {
  const line = parentOneLiner(state);
  const day = state.days[todayKey()];
  const said = day?.items?.filter((i) => i.correct).length || 0;
  const missed = day?.items?.filter((i) => !i.correct).length || 0;
  return (
    <div className="summary">
      <p className="one-liner">{line}</p>
      {day?.items?.length > 0 && (
        <div className="summary-stats">
          <span>{said} redis</span>
          <span>{missed} refiles douces</span>
        </div>
      )}
      <DinnerWords words={day?.dinnerWords} />
    </div>
  );
}

export function LessonPreview({ lesson }) {
  if (!lesson?.length) return null;
  const langs = new Set(lesson.map((i) => i.lang));
  return (
    <div className="preview">
      <div className="preview-meta">
        <span>{lesson.length} tours</span>
        <span>·</span>
        <span>{langs.size} langues</span>
        <span>·</span>
        <span>~11 min</span>
      </div>
      <div className="preview-row" aria-hidden>
        {lesson.slice(0, 12).map((item, i) => {
          const obj = OBJECT_BY_ID[item.objectId];
          return (
            <span key={`${item.key}-${i}`} className="preview-pill" title={obj?.words[item.lang]}>
              {obj?.emoji}
            </span>
          );
        })}
        {lesson.length > 12 && <span className="preview-more">+{lesson.length - 12}</span>}
      </div>
    </div>
  );
}

/** Onglet « Mots » : où en est chaque mot, langue par langue */
export function WordStatusBoard({ state }) {
  const [langFilter, setLangFilter] = useState("all");

  const rows = useMemo(() => {
    return OBJECTS.map((obj) => ({
      obj,
      cells: LANGUAGES.map((lang) => ({
        lang,
        status: wordStatus(state, obj.id, lang.id),
        stat: state.words?.[`${obj.id}:${lang.id}`],
      })),
    }));
  }, [state]);

  const counts = useMemo(() => {
    const c = { new: 0, listening: 0, learning: 0, learned: 0, paused: 0 };
    for (const row of rows) {
      for (const cell of row.cells) {
        if (langFilter !== "all" && cell.lang.id !== langFilter) continue;
        c[cell.status] += 1;
      }
    }
    return c;
  }, [rows, langFilter]);

  const visible = rows.filter((row) =>
    langFilter === "all" ? true : row.cells.some((c) => c.lang.id === langFilter)
  );

  return (
    <div className="words-board">
      <div className="words-legend">
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <span key={key} className="legend-item">
            <i style={{ background: meta.color }} />
            {meta.label} <strong>{counts[key]}</strong>
          </span>
        ))}
      </div>

      <div className="lang-filter">
        <button
          type="button"
          className={langFilter === "all" ? "active" : ""}
          onClick={() => setLangFilter("all")}
        >
          Toutes
        </button>
        {LANGUAGES.map((l) => (
          <button
            key={l.id}
            type="button"
            className={langFilter === l.id ? "active" : ""}
            onClick={() => setLangFilter(l.id)}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>

      <p className="words-help">
        Chaque mot passe de <strong>à venir</strong> → <strong>en écoute</strong> →{" "}
        <strong>en cours</strong> → <strong>acquis</strong> (3 réussites). Deux mots neufs
        maximum par jour ; raté 3 jours de suite, il passe <strong>en pause</strong> et un
        objet plus simple prend sa place.
      </p>

      <div className="words-list">
        {visible.map(({ obj, cells }) => (
          <div key={obj.id} className="word-row">
            <div className="word-row-head">
              <span className="word-row-emoji" aria-hidden>
                {obj.emoji}
              </span>
              <span className="word-row-fr">{obj.words.fr}</span>
            </div>
            <div className="word-row-cells">
              {cells
                .filter((c) => langFilter === "all" || c.lang.id === langFilter)
                .map(({ lang, status, stat }) => {
                  const meta = STATUS_META[status];
                  return (
                    <div key={lang.id} className="word-cell" style={{ borderColor: meta.color }}>
                      <span className="word-cell-top">
                        {lang.flag} <strong>{obj.words[lang.id]}</strong>
                      </span>
                      <span className="word-cell-status" style={{ color: meta.color }}>
                        {meta.label}
                        {stat?.correctCount ? ` · ${stat.correctCount}×` : ""}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VocabGrid({ state, onRecord, onPlay, onDelete }) {
  return (
    <div className="vocab-grid">
      {Object.values(OBJECT_BY_ID).map((obj) => (
        <div key={obj.id} className="vocab-card">
          <span className="vocab-emoji">{obj.emoji}</span>
          <div className="vocab-words">
            {LANGUAGES.map((lang) => {
              const key = `${obj.id}:${lang.id}`;
              const hasRec = !!state.recordings?.[key];
              const w = state.words[key];
              return (
                <div key={lang.id} className={`vocab-chip-wrap ${hasRec ? "has-rec" : ""}`}>
                  <button
                    type="button"
                    className="vocab-chip"
                    title={`Enregistrer ${obj.words[lang.id]}`}
                    onClick={() => onRecord(obj.id, lang.id)}
                  >
                    <span>{lang.flag}</span>
                    <span>{obj.words[lang.id]}</span>
                    {w?.correctCount > 0 && <span className="dot ok" />}
                    {hasRec && <span className="dot rec" />}
                  </button>
                  {hasRec && (
                    <span className="vocab-actions">
                      <button type="button" className="mini" onClick={() => onPlay(key)} aria-label="Écouter">
                        ▶
                      </button>
                      <button type="button" className="mini" onClick={() => onDelete(key)} aria-label="Supprimer">
                        ×
                      </button>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Onboarding({ name, setName, onReady, micOk }) {
  const [step, setStep] = useState(0);
  const last = 2;

  return (
    <div className="onboard pop">
      <div className="onboard-dots" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className={i === step ? "on" : ""} />
        ))}
      </div>

      {step === 0 && (
        <div className="onboard-step">
          <p className="eyebrow">Le principe</p>
          <h1>Iel ne lit pas. Alors l’app parle, et l’écoute.</h1>
          <p className="lede">
            Les <strong>mêmes 30 objets</strong> du quotidien — pomme, chien, chaussure — en{" "}
            <strong>anglais, espagnol, mandarin et japonais</strong>. Iel connaît déjà la chose :
            iel n’apprend que le son.
          </p>
          <div className="onboard-visual" aria-hidden>
            <span>🍎</span>
            <span className="arrow">→</span>
            <span>🔊</span>
            <span className="arrow">→</span>
            <span>🗣️</span>
          </div>
          <p className="lede">
            Onze minutes par jour, jamais plus. Aucun point, aucune série à tenir.
          </p>
        </div>
      )}

      {step === 1 && (
        <div className="onboard-step">
          <p className="eyebrow">Une boucle en 4 temps</p>
          <h1>Ce qui se passe à chaque mot</h1>
          <ol className="loop-steps">
            {LOOP_STEPS.map((s) => (
              <li key={s.n}>
                <span className="loop-num">{s.n}</span>
                <span className="loop-icon">{s.icon}</span>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {step === 2 && (
        <div className="onboard-step">
          <p className="eyebrow">Presque prêt</p>
          <h1>Le prénom, et c’est parti</h1>
          <label className="name-field">
            Prénom de l’enfant
            <input
              value={name}
              placeholder="ex. Alba"
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
            />
          </label>
          <ul className="checklist">
            <li className={micOk ? "ok" : ""}>
              {micOk ? "✓" : "○"} Micro — pour entendre ce qu’iel répond
            </li>
            <li>○ Plein écran : Partager → Sur l’écran d’accueil</li>
            <li>○ Optionnel : vos voix dans l’onglet Voix</li>
          </ul>
          <p className="hint">
            Sans micro, ça marche aussi : tu touches l’image quand iel a dit le mot.
          </p>
        </div>
      )}

      <div className="onboard-nav">
        {step > 0 ? (
          <button type="button" className="ghost" onClick={() => setStep(step - 1)}>
            Retour
          </button>
        ) : (
          <span />
        )}
        {step < last ? (
          <button type="button" className="cta" onClick={() => setStep(step + 1)}>
            Suivant
          </button>
        ) : (
          <button type="button" className="cta" disabled={!name.trim()} onClick={onReady}>
            C’est prêt
          </button>
        )}
      </div>

      {step < last && (
        <button type="button" className="skip" onClick={() => setStep(last)}>
          Passer l’explication
        </button>
      )}
    </div>
  );
}
