# Pistache

Rituels d'éducation financière pour enfants de 3 à 12 ans — 5 minutes par semaine, sans écran pour eux.

## Mondes

| Âge | Totem | Monde |
|-----|-------|-------|
| 3–5 | 🐿️ | L'attente — échange & patience avec de vraies pièces |
| 6–8 | 🦊 | Les trois bocaux — dépenser, épargner, donner |
| 9–12 | 🦉 | Les choix — simulateur « Et si ? » & projets |

## Lancer en local

```bash
npm install
npm run dev
```

Puis ouvrir l'URL affichée (souvent `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Déploiement

Le site est en ligne : **https://fredericnjoh-lab.github.io/pistache/**

Le déploiement est automatique : à chaque push sur `cursor/pistache-v2-abf3`, le workflow
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) build le projet et publie
`dist/` sur la branche `gh-pages`, servie par GitHub Pages.

La config Vite fixe `base: "/pistache/"` en CI pour que les chemins soient corrects sur Pages.

## Stack

- React 19
- Vite 6
- UI inline (Fredoka + Nunito)
