# LingoPousse

Parcours de langues adaptatifs pour les enfants de **3 à 12 ans**.

Image → écoute → rappel actif. Chaque enfant garde son propre rythme, ses mots,
ses difficultés et son historique.

**Anglais · Espagnol · Mandarin · Japonais** — les mêmes 30 objets, en rotation.

## Trois parcours

| Âge | Parcours | Séance | Nouveautés |
|---|---|---:|---:|
| 3–6 ans | Éveil oral | 11 min / 20 tours | 2 max. |
| 7–9 ans | Lecture accompagnée | 13 min / 24 tours | 3 max. |
| 10–12 ans | Autonomie | 15 min / 28 tours | 4 max. |

## La boucle du jour

1. D’abord les ratés d’hier
2. Puis les mots pas entendus depuis 4 jours
3. Puis les nouveautés, plafonnées selon l’âge
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
