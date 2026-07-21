# Annvireak Devin — The Quiet Perimeter

Personal brand site. Dark-first, editorial, security-native.

## Run (Docker)

```bash
cp .env.example .env                       # then edit: secrets, admin login, Cloudinary keys
docker compose up                          # dev + Postgres → http://localhost:3000
docker compose exec web npm run db:seed    # once: creates your admin user + starter projects
docker compose --profile prod up web-prod  # production (standalone image)
```

## CMS

- Admin panel: `/admin` (email/password from `ADMIN_EMAIL` / `ADMIN_PASSWORD`, created by seed; public sign-up is disabled)
- Projects: create / edit / delete, draft ↔ published, drag-to-reorder (order = public grid order), grid sizes SMALL · MEDIUM · WIDE · TALL · HERO, categories Tool · Project · Research · Blog · Experiment
- Media: `/admin/media` — drag-and-drop uploads (images, video, PDF) to Cloudinary; pick thumbnails & gallery in the project editor
- Public gallery reads published projects (ISR, 60s) and falls back to `src/content/site.ts` if the DB is empty/unreachable
- Keyboard: `N` new project · `⌘S` save · `Esc` back

## Run (local Node)

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Framer Motion · self-hosted fonts (@fontsource)

## Structure

```
src/
  app/            layout, page, globals.css (design tokens live here)
  components/ui/  shared primitives (MagneticButton, ...)
  content/        site.ts — single source of truth for all copy & links
  features/       one folder per section (hero/, story/, projects/, ...)
  lib/            motion.ts (animation vocabulary), utils.ts
```

## To do before launch

- Drop your resume at `public/resume.pdf` (the hero CTA points there)
- Replace `#` placeholders in `src/content/site.ts` with real GitHub / LinkedIn URLs
- Sections 02–09 are built phase by phase (see comments in `src/app/page.tsx`)
