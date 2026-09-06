import React, { useMemo, useState } from "react";
import { LANGUAGES } from "../data/vocabulary.js";
import { STATUS_META, todayKey, wordStatus } from "../lib/progress.js";

const AVATARS = ["🦊", "🐼", "🐣", "🐰", "🐯", "🐨", "🦁", "🐙"];

export function ChildSwitcher({ family, onSelect, onAdd }) {
  return (
    <div className="child-switcher">
      {family.children.map((child) => (
        <button
          type="button"
          key={child.id}
          className={`child-pill ${family.activeChildId === child.id ? "active" : ""}`}
          onClick={() => onSelect(child.id)}
        >
          <span>{child.avatar}</span>
          <strong>{child.name}</strong>
          <small>{child.age} ans</small>
        </button>
      ))}
      <button type="button" className="child-pill add" onClick={onAdd}>
        <span>＋</span>
        <strong>Enfant</strong>
      </button>
    </div>
  );
}

export function AddChild({ onAdd, onClose }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState(3);
  const [avatar, setAvatar] = useState("🦊");

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="profile-modal" role="dialog" aria-modal="true" aria-label="Ajouter un enfant" onMouseDown={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Fermer">×</button>
        <p className="eyebrow">Nouveau parcours</p>
        <h2>Ajouter un enfant</h2>
        <p>Chaque enfant garde ses mots, son rythme et son historique séparément.</p>

        <label>
          Prénom
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Lina" autoFocus />
        </label>
        <label>
          Âge
          <select value={age} onChange={(e) => setAge(Number(e.target.value))}>
            {[3, 4, 5, 6].map((a) => <option key={a} value={a}>{a} ans</option>)}
          </select>
        </label>
        <fieldset>
          <legend>Son animal</legend>
          <div className="avatar-grid">
            {AVATARS.map((a) => (
              <button type="button" key={a} className={avatar === a ? "active" : ""} onClick={() => setAvatar(a)}>{a}</button>
            ))}
          </div>
        </fieldset>
        <button
          type="button"
          className="cta profile-submit"
          disabled={!name.trim()}
          onClick={() => onAdd({ name: name.trim(), age, avatar })}
        >
          Créer son parcours
        </button>
      </div>
    </div>
  );
}

export function ChildOverview({ child, onStart, onResume, onOpenWords, onOpenHistory }) {
  const summary = useMemo(() => summarize(child), [child]);

  return (
    <div className="dashboard">
      <section className="welcome-card">
        <div className="welcome-copy">
          <span className="profile-avatar">{child.avatar}</span>
          <div>
            <p className="eyebrow">Parcours de {child.name}</p>
            <h1>{situationTitle(summary)}</h1>
            <p>{situationCopy(summary, child.name)}</p>
          </div>
        </div>
        <div className="welcome-action">
          {child.resume?.lesson?.length ? (
            <>
              <button type="button" className="cta" onClick={onResume}>
                Reprendre · mot {child.resume.index + 1}
              </button>
              <button type="button" className="secondary-btn" onClick={onStart}>Nouvelle séance</button>
            </>
          ) : (
            <button type="button" className="cta" onClick={onStart}>
              Lancer la séance
            </button>
          )}
        </div>
      </section>

      <section className="metric-grid">
        <Metric icon="✓" value={summary.learned} label="mots acquis" color="#4DA67A" />
        <Metric icon="↗" value={summary.learning} label="en progression" color="#E3A23C" />
        <Metric icon="◷" value={summary.sessions} label="séances terminées" color="#5E8FB4" />
        <Metric icon="◎" value={`${summary.accuracy}%`} label="réussite globale" color="#D66C55" />
      </section>

      <section className="dashboard-grid">
        <article className="dash-card language-card">
          <div className="dash-heading">
            <div>
              <p className="eyebrow">Progression</p>
              <h2>Ses quatre langues</h2>
            </div>
            <button type="button" className="text-btn" onClick={onOpenWords}>Tous les mots →</button>
          </div>
          <div className="language-bars">
            {summary.languages.map((lang) => (
              <div className="language-line" key={lang.id}>
                <span className="lang-name">{lang.flag} {lang.label}</span>
                <div className="bar"><i style={{ width: `${lang.percent}%`, background: lang.color }} /></div>
                <strong>{lang.learned}/30</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="dash-card situation-card">
          <p className="eyebrow">À savoir aujourd’hui</p>
          <h2>Sa situation</h2>
          <div className={`situation-badge ${summary.tone}`}>{summary.situation}</div>
          <ul>
            <li><span>●</span>{summary.listened} mots déjà rencontrés</li>
            <li><span>●</span>{summary.needsWork} mots à consolider</li>
            <li><span>●</span>{summary.days} jour{summary.days > 1 ? "s" : ""} depuis le début</li>
          </ul>
        </article>
      </section>

      <section className="dash-card history-preview">
        <div className="dash-heading">
          <div>
            <p className="eyebrow">Historique</p>
            <h2>Les dernières séances</h2>
          </div>
          <button type="button" className="text-btn" onClick={onOpenHistory}>Voir tout →</button>
        </div>
        <SessionList child={child} limit={4} />
      </section>
    </div>
  );
}

function Metric({ icon, value, label, color }) {
  return (
    <article className="metric">
      <span style={{ color, background: `${color}18` }}>{icon}</span>
      <div><strong>{value}</strong><small>{label}</small></div>
    </article>
  );
}

export function ChildHistory({ child }) {
  return (
    <section className="history-page">
      <p className="eyebrow">Parcours de {child.name}</p>
      <h1>Historique des séances</h1>
      <p className="page-intro">Chaque séance est enregistrée uniquement pour ce profil.</p>
      <SessionList child={child} />
    </section>
  );
}

function SessionList({ child, limit }) {
  const days = Object.values(child.days || {}).sort((a, b) => b.date.localeCompare(a.date));
  const rows = limit ? days.slice(0, limit) : days;
  if (!rows.length) return <div className="empty-state">Sa première séance écrira la première ligne ici.</div>;
  return (
    <div className="session-list">
      {rows.map((day) => {
        const hits = day.items?.filter((i) => i.correct).length || 0;
        const total = day.items?.length || 0;
        return (
          <div className="session-row" key={day.date}>
            <span className={`session-dot ${day.completed ? "done" : ""}`}>{day.completed ? "✓" : "…"}</span>
            <div>
              <strong>{formatDate(day.date)}</strong>
              <small>{day.completed ? "Séance terminée" : "Séance commencée"}</small>
            </div>
            <div className="session-result"><strong>{hits}/{total}</strong><small>réussites</small></div>
          </div>
        );
      })}
    </div>
  );
}

function summarize(child) {
  const statuses = { learned: 0, learning: 0, listening: 0, paused: 0, new: 0 };
  const langStats = Object.fromEntries(LANGUAGES.map((l) => [l.id, { learned: 0, touched: 0 }]));
  for (const lang of LANGUAGES) {
    for (const objectId of Object.keys(child.words || {})) {
      const [id, code] = objectId.split(":");
      if (code !== lang.id) continue;
      const status = wordStatus(child, id, code);
      statuses[status] += 1;
      if (status !== "new") langStats[code].touched += 1;
      if (status === "learned") langStats[code].learned += 1;
    }
  }
  // Include untouched combinations in "new"
  statuses.new = 120 - statuses.learned - statuses.learning - statuses.listening - statuses.paused;
  const days = Object.values(child.days || {});
  const allItems = days.flatMap((d) => d.items || []);
  const hits = allItems.filter((i) => i.correct).length;
  const accuracy = allItems.length ? Math.round((hits / allItems.length) * 100) : 0;
  const start = child.startedAt ? new Date(child.startedAt) : null;
  const elapsed = start ? Math.max(1, Math.floor((Date.now() - start.getTime()) / 86400000) + 1) : 0;
  const languages = LANGUAGES.map((l) => ({
    ...l,
    ...langStats[l.id],
    percent: Math.round((langStats[l.id].learned / 30) * 100),
    color: { en: "#3DA985", es: "#DF7257", zh: "#D9A43B", ja: "#4E7185" }[l.id],
  }));
  const needsWork = Object.values(child.words || {}).filter((w) => w.missCount > w.correctCount).length;
  let situation = "Prêt pour commencer";
  let tone = "neutral";
  if (allItems.length && accuracy < 45) { situation = "En phase d’écoute"; tone = "blue"; }
  else if (statuses.learned >= 20) { situation = "Une belle base s’installe"; tone = "green"; }
  else if (allItems.length) { situation = "En progression régulière"; tone = "gold"; }
  return {
    ...statuses,
    sessions: days.filter((d) => d.completed).length,
    accuracy,
    days: elapsed,
    listened: statuses.learned + statuses.learning + statuses.listening,
    needsWork,
    languages,
    situation,
    tone,
  };
}

function situationTitle(summary) {
  if (!summary.sessions) return "Son aventure commence ici.";
  if (summary.learned >= 20) return "Sa confiance prend racine.";
  if (summary.accuracy < 45) return "Iel écoute. C’est déjà apprendre.";
  return "Son oreille progresse chaque jour.";
}

function situationCopy(summary, name) {
  if (!summary.sessions) return `Le premier parcours de ${name} sera créé à partir de son âge et s’adaptera à chaque réponse.`;
  return `${summary.listened} mots rencontrés, ${summary.learning} en train de s’installer. La prochaine séance repart exactement de là.`;
}

function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00`));
}

export function FamilyDashboardStyles() {
  return (
    <style>{`
      .family-shell { min-height: 100vh; background: #F5F7F2; color: #1D332C; }
      .family-header {
        position: sticky; top: 0; z-index: 20; display: flex; align-items: center; justify-content: space-between;
        padding: 14px 24px; border-bottom: 1px solid rgba(29,51,44,.08);
        background: rgba(250,252,248,.9); backdrop-filter: blur(14px);
      }
      .family-brand { display: flex; align-items: center; gap: 9px; font-family: var(--font-head); font-size: 21px; font-weight: 800; color: #287859; }
      .family-actions { display: flex; gap: 8px; }
      .family-actions button {
        border: none; background: transparent; border-radius: 12px; padding: 9px 12px;
        color: #61756E; font-size: 13px; font-weight: 800; cursor: pointer;
      }
      .family-actions button.active { color: #1E694E; background: #E5F2E9; }
      .family-main { max-width: 1080px; margin: 0 auto; padding: 24px; }
      .child-switcher { display: flex; align-items: stretch; gap: 9px; overflow-x: auto; padding: 1px 1px 14px; scrollbar-width: none; }
      .child-pill {
        flex: 0 0 auto; display: grid; grid-template-columns: 34px auto; grid-template-rows: auto auto;
        text-align: left; column-gap: 8px; align-items: center; padding: 9px 14px 9px 9px;
        background: #fff; border: 1px solid rgba(29,51,44,.1); border-radius: 16px; cursor: pointer;
      }
      .child-pill > span { grid-row: 1/3; width: 34px; height: 34px; border-radius: 12px; display: grid; place-items: center; background: #F3F6EE; font-size: 20px; }
      .child-pill strong { font-family: var(--font-head); font-size: 14px; line-height: 1.1; }
      .child-pill small { color: #82918B; font-size: 10px; font-weight: 800; }
      .child-pill.active { border-color: #3BA274; box-shadow: 0 0 0 2px rgba(59,162,116,.13); background: #F8FFFA; }
      .child-pill.add { color: #378364; border-style: dashed; }
      .dashboard { display: grid; gap: 16px; }
      .welcome-card {
        position: relative; overflow: hidden; padding: 24px; border-radius: 25px;
        background: linear-gradient(120deg,#173D31,#286B53); color: #fff;
        display: flex; align-items: center; justify-content: space-between; gap: 20px;
        box-shadow: 0 18px 40px rgba(28,74,58,.16);
      }
      .welcome-card::after { content:""; position:absolute; width:240px; height:240px; right:-70px; top:-100px; border-radius:50%; background:rgba(159,221,183,.12); }
      .welcome-copy { position: relative; z-index: 1; display: flex; align-items: center; gap: 16px; }
      .profile-avatar { flex: 0 0 auto; width: 64px; height: 64px; border-radius: 20px; display: grid; place-items: center; font-size: 38px; background: rgba(255,255,255,.13); }
      .welcome-card .eyebrow { color: #A9D8C1; }
      .welcome-card h1 { max-width: none; font-size: clamp(25px,4vw,36px); margin: 2px 0; color: #fff; }
      .welcome-card p:last-child { margin: 3px 0 0; color: #D1E6DC; font-size: 14px; max-width: 510px; line-height: 1.5; }
      .welcome-action { position: relative; z-index: 2; display: grid; gap: 7px; justify-items: center; flex: 0 0 auto; }
      .welcome-card .cta { background: #E9C46A; color: #17342C; box-shadow: none; white-space: nowrap; }
      .secondary-btn { border:none; background:transparent; color:#CEE6DA; font-size:12px; font-weight:800; cursor:pointer; text-decoration:underline; }
      .metric-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
      .metric { display: flex; align-items: center; gap: 10px; padding: 14px; background: #fff; border: 1px solid rgba(29,51,44,.07); border-radius: 18px; }
      .metric > span { flex:0 0 auto; width:36px; height:36px; border-radius:12px; display:grid; place-items:center; font-weight:900; }
      .metric div { display:grid; }
      .metric strong { font-family:var(--font-head); font-size:22px; line-height:1; }
      .metric small { color:#7A8C85; font-size:10px; font-weight:800; }
      .dashboard-grid { display:grid; grid-template-columns:1.45fr .75fr; gap:12px; }
      .dash-card { background:#fff; border:1px solid rgba(29,51,44,.07); border-radius:21px; padding:20px; }
      .dash-heading { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
      .dash-card h2 { font-size:21px; }
      .text-btn { border:none; background:transparent; color:#388665; font-size:12px; font-weight:900; cursor:pointer; white-space:nowrap; }
      .language-bars { display:grid; gap:14px; margin-top:18px; }
      .language-line { display:grid; grid-template-columns:110px 1fr 38px; gap:10px; align-items:center; }
      .lang-name { font-size:12px; font-weight:800; }
      .bar { height:8px; background:#EDF1EC; border-radius:99px; overflow:hidden; }
      .bar i { display:block; height:100%; border-radius:99px; min-width:2px; }
      .language-line > strong { font-size:11px; color:#75877F; text-align:right; }
      .situation-badge { display:inline-block; margin:15px 0 10px; padding:8px 11px; border-radius:10px; background:#EFF3EE; font-size:12px; font-weight:900; }
      .situation-badge.green { color:#27845E; background:#E5F4EA; }
      .situation-badge.gold { color:#9A6B11; background:#FFF3D5; }
      .situation-badge.blue { color:#3F728D; background:#E7F1F6; }
      .situation-card ul { list-style:none; margin:4px 0 0; padding:0; display:grid; gap:8px; }
      .situation-card li { font-size:12px; color:#647871; }
      .situation-card li span { color:#5BB082; margin-right:7px; font-size:8px; }
      .session-list { display:grid; margin-top:12px; }
      .session-row { display:grid; grid-template-columns:34px 1fr auto; align-items:center; gap:10px; padding:11px 0; border-top:1px solid #EEF1ED; }
      .session-dot { width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:#F0F2EF;color:#83928D;font-weight:900; }
      .session-dot.done { background:#E4F3E9;color:#31845F; }
      .session-row > div { display:grid; }
      .session-row strong { font-size:13px; }
      .session-row small { color:#88958F;font-size:10px;font-weight:700; }
      .session-result { text-align:right; }
      .empty-state { margin-top:14px; padding:20px; border-radius:14px; background:#F7F9F6; color:#7D8E87; font-size:13px; text-align:center; }
      .history-page h1 { max-width:none; font-size:34px; }
      .page-intro { color:#768980; }
      .history-page .session-list { background:#fff;border-radius:20px;padding:8px 18px;margin-top:20px; }
      .modal-backdrop { position:fixed;inset:0;z-index:80;background:rgba(17,41,33,.48);backdrop-filter:blur(7px);display:grid;place-items:center;padding:18px; }
      .profile-modal { position:relative;width:min(440px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:25px;padding:24px;box-shadow:0 30px 80px rgba(10,35,27,.3);display:grid;gap:14px; }
      .profile-modal h2 { font-size:27px; }
      .profile-modal > p:not(.eyebrow) { margin:0;color:#71837C;font-size:14px;line-height:1.5; }
      .profile-modal label { display:grid;gap:5px;color:#61736C;font-size:12px;font-weight:900; }
      .profile-modal input,.profile-modal select { border:1px solid #DDE5E0;border-radius:13px;padding:12px 13px;color:#1D332C;background:#FBFCFA; }
      .profile-modal fieldset { border:0;padding:0;margin:0; }
      .profile-modal legend { color:#61736C;font-size:12px;font-weight:900;margin-bottom:7px; }
      .avatar-grid { display:flex;flex-wrap:wrap;gap:6px; }
      .avatar-grid button { width:44px;height:44px;border-radius:13px;border:1px solid #E2E8E4;background:#FAFBF9;font-size:23px;cursor:pointer; }
      .avatar-grid button.active { border-color:#46A176;background:#EAF6EE;box-shadow:0 0 0 2px rgba(70,161,118,.12); }
      .modal-close { position:absolute;right:13px;top:13px;width:34px;height:34px;border:0;border-radius:50%;background:#F1F4F1;color:#60726A;font-size:22px;cursor:pointer; }
      .profile-submit { width:100%; }
      @media(max-width:700px) {
        .family-header { padding:11px 14px; }
        .family-actions { overflow-x:auto; }
        .family-actions button { padding:8px 9px;font-size:11px; }
        .family-main { padding:15px 13px 80px; }
        .welcome-card { align-items:flex-start;flex-direction:column;padding:19px; }
        .welcome-copy { align-items:flex-start; }
        .profile-avatar { width:52px;height:52px;font-size:31px;border-radius:16px; }
        .welcome-action { width:100%; }
        .welcome-action .cta { width:100%; }
        .metric-grid { grid-template-columns:repeat(2,1fr); }
        .dashboard-grid { grid-template-columns:1fr; }
        .metric { padding:12px 10px; }
        .language-line { grid-template-columns:92px 1fr 34px; }
      }
    `}</style>
  );
}
