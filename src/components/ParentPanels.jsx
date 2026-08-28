import React, { useMemo } from "react";
import { LANGUAGES, OBJECT_BY_ID } from "../data/vocabulary.js";
import { getProgressSeries, todayKey } from "../lib/progress.js";
import { parentOneLiner } from "../lib/lessonEngine.js";

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
      <div className="chart-empty">
        <p>Day 0 — nothing on the graph yet. Eleven minutes today starts the line.</p>
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
    const d = pts.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    return { lang, d, last: pts[pts.length - 1] || 0 };
  });

  const quietX = dates.length > 1 ? x(Math.min(quietDay, dates.length - 1)) : null;
  const daysIn = dayIndex(todayKey());

  return (
    <div className="chart-wrap">
      <div className="chart-title">
        <span className="chart-kicker">{Math.max(daysIn, dates.length - 1)} days in</span>
        <h3>She was listening the whole time</h3>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg" role="img" aria-label="Progress across four languages">
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
              day 21
            </text>
          </>
        )}
        {paths.map(({ lang, d }) => (
          <path key={lang.id} d={d} fill="none" stroke={LANG_COLORS[lang.id]} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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
        <p className="chart-note">Day 21 is where every parent quits. Stay — all four lines turn together.</p>
      )}
    </div>
  );
}

export function DinnerWords({ words }) {
  if (!words?.length) return null;
  return (
    <div className="dinner">
      <h3>Tonight at dinner</h3>
      <p className="dinner-sub">Say these out loud — exactly when noted. No quiz, just airtime.</p>
      <ul>
        {words.map((w) => (
          <li key={`${w.objectId}-${w.lang}`}>
            <span className="dinner-emoji" aria-hidden>{w.emoji}</span>
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
  return (
    <div className="summary">
      <p className="one-liner">{line}</p>
      {day?.items?.length > 0 && (
        <div className="summary-stats">
          <span>{day.items.filter((i) => i.correct).length} said back</span>
          <span>{day.items.filter((i) => !i.correct).length} quiet misses</span>
        </div>
      )}
      <DinnerWords words={day?.dinnerWords} />
    </div>
  );
}

export function VocabGrid({ state, onRecord }) {
  return (
    <div className="vocab-grid">
      {Object.values(OBJECT_BY_ID).slice(0, 30).map((obj) => (
        <div key={obj.id} className="vocab-card">
          <span className="vocab-emoji">{obj.emoji}</span>
          <div className="vocab-words">
            {LANGUAGES.map((lang) => {
              const key = `${obj.id}:${lang.id}`;
              const hasRec = !!state.recordings?.[key];
              const w = state.words[key];
              return (
                <button
                  key={lang.id}
                  type="button"
                  className={`vocab-chip ${hasRec ? "has-rec" : ""}`}
                  title={`Record ${obj.words[lang.id]}`}
                  onClick={() => onRecord(obj.id, lang.id)}
                >
                  <span>{lang.flag}</span>
                  <span>{obj.words[lang.id]}</span>
                  {w?.correctCount > 0 && <span className="dot ok" />}
                  {hasRec && <span className="dot rec" />}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
