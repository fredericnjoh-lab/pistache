import React from "react";

export default function Landing3D({ onEnter }) {
  return (
    <div className="landing">
      <div className="landing-glow glow-a" />
      <div className="landing-glow glow-b" />

      <header className="landing-nav">
        <div className="landing-brand">
          <span>🌿</span>
          <strong>Pistache</strong>
        </div>
        <button type="button" className="landing-login" onClick={onEnter}>
          Espace famille
        </button>
      </header>

      <main className="landing-main">
        <section className="landing-copy">
          <div className="landing-badge">
            <span>●</span> Pour les 3–6 ans
          </div>
          <h1>
            Quatre langues.
            <br />
            <em>Une voix familière.</em>
          </h1>
          <p>
            Une boucle de 11 minutes qui écoute chaque enfant, comprend où il en est
            et choisit les bons mots pour demain.
          </p>
          <div className="landing-actions">
            <button type="button" className="landing-cta" onClick={onEnter}>
              Commencer l’aventure <span>→</span>
            </button>
            <span className="landing-note">30 objets · 4 langues · zéro pression</span>
          </div>
        </section>

        <section className="scene-wrap" aria-label="Aperçu ludique de Pistache">
          <div className="scene">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />

            <div className="phone-3d">
              <div className="phone-screen">
                <div className="phone-top">
                  <span>1 / 20</span>
                  <span>🇬🇧 Anglais</span>
                </div>
                <div className="phone-orb">
                  <span>🍎</span>
                </div>
                <strong>apple</strong>
                <small>pomme</small>
                <div className="phone-steps">
                  <i className="on">👆</i>
                  <i>🔊</i>
                  <i>🗣️</i>
                </div>
              </div>
            </div>

            <div className="float-card card-progress">
              <span className="float-icon">↗</span>
              <div>
                <small>Cette semaine</small>
                <strong>+12 mots</strong>
              </div>
            </div>

            <div className="float-card card-profile">
              <span className="avatar-mini">🦊</span>
              <div>
                <strong>Lina</strong>
                <small>En belle progression</small>
              </div>
            </div>

            <div className="float-word word-a">hola</div>
            <div className="float-word word-b">你好</div>
            <div className="float-word word-c">りんご</div>
            <div className="shape cube"><span>★</span></div>
            <div className="shape sphere" />
          </div>
        </section>
      </main>

      <section className="landing-proof">
        <article>
          <span>01</span>
          <strong>Un parcours par enfant</strong>
          <p>Âge, rythme, réussites et difficultés restent séparés.</p>
        </article>
        <article>
          <span>02</span>
          <strong>La bonne séance, au bon moment</strong>
          <p>Ratés d’hier, mots à revoir, deux nouveautés maximum.</p>
        </article>
        <article>
          <span>03</span>
          <strong>La famille continue hors écran</strong>
          <p>Quatre mots précis à glisser dans la journée.</p>
        </article>
      </section>
    </div>
  );
}

export function Landing3DStyles() {
  return (
    <style>{`
      .landing {
        position: relative; min-height: 100vh; min-height: 100dvh; overflow: hidden;
        background: #F4F8F1; color: #17342C;
      }
      .landing-glow { position: absolute; border-radius: 50%; filter: blur(2px); pointer-events: none; }
      .glow-a { width: 520px; height: 520px; right: -160px; top: -200px; background: rgba(201,239,179,.65); }
      .glow-b { width: 380px; height: 380px; left: -190px; bottom: -180px; background: rgba(255,225,160,.45); }
      .landing-nav {
        position: relative; z-index: 5; max-width: 1180px; margin: 0 auto;
        padding: 24px 28px; display: flex; align-items: center; justify-content: space-between;
      }
      .landing-brand { display: flex; align-items: center; gap: 10px; }
      .landing-brand span { font-size: 30px; }
      .landing-brand strong { font-family: var(--font-head); font-size: 25px; color: #1D7A57; }
      .landing-login {
        border: 1px solid rgba(23,52,44,.15); background: rgba(255,255,255,.7);
        color: #17342C; border-radius: 999px; padding: 11px 18px; font-weight: 800; cursor: pointer;
        backdrop-filter: blur(10px);
      }
      .landing-main {
        position: relative; z-index: 2; max-width: 1180px; min-height: 650px; margin: 0 auto;
        padding: 45px 28px 50px; display: grid; grid-template-columns: .9fr 1.1fr;
        align-items: center; gap: 40px;
      }
      .landing-copy { display: grid; gap: 22px; align-content: center; }
      .landing-badge {
        justify-self: start; display: flex; align-items: center; gap: 8px;
        padding: 8px 13px; border-radius: 999px; background: #fff;
        font-size: 12px; font-weight: 800; color: #49695E; box-shadow: 0 8px 24px rgba(28,88,67,.08);
      }
      .landing-badge span { color: #55B985; font-size: 11px; }
      .landing-copy h1 {
        max-width: none; font-size: clamp(48px, 6vw, 80px); line-height: .97;
        letter-spacing: -.05em; color: #17342C;
      }
      .landing-copy h1 em { color: #50A979; font-style: normal; }
      .landing-copy > p { max-width: 520px; margin: 0; font-size: 18px; line-height: 1.65; color: #597068; }
      .landing-actions { display: flex; align-items: center; gap: 18px; flex-wrap: wrap; }
      .landing-cta {
        border: none; border-radius: 18px; padding: 17px 22px;
        background: #173E32; color: #fff; font-family: var(--font-head); font-size: 17px; font-weight: 800;
        box-shadow: 0 15px 30px rgba(23,62,50,.22); cursor: pointer;
        transition: transform .2s, box-shadow .2s;
      }
      .landing-cta:hover { transform: translateY(-3px); box-shadow: 0 20px 36px rgba(23,62,50,.28); }
      .landing-cta span { margin-left: 12px; }
      .landing-note { font-size: 12px; font-weight: 800; color: #779087; }

      .scene-wrap { min-height: 580px; display: grid; place-items: center; perspective: 1100px; }
      .scene { position: relative; width: min(570px, 48vw); height: 560px; transform-style: preserve-3d; }
      .phone-3d {
        position: absolute; width: 260px; height: 500px; left: 50%; top: 48%;
        transform: translate(-50%,-50%) rotateY(-15deg) rotateX(7deg) rotateZ(2deg);
        border: 8px solid #17342C; border-radius: 44px; background: #17342C;
        box-shadow: 35px 48px 70px rgba(28,71,56,.24), -8px 2px 0 #416C5F;
        z-index: 2; transform-style: preserve-3d; animation: phoneFloat 5s ease-in-out infinite;
      }
      .phone-3d::before {
        content: ""; position: absolute; top: 11px; left: 50%; transform: translateX(-50%);
        width: 78px; height: 20px; border-radius: 99px; background: #17342C; z-index: 3;
      }
      .phone-screen {
        height: 100%; border-radius: 35px; overflow: hidden; padding: 36px 18px 20px;
        background: radial-gradient(circle at 70% 10%, #FFF0B8, transparent 38%),
          linear-gradient(160deg,#F4F8F1,#D9EFE4);
        display: grid; justify-items: center; align-content: start; gap: 8px;
      }
      .phone-top { width: 100%; display: flex; justify-content: space-between; color: #5B756C; font-size: 9px; font-weight: 800; }
      .phone-orb {
        margin-top: 35px; width: 170px; height: 170px; border-radius: 50%; display: grid; place-items: center;
        background: linear-gradient(145deg,#fff,#FFE1D5); box-shadow: 0 0 0 10px rgba(232,93,76,.14), 0 18px 30px rgba(28,71,56,.12);
      }
      .phone-orb span { font-size: 92px; filter: drop-shadow(0 7px 8px rgba(0,0,0,.1)); }
      .phone-screen > strong { margin-top: 18px; font-family: var(--font-head); font-size: 36px; }
      .phone-screen > small { font-size: 13px; color: #688077; font-weight: 800; }
      .phone-steps { margin-top: 18px; display: flex; gap: 8px; }
      .phone-steps i {
        width: 38px; height: 28px; border-radius: 99px; display: grid; place-items: center;
        background: rgba(255,255,255,.75); font-style: normal; font-size: 13px;
      }
      .phone-steps i.on { background: #E85D4C; }

      .float-card {
        position: absolute; z-index: 4; display: flex; align-items: center; gap: 10px;
        padding: 12px 14px; border-radius: 17px; background: rgba(255,255,255,.88);
        box-shadow: 0 18px 35px rgba(38,70,60,.13); backdrop-filter: blur(12px);
        animation: cardFloat 4s ease-in-out infinite;
      }
      .float-card div { display: grid; gap: 1px; }
      .float-card strong { font-family: var(--font-head); font-size: 14px; }
      .float-card small { color: #71877F; font-size: 9px; font-weight: 800; }
      .float-icon, .avatar-mini { width: 35px; height: 35px; border-radius: 12px; display: grid; place-items: center; background: #DDF3E6; color: #339667; font-weight: 900; }
      .card-progress { right: -5px; top: 100px; transform: translateZ(80px) rotate(2deg); }
      .card-profile { left: -10px; bottom: 95px; transform: translateZ(100px) rotate(-3deg); animation-delay: -1.2s; }
      .avatar-mini { background: #FFF0CF; font-size: 20px; }
      .float-word {
        position: absolute; z-index: 3; padding: 8px 13px; border-radius: 12px;
        background: #fff; box-shadow: 0 12px 25px rgba(38,70,60,.11);
        font-family: var(--font-head); font-weight: 800; color: #376A59;
        animation: wordFloat 4.5s ease-in-out infinite;
      }
      .word-a { left: 20px; top: 110px; transform: rotate(-9deg) translateZ(40px); }
      .word-b { right: 15px; bottom: 100px; transform: rotate(8deg) translateZ(70px); animation-delay: -1s; }
      .word-c { left: 85px; top: 25px; transform: rotate(5deg); animation-delay: -2.2s; }
      .shape { position: absolute; z-index: 1; }
      .cube {
        right: 45px; top: 25px; width: 62px; height: 62px; border-radius: 16px;
        background: linear-gradient(145deg,#FFCF73,#E89B45); transform: rotate(18deg) translateZ(-20px);
        box-shadow: 12px 18px 28px rgba(180,120,45,.2); display: grid; place-items: center; color: white; font-size: 24px;
      }
      .sphere {
        left: 30px; bottom: 45px; width: 72px; height: 72px; border-radius: 50%;
        background: radial-gradient(circle at 30% 25%,#A8E5D0,#379F78 70%); box-shadow: 12px 20px 30px rgba(40,120,90,.2);
      }
      .orbit { position: absolute; border: 1px dashed rgba(56,148,111,.24); border-radius: 50%; transform: rotateX(68deg); }
      .orbit-one { inset: 70px -30px; }
      .orbit-two { inset: 150px 50px; transform: rotateX(72deg) rotateZ(35deg); }
      .landing-proof {
        position: relative; z-index: 3; max-width: 1124px; margin: 0 auto 50px;
        display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; padding: 0 28px;
      }
      .landing-proof article {
        padding: 18px; border-top: 1px solid rgba(23,52,44,.14); display: grid; gap: 5px;
      }
      .landing-proof article > span { color: #50A979; font-size: 11px; font-weight: 900; }
      .landing-proof strong { font-family: var(--font-head); font-size: 16px; }
      .landing-proof p { margin: 0; color: #71837D; font-size: 13px; line-height: 1.5; }
      @keyframes phoneFloat {
        0%,100% { transform: translate(-50%,-50%) rotateY(-15deg) rotateX(7deg) rotateZ(2deg) translateY(0); }
        50% { transform: translate(-50%,-50%) rotateY(-12deg) rotateX(6deg) rotateZ(1deg) translateY(-12px); }
      }
      @keyframes cardFloat { 0%,100% { margin-top: 0; } 50% { margin-top: -10px; } }
      @keyframes wordFloat { 0%,100% { margin-top: 0; } 50% { margin-top: -8px; } }

      @media (max-width: 800px) {
        .landing-nav { padding: 18px; }
        .landing-main { grid-template-columns: 1fr; padding: 30px 18px 15px; gap: 5px; text-align: center; }
        .landing-copy { justify-items: center; }
        .landing-copy h1 { font-size: clamp(44px,12vw,64px); }
        .landing-copy > p { font-size: 16px; }
        .landing-actions { justify-content: center; }
        .scene-wrap { min-height: 520px; }
        .scene { width: 390px; max-width: 100%; height: 510px; transform: scale(.88); }
        .phone-3d { width: 230px; height: 445px; }
        .phone-orb { width: 145px; height: 145px; }
        .phone-orb span { font-size: 78px; }
        .card-progress { right: 0; }
        .card-profile { left: 0; }
        .word-a { left: 0; }
        .word-b { right: 0; }
        .landing-proof { grid-template-columns: 1fr; padding: 0 18px; }
      }
      @media (max-width: 390px) {
        .landing-login { padding: 9px 13px; font-size: 12px; }
        .landing-main { padding-top: 18px; }
        .landing-copy h1 { font-size: 41px; }
        .scene { transform: scale(.78); margin-top: -35px; margin-bottom: -35px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .phone-3d,.float-card,.float-word { animation: none !important; }
      }
    `}</style>
  );
}
