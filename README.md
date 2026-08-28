# Pistache

Voice-first language loop for ages **3–6**. No text on the child screen, no menus, no scores.

She taps one big picture → hears the word (Mum/Dad recording or device voice) → says it back → the app quietly tracks what stuck.

**English · Spanish · Mandarin · Japanese** — the same 30 everyday objects, on rotation.

## The daily loop (~11 minutes)

1. **Yesterday’s misses first**
2. **Words not heard in four days**
3. **At most two new words per day**
4. Miss three days in a row → drop it, swap for an easier object in that language
5. Miss in-session → reappear ~three turns later (no buzzers)
6. Parents get **four dinner words** with exactly when to say them

## Lancer en local

```bash
npm install --ignore-scripts
npm run dev
```

Ouvrir l’URL affichée (souvent `http://localhost:5173`). Sur iPad : Safari → Partager → Sur l’écran d’accueil pour un mode plein écran.

## Build

```bash
npm run build
npm run preview
```

## Déploiement

Le site est en ligne : **https://fredericnjoh-lab.github.io/pistache/**

Déploiement automatique via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) sur push vers `cursor/pistache-v2-abf3`.

## Stack

- React 19 + Vite 6
- Web Speech API (TTS + recognition when available)
- localStorage progress + offline service worker
- Parent voice clips stored on-device
