# Pistache

Boucle vocale pour **3–6 ans**. Pas de texte sur l’écran enfant, pas de menus, pas de scores.

Touche une grande image → entend le mot (voix des parents ou de l’iPad) → le redit → l’app suit tranquillement ce qui accroche.

**Anglais · Espagnol · Mandarin · Japonais** — les mêmes 30 objets, en rotation.

## La boucle du jour (~11 minutes)

1. D’abord les ratés d’hier
2. Puis les mots pas entendus depuis 4 jours
3. Au plus **2 mots neufs** par jour
4. Raté 3 jours de suite → on le retire, objet plus facile dans la même langue
5. Raté en séance → revient ~3 tours plus tard (jamais de bip)
6. Les parents reçoivent **4 mots pour le dîner**, avec le moment exact

## Lancer en local

```bash
npm install --ignore-scripts
npm run dev
```

Ouvrir l’URL affichée. Sur iPad : Safari → Partager → **Sur l’écran d’accueil**.

## En ligne

**https://fredericnjoh-lab.github.io/pistache/**

## Stack

- React 19 + Vite 6
- Web Speech API (synthèse + reconnaissance)
- Enregistrements parents en localStorage
- Service worker hors-ligne
