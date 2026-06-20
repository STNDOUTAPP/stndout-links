# STNDOUT — Pages de partage (stndout-links)

Pages web qui ouvrent quand quelqu'un scanne un QR code STNDOUT ou clique un lien de partage :

- `/athlete/{id}` — profil public d'un athlète (avec preview de lien / OG tags)
- `/post/{id}` — un highlight (vidéo ou photos)
- `/` — page d'accueil générique

L'app génère déjà ces liens : `https://stndout-links.vercel.app/athlete/{id}`.

## Stack
Next.js 14 (App Router). Lit Supabase en lecture seule via la **clé publishable** (publique). Aucune clé secrète ici. Les profils privés et les comptes en suppression ne sont **jamais** affichés.

## Lancer en local
```bash
cd web
npm install
npm run dev      # http://localhost:3000
```

## Déployer sur Vercel
Le projet Vercel existant s'appelle **stndout-links** (domaine `stndout-links.vercel.app`).

```bash
cd web
npx vercel        # 1re fois : lier au projet "stndout-links", Root Directory = web
npx vercel --prod # déploiement en production
```
Ou via le dashboard Vercel → New Project → importer ce repo → **Root Directory = `web`**.

## À remplir au launch
Dans `lib/config.ts`, mettre les vrais liens des stores :
```ts
export const APP_STORE_URL = 'https://apps.apple.com/app/...';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=...';
```
Tant qu'ils sont vides, le bouton « GET STNDOUT » pointe vers la page d'accueil.
