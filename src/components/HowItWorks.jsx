import React from "react";

/**
 * Le principe, en une image : la boucle en 4 temps, les 3 règles,
 * et ce que l'app n'est pas.
 */

export const LOOP_STEPS = [
  {
    n: 1,
    icon: "👆",
    title: "Iel touche l’image",
    text: "Un objet qu’iel connaît déjà : pomme, chien, chaussure. Rien de nouveau à comprendre.",
  },
  {
    n: 2,
    icon: "🔊",
    title: "Iel entend le mot",
    text: "Deux fois, dans une des quatre langues. Ta voix si tu l’as enregistrée, sinon celle du téléphone.",
  },
  {
    n: 3,
    icon: "🗣️",
    title: "Iel le redit",
    text: "Le téléphone écoute. Reconnaître ne suffit pas — c’est en le disant que le mot s’installe.",
  },
  {
    n: 4,
    icon: "🔁",
    title: "S’iel se trompe",
    text: "Aucun bip, aucune croix. Le mot est redit calmement, puis revient 3 tours plus tard, et demain.",
  },
];

export const RULES = [
  {
    icon: "🍎",
    title: "30 objets, 4 langues",
    text: "Les mêmes objets en anglais, espagnol, mandarin et japonais. Iel connaît déjà la chose — iel n’apprend que le son.",
  },
  {
    icon: "2️⃣",
    title: "2 mots neufs par jour",
    text: "D’abord les ratés d’hier, puis les mots oubliés depuis 4 jours, et seulement ensuite 2 nouveautés. Jamais plus.",
  },
  {
    icon: "🍽️",
    title: "4 mots pour le dîner",
    text: "Chaque soir l’app te donne 4 mots à dire à table, avec le moment exact. C’est là que la langue continue, écran éteint.",
  },
];

export function HowItWorks({ compact = false }) {
  return (
    <div className={`how ${compact ? "compact" : ""}`}>
      <div className="how-principle">
        <p className="eyebrow">Le principe</p>
        <h2>
          Un enfant de 3 ans ne lit pas.
          <br />
          Alors l’app parle, et l’écoute.
        </h2>
        <p className="how-lede">
          Onze minutes par jour. Iel touche une image, entend le mot, le redit à voix haute.
          L’app retient ce qui accroche et te dit quoi glisser au dîner.
        </p>
      </div>

      <ol className="loop-steps">
        {LOOP_STEPS.map((s) => (
          <li key={s.n}>
            <span className="loop-num">{s.n}</span>
            <span className="loop-icon" aria-hidden>
              {s.icon}
            </span>
            <div>
              <strong>{s.title}</strong>
              <p>{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="rules">
        {RULES.map((r) => (
          <div key={r.title} className="rule">
            <span className="rule-icon" aria-hidden>
              {r.icon}
            </span>
            <strong>{r.title}</strong>
            <p>{r.text}</p>
          </div>
        ))}
      </div>

      <div className="not-this">
        <strong>Ce que ce n’est pas</strong>
        <ul>
          <li>Pas de texte à lire pour l’enfant</li>
          <li>Pas de menus, pas de niveaux, pas de points</li>
          <li>Pas de série à ne pas casser</li>
          <li>Pas un prof — un souffleur pour les parents</li>
        </ul>
      </div>
    </div>
  );
}

export function HowItWorksStyles() {
  return (
    <style>{`
      .how { display: grid; gap: 18px; }
      .how-principle h2 {
        font-family: var(--font-head); font-weight: 800;
        font-size: clamp(24px, 6.2vw, 34px); line-height: 1.15; margin: 4px 0 0;
        letter-spacing: -0.02em;
      }
      .how-lede {
        margin: 10px 0 0; font-size: 15.5px; line-height: 1.6; color: var(--ink-soft);
        max-width: 46ch;
      }

      .loop-steps {
        list-style: none; margin: 0; padding: 0; display: grid; gap: 10px;
        counter-reset: none;
      }
      .loop-steps li {
        position: relative;
        display: grid; grid-template-columns: 30px 42px 1fr; gap: 10px; align-items: start;
        background: var(--card); border: 1px solid rgba(38,70,83,.08);
        border-radius: 16px; padding: 14px;
      }
      .loop-steps li::after {
        content: ""; position: absolute; left: 29px; bottom: -10px; height: 10px;
        border-left: 2px dashed rgba(42,157,143,.35);
      }
      .loop-steps li:last-child::after { display: none; }
      .loop-num {
        width: 28px; height: 28px; border-radius: 50%;
        display: grid; place-items: center;
        background: var(--mint); color: #fff;
        font-family: var(--font-head); font-weight: 800; font-size: 15px;
      }
      .loop-icon { font-size: 30px; line-height: 1; }
      .loop-steps strong {
        font-family: var(--font-head); font-weight: 800; font-size: 16.5px; display: block;
      }
      .loop-steps p { margin: 4px 0 0; font-size: 14px; line-height: 1.5; color: var(--ink-soft); }

      .rules { display: grid; gap: 10px; }
      .rule {
        background: var(--card); border: 1px solid rgba(38,70,83,.08);
        border-radius: 16px; padding: 14px;
      }
      .rule-icon { font-size: 26px; display: block; margin-bottom: 4px; }
      .rule strong { font-family: var(--font-head); font-weight: 800; font-size: 16px; }
      .rule p { margin: 4px 0 0; font-size: 14px; line-height: 1.5; color: var(--ink-soft); }

      .not-this {
        background: rgba(231,111,81,.08); border: 1px solid rgba(231,111,81,.2);
        border-radius: 16px; padding: 14px 16px;
      }
      .not-this strong { font-family: var(--font-head); font-weight: 800; font-size: 15px; color: var(--coral); }
      .not-this ul { margin: 8px 0 0; padding-left: 18px; display: grid; gap: 4px; }
      .not-this li { font-size: 14px; line-height: 1.45; color: var(--ink-soft); }

      @media (min-width: 560px) {
        .rules { grid-template-columns: repeat(3, 1fr); }
      }
      .how.compact .loop-steps p, .how.compact .rule p { font-size: 13.5px; }
    `}</style>
  );
}
