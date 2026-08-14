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

## Déploiement (GitHub Pages)

Un workflow prêt à l'emploi est fourni dans [`deploy/github-pages.yml`](deploy/github-pages.yml).

Pour l'activer :

1. Déplacer le fichier vers `.github/workflows/deploy.yml` (nécessite un token avec le scope `workflow`, ou le faire via l'interface GitHub).
2. Dans **Settings → Pages**, sélectionner **GitHub Actions** comme source.
3. GitHub Pages sur un dépôt **privé** requiert un plan **GitHub Pro / Team / Enterprise**. Sur un compte gratuit, il faut rendre le dépôt public.

La config Vite fixe déjà `base: "/pistache/"` en CI pour que les chemins soient corrects sur Pages.

## Stack

- React 19
- Vite 6
- UI inline (Fredoka + Nunito)
