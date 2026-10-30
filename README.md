# YourTube 🐾

A YouTube-style video site for cat videos, built to explore AI-powered features end to end:

- **Create** a video from a one-line idea. An AI makes a thumbnail, you approve it, then it animates the thumbnail into a 15-second clip and publishes it.
- **Search** by what the thumbnails *look like* (semantic image search with CLIP and pgvector), not by keywords.
- **Related videos** that look like the one you are watching.
- **Personalised recommendations** learned from what you open and how long you watch, with a debug page that shows exactly what the system has learned about you.

> **Architecture:** how it all fits together, and why, is explained in **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Routes and API](#routes-and-api)
- [Database](#database)
- [Deploying to Vercel](#deploying-to-vercel)
- [Troubleshooting](#troubleshooting)
- [Notes for contributors](#notes-for-contributors)

---

## Features

| Feature | What it does | Where |
|---|---|---|
| Home, watch and channel pages | Server-rendered pages backed by Postgres | `src/app/page.tsx`, `watch/[id]`, `channel/[id]` |
| Accounts | Email and password sign-up and sign-in (Better Auth), admin flag | `src/lib/auth.ts`, `login`, `signup` |
| Admin panel | Create, edit and delete users, channels, videos and comments | `src/app/admin` |
| AI video creation | Idea → polished prompt → thumbnail → confirm → video → publish | `src/app/create`, `src/app/api/generations`, `src/lib/generate` |
| Semantic search | The query is embedded with CLIP and matched to thumbnail embeddings | `src/app/search`, `src/lib/queries.ts` |
| Related videos | Nearest thumbnails to the current video | `getRelatedVideos` in `src/lib/queries.ts` |
| Preference learning | Views and watch time raise scores on 76 taste dimensions; scores fade over time | `src/lib/preferences.ts`, `src/app/api/signals` |
| Personalised "Recommended for You" | Videos matching your top 3 interests | `getRecommendedVideos` in `src/lib/queries.ts` |
| Debug page | Shows every score, the recent signals, and lets you reset your profile | `/debug` |

## Tech stack

| Area | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router, server components), React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL on [Supabase](https://supabase.com) with the **pgvector** extension |
| ORM and migrations | [Drizzle ORM](https://orm.drizzle.team) with drizzle-kit, `postgres` (postgres-js) driver |
| Auth | [Better Auth](https://www.better-auth.com) (email and password, Drizzle adapter) |
| Embeddings | CLIP ViT-B/32 (`Xenova/clip-vit-base-patch32`) via [transformers.js](https://huggingface.co/docs/transformers.js), run locally |
| Media storage | Cloudflare Images (thumbnails) and Cloudflare Stream (video) |
| Generative AI | [fal.ai](https://fal.ai) for images and video, [OpenRouter](https://openrouter.ai) for prompt polishing |
| Hosting | Vercel |

## Getting started

### Prerequisites

- **Node.js 20 or later** (the scripts use `process.loadEnvFile`, which needs Node 20.12+; Node 24 is used in development)
- A **Supabase** project (or any Postgres with the `vector` extension available)
- Optional, for AI video creation: accounts and keys for Cloudflare, fal.ai and OpenRouter
- On Windows, the local CLIP model needs the **Microsoft Visual C++ Redistributable** (`winget install Microsoft.VCRedist.2015+.x64`)

### 1. Install

```bash
git clone git@github.com:prashantmalladi/yourtube.git
cd yourtube
npm install
```

### 2. Configure

Create a `.env` file in the project root. See [Environment variables](#environment-variables) for every setting.

Use Supabase's **transaction pooler** connection string for `DATABASE_URL`. The app already disables prepared statements, which the pooler requires.

### 3. Set up the database

```bash
npx drizzle-kit migrate          # creates tables, enables pgvector, builds indexes
npx tsx scripts/create-admin.ts  # admin account from ADMIN_EMAIL / ADMIN_PASSWORD
```

The database starts empty. Sign in as the admin and use **Create** (or the admin panel) to add channels and videos.

### 4. Build the AI data

```bash
npx tsx scripts/seed-dimensions.ts     # the 76 taste dimensions (downloads the CLIP model on first run)
npx tsx scripts/embed-thumbnails.ts    # CLIP embeddings for every video thumbnail
```

Without these two steps the site still runs, but search, related videos and recommendations have nothing to match against.

Only videos with a `thumbnail_url` can be embedded, so create some videos first (**Create**) before running the embedding script. Videos published through the app are embedded automatically.

### 5. Run

```bash
npm run dev
```

Open <http://localhost:3000>.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | Postgres connection string (Supabase transaction pooler) |
| `BETTER_AUTH_SECRET` | Yes | Secret used to sign sessions |
| `BETTER_AUTH_URL` | Yes | Public base URL of the site, for example `http://localhost:3000` locally and your production URL on Vercel |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | For `create-admin` | The admin account created by `scripts/create-admin.ts` |
| `CLOUDFLARE_ACCOUNT_ID` | For video creation | Cloudflare account |
| `CLOUDFLARE_API_TOKEN` | For video creation | Needs **Images: Edit** and **Stream: Edit** permissions |
| `FAL_KEY` | For video creation | fal.ai API key |
| `OPENROUTER_API_KEY` | For video creation | Used to polish the user's idea into a safe cat prompt |
| `OPENROUTER_MODEL` | For video creation | Model used for prompt polishing |
| `FAL_IMAGE_MODEL` | No | Thumbnail model. Default `openai/gpt-image-2` |
| `FAL_IMAGE_TO_VIDEO_MODEL` | No | Image-to-video model. Default `minimax/h3-max-turbo/image-to-video` |
| `DAILY_GENERATION_LIMIT` | No | Generations per user per day. Default `5` (hard cap of 4× that, including retries) |

`VERCEL_URL`, `VERCEL_BRANCH_URL` and `VERCEL_PROJECT_PRODUCTION_URL` are set by Vercel automatically and used to trust the deployment's own origin for login. Do not set them yourself.

`.env` is git-ignored. Never commit it.

## Scripts

### npm

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |

### Database and data (`npx tsx scripts/<name>.ts`)

| Script | What it does | Safe to re-run? |
|---|---|---|
| `create-admin.ts` | Creates the admin user, or promotes an existing account (the password is left alone) | Yes |
| `seed-dimensions.ts` | Upserts the 76 preference dimensions and embeds each with CLIP's text model | Yes |
| `embed-thumbnails.ts` | Embeds thumbnails that have no embedding yet. `--all` redoes every video | Yes |
| `assign-media.ts` | Historical one-off that paired the original sample videos with local media and uploaded it to Cloudflare. Needs the git-ignored `mock_data/` files and the original sample rows, so it will not work on a fresh database | No |

### Migrations

```bash
npx drizzle-kit generate --name <change>   # after editing drizzle/schema.ts
npx drizzle-kit migrate                    # apply to the database in DATABASE_URL
```

Migrations live in `drizzle/migrations`. The pgvector extension itself is created by migration `0008`.

## Project structure

```
drizzle/
  schema.ts              All tables (single source of truth)
  migrations/            Generated SQL migrations
scripts/                 CLI tools: embeddings, admin, media
src/
  app/                   Routes (App Router)
    page.tsx             Home
    watch/[id]/          Video page, related videos, watch tracker
    channel/[id]/        Channel page
    search/              Semantic search results
    create/              AI video creation
    debug/               What the system knows about you
    admin/               Admin panel
    login/, signup/      Auth pages
    api/                 auth, generations, signals
  components/            UI, grouped by area (home, watch, create, layout, auth, admin, debug)
  lib/
    db.ts                Drizzle client
    auth.ts              Better Auth configuration and session helper
    queries.ts           Read queries: videos, search, related, recommended
    clip.ts              CLIP image and text embeddings (lazy-loaded)
    preferences.ts       Preference learning and profile handling
    cloudflare.ts        Cloudflare Images and Stream uploads
    generate/            Video creation pipeline: polish, fal, store, publish
docs/ARCHITECTURE.md     Concepts and design decisions
mock_data/               Seed manifest (media files are git-ignored)
```

## Routes and API

### Pages

| Route | Description |
|---|---|
| `/` | Home: For You, Shorts, and Recommended (personalised once you have history) |
| `/watch/[id]` | Player, comments, related videos |
| `/channel/[id]` | Channel page |
| `/search?q=…` | Semantic search over thumbnails |
| `/create` | Create a video (sign-in required) |
| `/debug` | Your learned interests and recent signals |
| `/login`, `/signup` | Authentication |
| `/admin` | Admin panel (admins only) |

### API

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/*` | various | Better Auth handler |
| `/api/generations` | `GET` | Your daily usage and remaining allowance |
| `/api/generations` | `POST` | Start a generation: `{ prompt }` for a new idea, or `{ fromId }` for a new thumbnail of an earlier one |
| `/api/generations/[id]` | `GET` | Poll a generation; advances its status when the fal job finishes |
| `/api/generations/[id]/confirm` | `POST` | Approve the thumbnail and queue the video |
| `/api/generations/[id]/publish` | `POST` | Copy the video to Stream and create the video row (up to 180 seconds) |
| `/api/signals` | `POST` | Record `{ videoId, kind: "view" \| "watch" }` for preference learning |
| `/api/signals` | `DELETE` | Forget everything learned about the caller |

### Generation lifecycle

```
starting → thumbnailing → thumbnail_ready → generating → ready → publishing → published
                                  ↘ failed / rejected (from any step)
```

## Database

Tables are defined in [`drizzle/schema.ts`](drizzle/schema.ts).

| Table | Purpose |
|---|---|
| `users`, `sessions`, `accounts`, `verifications` | Better Auth. `users` also holds display-only users such as comment authors |
| `channels`, `videos`, `comments` | Site content. `videos.thumbnail_embedding` is a 512-dimension pgvector column with an HNSW index (cosine distance) |
| `generations` | One AI video attempt per row, tracking status, fal request ids and the thumbnail and video URLs |
| `preference_dimensions` | The 76 taste dimensions, each with a CLIP text embedding |
| `user_preferences` | A score per profile and dimension |
| `preference_events` | The raw view and watch signals shown on the debug page |

## Deploying to Vercel

1. Import the repository in Vercel.
2. Add the [environment variables](#environment-variables). Set `BETTER_AUTH_URL` to the production URL, not `localhost`.
3. Deploy. Run migrations against the production database from your machine with `npx drizzle-kit migrate`.

**Things to know about CLIP on Vercel:**

- CLIP is only loaded by `/search` and the publish endpoint. Other pages never touch it.
- `next.config.ts` bundles the Linux build of `onnxruntime-node` into those two functions.
- The model is downloaded from Hugging Face into `/tmp` on a cold start, so the first search after idle can be slow. See [the architecture document](docs/ARCHITECTURE.md#embeddings-in-production) for alternatives.

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `Invalid origin` (`INVALID_ORIGIN`) on login | The request's origin is not trusted. Set `BETTER_AUTH_URL` correctly. On Vercel the deployment's own URL is trusted automatically |
| `tenant/user not found` | The Supabase project is paused. Restore it in the Supabase dashboard |
| `Cannot find module 'onnxruntime-node'` | The native CLIP runtime was not bundled. Check `outputFileTracingIncludes` in `next.config.ts` |
| CLIP fails to load on Windows (`onnxruntime_binding.node` not found) | Install the Microsoft Visual C++ Redistributable |
| Search or related videos return nothing useful | Run `seed-dimensions.ts` and `embed-thumbnails.ts` |
| A published video has no embedding | The embedding step failed softly. Run `embed-thumbnails.ts` to backfill |
| Watch page shows "video not found" right after publishing | Stream is still processing. Publishing waits for it, but a slow upload can outlast the wait |

## Notes for contributors

- **This is a recent Next.js with breaking changes.** Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code (see `AGENTS.md`).
- Database changes go through `drizzle/schema.ts` and a generated migration, never by hand in the dashboard.
- Keep scratch scripts out of the repository.
