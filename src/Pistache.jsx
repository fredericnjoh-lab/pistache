import React, { useState } from "react";

/* ─────────────────────────────────────────────
   PISTACHE v2 — plus ludique, plus vivant
   Nouveautés : onboarding "révélation du totem",
   3e monde (9-12 ans) avec simulateur "Et si ?",
   gommette du jour interactive, animations douces
───────────────────────────────────────────── */
const T = {
  paper: "#FBF7EE",
  card: "#FFFFFF",
  ink: "#3B342B",
  inkSoft: "#8A7F6E",
  green: "#4A7C59",
  greenSoft: "#E9F0EA",
  honey: "#E3A23C",
  honeySoft: "#FBF1DD",
  coral: "#DD7355",
  coralSoft: "#FAEAE4",
  sky: "#5E8FB4",
  skySoft: "#E7EFF5",
  line: "#EDE5D6",
  radius: 16,
};
const fontHead = "'Fredoka', system-ui, sans-serif";
const fontBody = "'Nunito', system-ui, sans-serif";

/* ── Atoms ─────────────────────────────────── */
const Card = ({ children, style, className }) => (
  <div
    className={className}
    style={{
      background: T.card,
      border: `1.5px solid ${T.line}`,
      borderRadius: T.radius,
      boxShadow: "0 2px 0 rgba(59,52,43,0.05)",
      ...style,
    }}
  >
    {children}
  </div>
);

const Btn = ({ children, onClick, variant = "primary", style, disabled }) => {
  const v = {
    primary: { background: T.green, color: "#fff", border: "none" },
    ghost: { background: "transparent", color: T.green, border: `1.5px solid ${T.green}` },
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: fontHead,
        fontWeight: 600,
        fontSize: 15,
        padding: "12px 20px",
        borderRadius: 999,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        minHeight: 46,
        transition: "transform .12s",
        ...v,
        ...style,
      }}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(.96)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
};

const Tag = ({ children, color = T.green, bg = T.greenSoft }) => (
  <span style={{ fontFamily: fontBody, fontSize: 12, fontWeight: 800, color, background: bg, borderRadius: 999, padding: "4px 11px" }}>
    {children}
  </span>
);

const AnimalBadge = ({ animal, size = 46, ring = T.honey, wiggle }) => (
  <div
    aria-hidden
    className={wiggle ? "wiggle" : ""}
    style={{
      width: size, height: size, borderRadius: 999, background: "#fff",
      border: `2.5px solid ${ring}`, display: "grid", placeItems: "center",
      fontSize: size * 0.52, flexShrink: 0,
    }}
  >
    {animal}
  </div>
);

/* ── SVG : bocal ───────────────────────────── */
const Jar = ({ fill, color, label, amount }) => {
  const fillH = Math.round(96 * 0.72 * fill);
  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 6 }}>
      <svg width="76" height="104" viewBox="0 0 76 104" role="img" aria-label={`${label} : ${amount}`}>
        <rect x="16" y="2" width="44" height="10" rx="4" fill={T.ink} opacity="0.85" />
        <path d="M14 14 h48 v6 q6 4 6 12 v58 q0 12 -12 12 h-36 q-12 0 -12 -12 v-58 q0 -8 6 -12 z"
          fill="#FDFCF9" stroke={T.line} strokeWidth="2.5" />
        <rect x="12" y={96 - fillH} width="52" height={fillH} rx="8" fill={color} opacity="0.8" style={{ transition: "all .5s ease" }} />
        {fill > 0.12 && <circle cx="30" cy={92 - fillH} r="6" fill={T.honey} stroke="#C9882B" strokeWidth="1.5" />}
        {fill > 0.35 && <circle cx="46" cy={95 - fillH} r="6" fill={T.honey} stroke="#C9882B" strokeWidth="1.5" />}
        <rect x="20" y="26" width="5" height="52" rx="2.5" fill="#fff" opacity="0.55" />
      </svg>
      <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 13.5, color: T.ink }}>{label}</div>
      <div style={{ fontFamily: fontBody, fontWeight: 800, fontSize: 14, color }}>{amount}</div>
    </div>
  );
};

/* ── SVG : courbe du renard ────────────────── */
const FoxCurve = () => {
  const pts = [4, 6, 6, 9, 12, 14, 18];
  const W = 560, H = 150, pl = 30, pr = 40, pt = 24, pb = 26, max = 20;
  const x = (i) => pl + (i * (W - pl - pr)) / (pts.length - 1);
  const y = (v) => pt + (1 - v / max) * (H - pt - pb);
  const d = pts.map((v, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }} role="img" aria-label="Épargne de Jeanne : de 4 à 18 euros en 7 semaines">
      {[5, 10, 15, 20].map((v) => (
        <g key={v}>
          <line x1={pl} x2={W - pr} y1={y(v)} y2={y(v)} stroke={T.line} strokeWidth="1.5" strokeDasharray="2 6" />
          <text x={pl - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill={T.inkSoft} fontFamily={fontBody} fontWeight="700">{v}€</text>
        </g>
      ))}
      <path d={d} fill="none" stroke={T.coral} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="4.5" fill="#fff" stroke={T.coral} strokeWidth="2.5" />)}
      <text x={x(6) + 8} y={y(18) - 6} fontSize="20" className="float">🦊</text>
      <text x={x(6) + 4} y={y(18) + 22} fontSize="11" fill={T.coral} fontFamily={fontHead} fontWeight="600">18 €</text>
      {["S1","S2","S3","S4","S5","S6","S7"].map((l, i) => (
        <text key={l} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10.5" fill={T.inkSoft} fontFamily={fontBody} fontWeight="700">{l}</text>
      ))}
    </svg>
  );
};

/* ── Données ───────────────────────────────── */
const worldOf = (age) => {
  if (age <= 5) return { animal: "🐿️", world: "Le monde de l'attente", color: T.honey, colorSoft: T.honeySoft,
    firstMission: "La boutique du salon",
    promise: "L'écureuil apprend à attendre et à échanger — avec de vraies pièces, jamais d'écran." };
  if (age <= 8) return { animal: "🦊", world: "Le monde des trois bocaux", color: T.coral, colorSoft: T.coralSoft,
    firstMission: "La paie du dimanche",
    promise: "Le renard répartit son argent de poche : dépenser, épargner, donner." };
  return { animal: "🦉", world: "Le monde des choix", color: T.sky, colorSoft: T.skySoft,
    firstMission: "Le simulateur « Et si ? »",
    promise: "Le hibou fait ses premiers arbitrages : budget réel, projets, patience qui rapporte." };
};

const initialKids = [
  { id: "leon", name: "Léon", age: 4, mission: "La boutique du salon", duration: "5 min",
    science: "À cet âge, tout se joue sur l'échange et la patience — pas sur les chiffres. Manipuler de vraies pièces construit la notion d'échange bien mieux que n'importe quel écran.",
    ...worldOf(4) },
  { id: "jeanne", name: "Jeanne", age: 7, mission: "La paie du dimanche", duration: "5 min",
    science: "Répartir soi-même son argent de poche en trois bocaux (dépenser, épargner, donner) ancre des réflexes que la recherche retrouve encore à l'âge adulte.",
    ...worldOf(7) },
  { id: "nina", name: "Nina", age: 10, mission: "Le simulateur « Et si ? »", duration: "5 min",
    science: "Vers 9-12 ans, l'abstraction devient possible : c'est le moment d'apprendre les arbitrages — et de rendre visible l'argent invisible des cartes sans contact.",
    ...worldOf(10) },
];

const ritualSteps = [
  { title: "Préparez la boutique",
    text: "Installez 3 objets sur la table basse : une banane, un doudou, un livre. Posez les étiquettes-prix : 1, 2 et 3 pièces.",
    tip: "Laissez Léon coller les étiquettes lui-même — c'est son magasin." },
  { title: "L'histoire du jour",
    text: "« Ce matin, Doudou-Lapin a très faim. Il a 2 pièces dans sa poche. Que peut-il acheter chez Léon ? »",
    tip: "Jouez le client avec Doudou. Tendez les pièces une par une, en comptant à voix haute." },
  { title: "Le moment clé : rendre la monnaie… ou pas",
    text: "Doudou tend 2 pièces pour la banane à 1 pièce. Laissez Léon découvrir qu'il doit rendre quelque chose.",
    tip: "S'il ne trouve pas, ne corrigez pas : demandez « Doudou a donné combien ? La banane coûte combien ? »" },
  { title: "On range et on raconte",
    text: "Léon compte sa caisse. Demandez-lui : « Qu'est-ce que tu as vendu aujourd'hui ? »",
    tip: "Capturez sa phrase du jour pour l'album — c'est le trésor de la semaine." },
];

const memories = [
  { kid: "Léon", animal: "🐿️", ring: T.honey, date: "Dimanche 7 juin",
    quote: "« Doudou, c'est pas assez de sous pour le livre, reviens demain ! »", ritual: "La boutique du salon" },
  { kid: "Nina", animal: "🦉", ring: T.sky, date: "Dimanche 7 juin",
    quote: "« Si je mets 5 € par semaine, j'ai ma console avant Noël. Je choisis Noël. »", ritual: "Le simulateur « Et si ? »" },
  { kid: "Jeanne", animal: "🦊", ring: T.coral, date: "Dimanche 7 juin",
    quote: "« Je mets plus dans épargner, parce que le vélo c'est long à attendre. »", ritual: "La paie du dimanche" },
  { kid: "Jeanne", animal: "🦊", ring: T.coral, date: "Mercredi 3 juin",
    quote: "A trouvé les pâtes les moins chères au kilo — avant papa.", ritual: "Le défi du supermarché" },
  { kid: "Léon", animal: "🐿️", ring: T.honey, date: "Samedi 30 mai",
    quote: "7 gommettes collées : le petit camion est enfin arrivé. Zéro larme d'attente cette fois.", ritual: "Le bocal magique" },
];

/* ── Onboarding : la révélation du totem ───── */
const Onboarding = ({ onDone, onCancel }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState(null);
  const w = age ? worldOf(age) : null;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {step === 0 && (
        <Card style={{ padding: 24, display: "grid", gap: 16 }} className="pop-in">
          <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 20 }}>Un nouveau renardeau ?</div>
          <label style={{ fontFamily: fontBody, fontSize: 13.5, fontWeight: 800, color: T.inkSoft, display: "grid", gap: 7 }}>
            Son prénom
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Marius, Alba, Sacha…"
              style={{
                fontFamily: fontBody, fontSize: 16, fontWeight: 700, color: T.ink,
                padding: "13px 15px", borderRadius: 12, border: `1.5px solid ${T.line}`,
                background: T.paper, outline: "none",
              }}
            />
          </label>
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
            <Btn variant="ghost" onClick={onCancel}>Annuler</Btn>
            <Btn disabled={!name.trim()} onClick={() => setStep(1)}>Continuer</Btn>
          </div>
        </Card>
      )}

      {step === 1 && (
        <Card style={{ padding: 24, display: "grid", gap: 16 }} className="pop-in">
          <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 20 }}>Quel âge a {name.trim()} ?</div>
          <p style={{ fontFamily: fontBody, fontSize: 13.5, color: T.inkSoft, margin: 0, lineHeight: 1.5 }}>
            L'âge décide de tout : le monde, le totem, et les missions. Le parcours grandit ensuite avec l'enfant.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
            {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((a) => (
              <button
                key={a}
                onClick={() => { setAge(a); setStep(2); }}
                style={{
                  fontFamily: fontHead, fontWeight: 600, fontSize: 17, color: T.ink,
                  background: T.paper, border: `1.5px solid ${T.line}`, borderRadius: 12,
                  padding: "13px 0", cursor: "pointer", minHeight: 48,
                }}
              >
                {a}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, fontFamily: fontBody, fontSize: 12, fontWeight: 800, color: T.inkSoft, justifyContent: "space-between", flexWrap: "wrap" }}>
            <span>🐿️ 3-5 : l'attente</span><span>🦊 6-8 : les bocaux</span><span>🦉 9-12 : les choix</span>
          </div>
        </Card>
      )}

      {step === 2 && w && (
        <Card style={{ padding: 28, display: "grid", gap: 14, justifyItems: "center", textAlign: "center", border: `2px solid ${w.color}` }} className="pop-in">
          <div style={{ fontFamily: fontBody, fontSize: 13, fontWeight: 800, color: T.inkSoft, letterSpacing: 0.5, textTransform: "uppercase" }}>
            Le totem de {name.trim()} est…
          </div>
          <AnimalBadge animal={w.animal} size={92} ring={w.color} wiggle />
          <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 24, color: T.ink }}>{w.world}</div>
          <p style={{ fontFamily: fontBody, fontSize: 14.5, color: T.inkSoft, margin: 0, maxWidth: 380, lineHeight: 1.6 }}>{w.promise}</p>
          <div style={{ background: w.colorSoft, borderRadius: 12, padding: "12px 18px", fontFamily: fontBody, fontSize: 14, color: T.ink }}>
            Première mission dimanche : <b>{w.firstMission}</b>
          </div>
          <Btn style={{ background: w.color }} onClick={() => onDone({ name: name.trim(), age })}>
            C'est parti pour l'aventure
          </Btn>
        </Card>
      )}
    </div>
  );
};

/* ── Écran : Cette semaine ─────────────────── */
const Home = ({ kids, startRitual, startSimulator, onAddKid }) => (
  <div style={{ display: "grid", gap: 14 }}>
    <Card style={{ padding: "16px 18px", background: T.greenSoft, border: "1.5px solid #D8E4DA", display: "flex", gap: 12, alignItems: "center" }}>
      <span style={{ fontSize: 26 }} aria-hidden>🌱</span>
      <div style={{ fontFamily: fontBody, fontSize: 14, color: T.ink, lineHeight: 1.5 }}>
        <b>Un rituel par enfant cette semaine, c'est tout.</b> Cinq minutes, sans écran pour eux — Pistache s'occupe du reste.
      </div>
    </Card>

    {kids.map((k) => (
      <Card key={k.id} style={{ padding: 18, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
          <AnimalBadge animal={k.animal} ring={k.color} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 17 }}>{k.name} · {k.age} ans</div>
            <div style={{ fontFamily: fontBody, fontSize: 13, fontWeight: 700, color: T.inkSoft }}>{k.world}</div>
          </div>
          <Tag color={k.color} bg={k.colorSoft}>à faire</Tag>
        </div>
        <div style={{ background: k.colorSoft, borderRadius: 12, padding: "13px 15px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 15.5 }}>{k.mission}</div>
            <div style={{ fontFamily: fontBody, fontSize: 12.5, fontWeight: 700, color: T.inkSoft }}>
              {k.duration} · à deux · {k.age <= 8 ? "de vraies pièces" : "un vrai projet"}
            </div>
          </div>
          <Btn onClick={() => (k.id === "nina" || k.age >= 9 ? startSimulator() : startRitual(k))} style={{ background: k.color }}>
            C'est parti
          </Btn>
        </div>
        <details style={{ fontFamily: fontBody, fontSize: 13, color: T.inkSoft, lineHeight: 1.55 }}>
          <summary style={{ cursor: "pointer", fontWeight: 800, color: T.green }}>Pourquoi ce rituel à cet âge ?</summary>
          <p style={{ margin: "8px 0 0" }}>{k.science}</p>
        </details>
      </Card>
    ))}

    <button
      onClick={onAddKid}
      style={{
        fontFamily: fontHead, fontWeight: 600, fontSize: 15, color: T.green,
        background: "transparent", border: `2px dashed ${T.green}`, borderRadius: T.radius,
        padding: "16px", cursor: "pointer", minHeight: 54,
      }}
    >
      + Ajouter un enfant (3-12 ans)
    </button>
  </div>
);

/* ── Écran : Rituel guidé (3-8 ans) ────────── */
const Ritual = ({ kid, onDone, onBack }) => {
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const s = ritualSteps[step];

  if (finished)
    return (
      <Card style={{ padding: 28, textAlign: "center", display: "grid", gap: 14, justifyItems: "center" }} className="pop-in">
        <AnimalBadge animal={kid.animal} size={70} ring={kid.color} wiggle />
        <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 22 }}>Bravo à vous deux !</div>
        <p style={{ fontFamily: fontBody, fontSize: 14.5, color: T.inkSoft, margin: 0, maxWidth: 380, lineHeight: 1.6 }}>
          La phrase du jour de {kid.name} est gardée dans l'album. L'écureuil retourne faire ses réserves — rendez-vous dimanche prochain.
        </p>
        <div style={{ background: T.honeySoft, borderRadius: 12, padding: "12px 16px", fontFamily: fontBody, fontSize: 13.5, fontStyle: "italic" }}>
          « Doudou, c'est pas assez de sous pour le livre, reviens demain ! »
        </div>
        <Btn onClick={onDone}>Voir l'album souvenirs</Btn>
      </Card>
    );

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} aria-label="Retour"
          style={{ fontFamily: fontHead, border: `1.5px solid ${T.line}`, background: "#fff", borderRadius: 999, width: 40, height: 40, cursor: "pointer", fontSize: 17, color: T.ink }}>
          ←
        </button>
        <div>
          <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 17 }}>{kid.mission}</div>
          <div style={{ fontFamily: fontBody, fontSize: 12.5, fontWeight: 700, color: T.inkSoft }}>
            avec {kid.name} · étape {step + 1} sur {ritualSteps.length}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {ritualSteps.map((_, i) => (
          <span key={i} style={{ flex: 1, height: 8, borderRadius: 99, background: i <= step ? kid.color : T.line, transition: "background .25s" }} />
        ))}
      </div>
      <Card style={{ padding: 22, display: "grid", gap: 14 }} className="pop-in">
        <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 19 }}>{s.title}</div>
        <p style={{ fontFamily: fontBody, fontSize: 15.5, lineHeight: 1.65, margin: 0 }}>{s.text}</p>
        <div style={{ background: T.greenSoft, borderRadius: 12, padding: "12px 15px", fontFamily: fontBody, fontSize: 13.5, lineHeight: 1.55 }}>
          <b style={{ color: T.green }}>Le geste qui compte :</b> {s.tip}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
          {step > 0 ? <Btn variant="ghost" onClick={() => setStep((v) => v - 1)}>Précédent</Btn> : <span />}
          {step < ritualSteps.length - 1
            ? <Btn onClick={() => setStep((v) => v + 1)} style={{ background: kid.color }}>Étape suivante</Btn>
            : <Btn onClick={() => setFinished(true)} style={{ background: kid.color }}>Terminer le rituel</Btn>}
        </div>
      </Card>
    </div>
  );
};

/* ── Écran : Simulateur « Et si ? » (9-12) ── */
const Simulator = ({ onBack }) => {
  const goal = 199, saved = 52;
  const [weekly, setWeekly] = useState(4);
  const remaining = goal - saved;
  const weeks = Math.ceil(remaining / weekly);
  const arrival = new Date(2026, 5, 11 + weeks * 7);
  const monthNames = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
  const arrivalTxt = `${arrival.getDate()} ${monthNames[arrival.getMonth()]} ${arrival.getFullYear()}`;
  const beforeChristmas = arrival <= new Date(2026, 11, 25);
  const pct = saved / goal;

  /* le hibou vole le long du chemin selon l'effort */
  const W = 560, H = 120;
  const owlX = 40 + pct * (W - 110);

  const mood =
    weekly <= 2 ? { txt: "À ce rythme, le hibou somnole… c'est loin. Mais c'est SON choix — et ça se respecte.", bg: T.skySoft } :
    weekly <= 5 ? { txt: "Bon rythme de croisière : l'effort reste indolore et le but se rapproche chaque dimanche.", bg: T.greenSoft } :
    { txt: "Rythme d'aigle ! Attention : un objectif trop dur à tenir s'abandonne. Mieux vaut 4 € tenus que 8 € rêvés.", bg: T.honeySoft };

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onBack} aria-label="Retour"
          style={{ fontFamily: fontHead, border: `1.5px solid ${T.line}`, background: "#fff", borderRadius: 999, width: 40, height: 40, cursor: "pointer", fontSize: 17, color: T.ink }}>
          ←
        </button>
        <div>
          <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 17 }}>Le simulateur « Et si ? »</div>
          <div style={{ fontFamily: fontBody, fontSize: 12.5, fontWeight: 700, color: T.inkSoft }}>avec Nina · 10 ans · 🦉 le monde des choix</div>
        </div>
      </div>

      <Card style={{ padding: 20, display: "grid", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
          <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 16.5 }}>🎯 Son grand projet : la console</div>
          <span style={{ fontFamily: fontBody, fontWeight: 800, fontSize: 14, color: T.sky }}>{saved} € / {goal} €</span>
        </div>
        {/* chemin du hibou */}
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }} role="img"
          aria-label={`Nina a épargné ${saved} euros sur ${goal}. Au rythme choisi, objectif atteint le ${arrivalTxt}.`}>
          <path d={`M40 ${H - 34} Q ${W / 2} ${H - 70} ${W - 50} ${H - 34}`} fill="none" stroke={T.line} strokeWidth="5" strokeLinecap="round" strokeDasharray="1 12" />
          <text x={W - 58} y={H - 42} fontSize="26">🎁</text>
          <text x={owlX} y={H - 46 - Math.sin(pct * Math.PI) * 34} fontSize="26" className="float">🦉</text>
          <text x="34" y={H - 8} fontSize="11" fill={T.inkSoft} fontFamily={fontBody} fontWeight="700">départ</text>
          <text x={W - 72} y={H - 8} fontSize="11" fill={T.inkSoft} fontFamily={fontBody} fontWeight="700">console</text>
        </svg>
      </Card>

      <Card style={{ padding: 20, display: "grid", gap: 14 }}>
        <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 16 }}>
          Et si Nina mettait de côté…
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <input
            type="range" min="1" max="10" value={weekly}
            onChange={(e) => setWeekly(Number(e.target.value))}
            aria-label="Montant épargné par semaine"
            style={{ flex: 1, accentColor: T.sky, height: 34 }}
          />
          <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 26, color: T.sky, minWidth: 108, textAlign: "right" }}>
            {weekly} € <span style={{ fontSize: 13, color: T.inkSoft, fontFamily: fontBody, fontWeight: 800 }}>/ semaine</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: T.skySoft, borderRadius: 12, padding: "13px 15px", display: "grid", gap: 3 }}>
            <span style={{ fontFamily: fontBody, fontSize: 12, fontWeight: 800, color: T.inkSoft }}>Temps de vol restant</span>
            <span style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 23 }}>{weeks} semaines</span>
          </div>
          <div style={{ background: T.skySoft, borderRadius: 12, padding: "13px 15px", display: "grid", gap: 3 }}>
            <span style={{ fontFamily: fontBody, fontSize: 12, fontWeight: 800, color: T.inkSoft }}>Atterrissage prévu</span>
            <span style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 17, lineHeight: 1.3 }}>
              {arrivalTxt} {beforeChristmas ? "· avant Noël 🎄" : "· après Noël"}
            </span>
          </div>
        </div>

        <div style={{ background: mood.bg, borderRadius: 12, padding: "12px 15px", fontFamily: fontBody, fontSize: 13.5, lineHeight: 1.55 }}>
          <b style={{ color: T.sky }}>Le hibou observe :</b> {mood.txt}
        </div>

        <div style={{ background: T.paper, border: `1.5px dashed ${T.line}`, borderRadius: 12, padding: "12px 15px", fontFamily: fontBody, fontSize: 13, color: T.inkSoft, lineHeight: 1.55 }}>
          <b style={{ color: T.ink }}>Pour le parent :</b> laissez Nina bouger le curseur elle-même et choisir SON rythme.
          L'objectif du rituel n'est pas d'épargner vite — c'est de <b>voir</b> qu'un choix d'aujourd'hui déplace une date de demain.
        </div>
      </Card>
    </div>
  );
};

/* ── Écran : Bocaux & progression ──────────── */
const Jars = () => {
  const [who, setWho] = useState("jeanne");
  const [stuck, setStuck] = useState(4);
  const selector = [
    { id: "leon", name: "Léon", animal: "🐿️", color: T.honey, colorSoft: T.honeySoft },
    { id: "jeanne", name: "Jeanne", animal: "🦊", color: T.coral, colorSoft: T.coralSoft },
    { id: "nina", name: "Nina", animal: "🦉", color: T.sky, colorSoft: T.skySoft },
  ];
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {selector.map((k) => (
          <button key={k.id} onClick={() => setWho(k.id)}
            style={{
              fontFamily: fontHead, fontWeight: 600, fontSize: 14, padding: "9px 16px", borderRadius: 999, cursor: "pointer",
              border: `1.5px solid ${who === k.id ? k.color : T.line}`,
              background: who === k.id ? k.colorSoft : "#fff", color: T.ink,
              display: "flex", gap: 7, alignItems: "center",
            }}>
            <span aria-hidden>{k.animal}</span> {k.name}
          </button>
        ))}
      </div>

      {who === "jeanne" && (
        <>
          <Card style={{ padding: 20, display: "grid", gap: 16 }} className="pop-in">
            <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 16.5 }}>Les trois bocaux de Jeanne</div>
            <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 12 }}>
              <Jar fill={0.35} color={T.coral} label="Dépenser" amount="7 €" />
              <Jar fill={0.72} color={T.green} label="Épargner" amount="18 €" />
              <Jar fill={0.2} color={T.honey} label="Donner" amount="4 €" />
            </div>
            <div style={{ background: T.coralSoft, borderRadius: 12, padding: "11px 14px", fontFamily: fontBody, fontSize: 13.5, lineHeight: 1.5 }}>
              🎯 <b>Son grand projet :</b> le vélo rouge (45 €). Au rythme actuel : <b>vers la mi‑septembre</b>.
            </div>
          </Card>
          <Card style={{ padding: 20, display: "grid", gap: 10 }}>
            <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 16.5 }}>Le renard grimpe — épargne sur 7 semaines</div>
            <FoxCurve />
            <p style={{ fontFamily: fontBody, fontSize: 13, color: T.inkSoft, margin: 0, lineHeight: 1.5 }}>
              Sa première courbe de patrimoine. Elle la connaît par cœur — c'est elle qui demande à la voir.
            </p>
          </Card>
        </>
      )}

      {who === "leon" && (
        <Card style={{ padding: 20, display: "grid", gap: 16 }} className="pop-in">
          <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 16.5 }}>Le bocal magique de Léon</div>
          <p style={{ fontFamily: fontBody, fontSize: 14, color: T.inkSoft, margin: 0, lineHeight: 1.55 }}>
            Léon attend <b style={{ color: T.ink }}>le petit bateau bleu</b>. Une gommette par jour d'attente —
            à 7 gommettes, on va le chercher ensemble.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => {
              const done = i <= stuck;
              const isNext = i === stuck + 1;
              return (
                <button
                  key={i}
                  onClick={() => isNext && setStuck(i)}
                  aria-label={done ? "jour d'attente réussi" : isNext ? "coller la gommette du jour" : "jour à venir"}
                  style={{
                    width: 48, height: 48, borderRadius: 999, display: "grid", placeItems: "center", fontSize: 22,
                    background: done ? T.honeySoft : "#fff",
                    border: `2px dashed ${done ? T.honey : isNext ? T.green : T.line}`,
                    cursor: isNext ? "pointer" : "default",
                  }}
                  className={done && i === stuck ? "pop-in" : ""}
                >
                  {done ? "⭐" : isNext ? "+" : ""}
                </button>
              );
            })}
          </div>
          {stuck >= 7 ? (
            <div style={{ background: T.honeySoft, borderRadius: 12, padding: "11px 14px", fontFamily: fontBody, fontSize: 13.5, lineHeight: 1.5 }} className="pop-in">
              🎉 <b>7 jours d'attente : c'est le grand jour !</b> Allez chercher le bateau bleu ensemble —
              et laissez Léon payer avec ses pièces, c'est SA victoire.
            </div>
          ) : (
            <div style={{ background: T.greenSoft, borderRadius: 12, padding: "11px 14px", fontFamily: fontBody, fontSize: 13.5, lineHeight: 1.5 }}>
              <b style={{ color: T.green }}>{stuck} jour{stuck > 1 ? "s" : ""} d'attente déjà</b> — appuyez sur le cercle vert
              avec Léon pour coller la gommette du jour. On gamifie la patience, jamais la dépense.
            </div>
          )}
        </Card>
      )}

      {who === "nina" && (
        <Card style={{ padding: 20, display: "grid", gap: 14 }} className="pop-in">
          <div style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 16.5 }}>Le vol du hibou de Nina</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ background: T.skySoft, borderRadius: 12, padding: "13px 15px", display: "grid", gap: 3 }}>
              <span style={{ fontFamily: fontBody, fontSize: 12, fontWeight: 800, color: T.inkSoft }}>Épargné pour la console</span>
              <span style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 23 }}>52 € <span style={{ fontSize: 13, color: T.inkSoft }}>/ 199 €</span></span>
            </div>
            <div style={{ background: T.skySoft, borderRadius: 12, padding: "13px 15px", display: "grid", gap: 3 }}>
              <span style={{ fontFamily: fontBody, fontSize: 12, fontWeight: 800, color: T.inkSoft }}>Budget anniversaire géré</span>
              <span style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 23 }}>30 € <span style={{ fontSize: 13, color: T.green }}>tenu ✓</span></span>
            </div>
          </div>
          <p style={{ fontFamily: fontBody, fontSize: 13.5, color: T.inkSoft, margin: 0, lineHeight: 1.55 }}>
            À cet âge, l'app passe du bocal au projet : Nina simule, arbitre, et découvre que l'argent invisible
            (la carte de papa) obéit aux mêmes règles que ses pièces.
          </p>
        </Card>
      )}
    </div>
  );
};

/* ── Écran : Album souvenirs ───────────────── */
const Album = () => (
  <div style={{ display: "grid", gap: 14 }}>
    <p style={{ fontFamily: fontBody, fontSize: 14, color: T.inkSoft, margin: 0, lineHeight: 1.55 }}>
      Leurs phrases, leurs victoires, leurs bocaux — le journal de leur vie d'argent, semaine après semaine.
    </p>
    {memories.map((m, i) => (
      <Card key={i} style={{ padding: 17, display: "flex", gap: 14 }}>
        <AnimalBadge animal={m.animal} size={42} ring={m.ring} />
        <div style={{ display: "grid", gap: 5, flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 14.5 }}>{m.kid}</span>
            <span style={{ fontFamily: fontBody, fontSize: 12, fontWeight: 700, color: T.inkSoft }}>{m.date}</span>
          </div>
          <p style={{ fontFamily: fontBody, fontSize: 14.5, margin: 0, lineHeight: 1.55, fontStyle: m.quote.startsWith("«") ? "italic" : "normal" }}>
            {m.quote}
          </p>
          <Tag color={T.inkSoft} bg={T.paper}>{m.ritual}</Tag>
        </div>
      </Card>
    ))}
  </div>
);

/* ── Shell ─────────────────────────────────── */
export default function Pistache() {
  const [tab, setTab] = useState("semaine");
  const [screen, setScreen] = useState(null); // null | {type:'ritual',kid} | {type:'simulator'} | {type:'onboarding'}
  const [kids, setKids] = useState(initialKids);

  const tabs = [
    { id: "semaine", label: "Cette semaine", icon: "🗓️" },
    { id: "bocaux", label: "Les bocaux", icon: "🫙" },
    { id: "album", label: "Souvenirs", icon: "📔" },
  ];

  const titles = {
    semaine: ["Bonjour Fred", `${kids.length} rituels de 5 minutes vous attendent — un par renardeau.`],
    bocaux: ["Leur épargne, en vrai", "De vraies pièces, de vrais bocaux — l'app ne fait que dessiner ce qu'ils construisent."],
    album: ["L'album de famille", "Dans 9 ans, ce journal sera leur plus belle leçon d'argent."],
  };

  const addKid = ({ name, age }) => {
    const w = worldOf(age);
    setKids((ks) => [...ks, {
      id: name.toLowerCase() + Date.now(), name, age,
      mission: w.firstMission, duration: "5 min",
      science: "Le parcours s'adapte automatiquement : missions, totem et rythme évoluent avec l'âge.",
      ...w,
    }]);
    setScreen(null);
  };

  return (
    <div style={{ background: T.paper, minHeight: "100vh", color: T.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600&family=Nunito:wght@400;700;800&display=swap');
        *{box-sizing:border-box;}
        body{margin:0;}
        button:focus-visible, input:focus-visible{outline:2.5px solid ${T.green}; outline-offset:2px;}
        details summary::-webkit-details-marker{display:none;}
        details summary{list-style:none;}
        @keyframes popIn{0%{transform:scale(.92);opacity:0}70%{transform:scale(1.02)}100%{transform:scale(1);opacity:1}}
        .pop-in{animation:popIn .35s ease both;}
        @keyframes wiggle{0%,100%{transform:rotate(0)}25%{transform:rotate(-7deg)}75%{transform:rotate(7deg)}}
        .wiggle{animation:wiggle .8s ease 2;}
        @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .float{animation:floaty 2.2s ease-in-out infinite;}
        @media (prefers-reduced-motion: reduce){*{animation:none !important;transition:none !important;}}
      `}</style>

      <header style={{ background: T.paper, borderBottom: `1.5px solid ${T.line}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 660, margin: "0 auto", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 24 }} aria-hidden>🐿️</span>
            <span style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 20, color: T.green, letterSpacing: -0.3 }}>Pistache</span>
          </div>
          <span style={{ fontFamily: fontBody, fontSize: 12.5, fontWeight: 800, color: T.inkSoft }}>
            Famille Fred · {kids.length} enfants
          </span>
        </div>
      </header>

      <main style={{ maxWidth: 660, margin: "0 auto", padding: "20px 18px 110px" }}>
        {!screen && (
          <div style={{ marginBottom: 16 }}>
            <h1 style={{ fontFamily: fontHead, fontWeight: 600, fontSize: 24, margin: 0, letterSpacing: -0.3 }}>{titles[tab][0]}</h1>
            <p style={{ fontFamily: fontBody, fontSize: 14, color: T.inkSoft, margin: "5px 0 0", lineHeight: 1.5 }}>{titles[tab][1]}</p>
          </div>
        )}

        {screen?.type === "ritual" && (
          <Ritual kid={screen.kid} onBack={() => setScreen(null)}
            onDone={() => { setScreen(null); setTab("album"); }} />
        )}
        {screen?.type === "simulator" && <Simulator onBack={() => setScreen(null)} />}
        {screen?.type === "onboarding" && (
          <Onboarding onDone={addKid} onCancel={() => setScreen(null)} />
        )}

        {!screen && (
          <>
            {tab === "semaine" && (
              <Home kids={kids}
                startRitual={(k) => setScreen({ type: "ritual", kid: k })}
                startSimulator={() => setScreen({ type: "simulator" })}
                onAddKid={() => setScreen({ type: "onboarding" })} />
            )}
            {tab === "bocaux" && <Jars />}
            {tab === "album" && <Album />}
          </>
        )}
      </main>

      {!screen && (
        <nav aria-label="Navigation principale"
          style={{
            position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff",
            borderTop: `1.5px solid ${T.line}`, display: "flex", justifyContent: "center",
            gap: 6, padding: "8px 10px calc(8px + env(safe-area-inset-bottom))", zIndex: 10,
          }}>
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} aria-current={active ? "page" : undefined}
                style={{
                  fontFamily: fontHead, fontWeight: 600, fontSize: 13,
                  color: active ? T.green : T.inkSoft, background: active ? T.greenSoft : "transparent",
                  border: "none", borderRadius: 12, padding: "9px 18px", cursor: "pointer",
                  display: "grid", justifyItems: "center", gap: 3, minWidth: 96,
                }}>
                <span style={{ fontSize: 19 }} aria-hidden>{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
