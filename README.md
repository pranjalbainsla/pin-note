# pin-note

`this is essentially a zenpen (for writing) + pinterest (for saving content you like from yt, X, medium etc) combo`

A full-stack notes app with AI-powered **Pins** — save YouTube videos as summarized cards and drop them into your notes while you write.

`note to self: chill out, you can add personality to the README later`

## Overview

pin-note combines a rich text note editor with a pin system for capturing content (content you find inspiring). Users authenticate with email/password, create and edit notes with auto-save, and can drag YouTube links into the app to generate AI summaries. Those summaries become **pins** that can be inserted into the editor as floating, draggable cards.

The project is a monorepo with two packages:


| Package   | Role                          |
| --------- | ----------------------------- |
| `client/` | React SPA (Vite + TypeScript) |
| `server/` | Flask REST API (Python)       |


Data and authentication are backed by **Supabase**. Video summarization uses **Google Gemini** and the **YouTube Transcript API**.

## Tech stack

**Frontend**

- React 19, TypeScript, Vite
- React Router, TanStack Query
- Tailwind CSS 4
- contentEditable editor with markdown shortcuts (`**bold`**, `*italic*`, ``code``)
- react-rnd for draggable pin cards

**Backend**

- Flask 3 with flask-cors
- Layered architecture: routes → services → repositories
- Supabase (auth + Postgres via PostgREST)
- Google Gemini (`gemini-2.5-flash`) for transcript summarization
- YouTube Data API v3 for video thumbnails and channel metadata
- youtube-transcript-api for fetching video captions

## Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- A Supabase project (linked via the CLI — see [Database migrations](#database-migrations))
- A Google Gemini API key
- A YouTube Data API v3 key (for pin thumbnails and channel names)

### Server

```bash
cd server
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `server/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-service-role-key
GEMINI_API_KEY=your-gemini-api-key
YOUTUBE_API_KEY=your-youtube-data-api-v3-key
CLIENT_URL=http://localhost:5173
```

Use the **service role** key on the server so PostgREST can read and write `profiles`, `notes`, and `pins` without RLS policies.

### Database migrations

Schema is version-controlled under [`supabase/migrations/`](supabase/migrations/). The Flask app does not run migrations; you apply them to your linked Supabase project with the CLI.

**One-time setup** (requires Supabase dashboard access and your database password):

```bash
# From repo root — installs CLI via npx if needed
./scripts/supabase-link.sh <project-ref>
```

`<project-ref>` is in the dashboard URL (`https://supabase.com/dashboard/project/<project-ref>`) or the subdomain of `SUPABASE_URL` in `server/.env`.

If your remote database **already has** the app tables (created manually), baseline migration history first — do **not** run `db pull` before this:

```bash
./scripts/supabase-baseline-remote.sh
npx supabase migration list
```

That removes any empty stub migrations from a failed `db pull`, then marks the checked-in migrations as already applied on remote. After baselining, both migrations should appear in the **Remote** column of `migration list`.

> **Note:** `npx supabase db pull` requires **Docker Desktop** (it spins up a shadow database to diff schemas). This project uses a **remote-only** workflow — you do not need `db pull`. Use `migration new` + `db push` for future schema changes instead.

If you do want to pull remote schema into a migration file, start Docker Desktop first, then run `npx supabase db pull`.

**Future schema changes:**

```bash
npx supabase migration new describe_your_change
# edit supabase/migrations/<timestamp>_describe_your_change.sql
npx supabase db push
npx supabase migration list
```

See [docs/architecture.md](docs/architecture.md) for table/column reference.

### Client

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Running locally

Start the API and the frontend in separate terminals:

```bash
# Terminal 1 — API (default http://localhost:5000)
cd server
source venv/bin/activate
python app.py

# Terminal 2 — frontend (default http://localhost:5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), register or log in, then use the home screen to create notes or add pins.

## Architecture (high level)

```
Browser (React SPA)
    │
    │  fetch + Bearer token
    ▼
Flask API  (/api/auth, /api/notes, /api/pins)
    │
    ├── auth middleware  →  Supabase Auth (token validation)
    │
    ├── services         →  business logic, authorization checks
    │
    └── repositories     →  Supabase PostgREST (profiles, notes, pins)

Pin creation additionally calls:
    YouTube Transcript API  →  Gemini  →  pins table
```

Protected routes require an `Authorization: Bearer <token>` header. Tokens are issued at login/register and stored in `localStorage` on the client.

For deeper detail, see:

- [docs/architecture.md](docs/architecture.md) — modules, data flow, patterns
- [docs/folder-structure.md](docs/folder-structure.md) — directory guide
- [docs/api.md](docs/api.md) — endpoint reference
- [docs/decisions.md](docs/decisions.md) — inferred architectural choices

## Key features

### Authentication

Email/password signup and login via Supabase Auth. JWT access tokens are returned to the client and validated on every protected request.

### Notes

- Create blank notes from the home screen
- Rich text editor with auto-save (1 s debounce)
- Inline markdown shortcuts for bold, italic, and code
- Notes list filtered to non-empty titles, ordered by `updated_at`

### Pins

- Drag a YouTube URL onto the Add Pin drop zone
- Server fetches the transcript, summarizes it with Gemini, and stores title + summary
- Masonry-style pin gallery on the home screen

### Editor pin insertion

- Type `/` in the editor to open a pin picker
- Selected pins appear as draggable, resizable floating cards overlaid on the note
- Pin positions are session-only (not persisted to the server)

## Project rules

See [rules.md](rules.md) for coding conventions (error handling, repository pattern, API response shape).