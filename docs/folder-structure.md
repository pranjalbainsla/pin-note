# Folder structure

This document explains the purpose of each major directory. It focuses on intent rather than listing every file.

```
pin-note/
├── client/          React frontend
├── server/          Flask API
├── docs/            Project documentation
└── rules.md         Coding conventions for contributors
```

## Root

| Path | Purpose |
|------|---------|
| `README.md` | Project overview, setup, and quick start |
| `rules.md` | Error handling, repository, and API response conventions |
| `docs/` | Architecture, API, folder guide, and decision log |

## `client/` — React frontend

Vite + TypeScript SPA. Path alias `@/` maps to `client/src/`.

```
client/
├── public/              Static assets (icons, favicon)
├── src/
│   ├── components/      Reusable UI pieces
│   ├── constants/       Shared config values (editor, themes)
│   ├── context/         React context providers
│   ├── hooks/           Stateful logic extracted from pages
│   ├── pages/           Route-level views
│   ├── services/        HTTP calls to the Flask API
│   ├── types/           Shared TypeScript types
│   ├── utils/           Pure helper functions
│   ├── App.tsx          Router and provider setup
│   ├── main.tsx         React entry point + QueryClient
│   └── config.ts        Env-based API base URL
├── index.html
├── vite.config.ts
└── package.json
```

### `src/components/`

| Subfolder / file | Purpose |
|------------------|---------|
| `layout/` | App-wide UI shell: `AppShell`, `SlateSurface`, `ThemeToggle` |
| `editor/` | Editor building blocks: toolbar, `NoteEditor`, `EditorFormatMenu` (Escape dismisses), pin popup, floating pin cards |
| `errors/ErrorFallback.tsx` | react-error-boundary fallback UI |
| `home/FolderPanel.tsx` | Modal overlay (`SlateSurface` variant `modal`) for home sub-views (notes list, pins gallery, add pin) |
| `pins/PinCard.tsx` | Pin card component (present in codebase; not currently wired into active pages) |
| `ProtectedRoute.tsx` | Redirects unauthenticated users to login; waits during session bootstrap |

### `src/context/`

| File | Purpose |
|------|---------|
| `AuthContext.tsx` | User session, login/register/logout, bootstrap refresh on load, `localStorage` persistence |
| `ThemeContext.tsx` | Manual light/dark theme, `localStorage` persistence, `data-theme` on `<html>` |

### `src/pages/`

Organized by feature area. Each folder has an `index.ts` barrel export.

| Folder | Pages |
|--------|-------|
| `authPages/` | `LoginPage`, `RegisterPage` |
| `homePages/` | `HomePage` hub plus `MyNotesPage`, `MyPinsPage`, `AddPinPage` overlays |
| `notesPages/` | `Editor` — Tiptap wiring, auto-save, format menu; Ctrl+C exits active bold/italic |

### `src/hooks/`

Custom hooks that own async logic and state for complex views:

- `useNote` — load/save a note (content + `font_size_px`), syncs with Tiptap
- `useAutoSave` — debounced save scheduling
- `useEditorFormatMenu` — slash format menu open/close state

### `src/services/`

Thin wrappers around the REST API:

- `apiFetch.ts` — authenticated fetch with refresh-on-401 and retry
- `authStorage.ts` — access/refresh token storage, deduped refresh, cross-tab sync events
- `notesService.ts` — notes CRUD endpoints
- `pinsService.ts` — pins list and create endpoints

Auth calls (`login`, `register`, `logout`) live in `AuthContext`. Token refresh lives in `authStorage` (called by `apiFetch` and `AuthContext` bootstrap).

### `src/utils/`

| File | Purpose |
|------|---------|
| `getCleanHTML.ts` | Sanitize Tiptap HTML output via DOMPurify before save |

### `src/extensions/`

| File | Purpose |
|------|---------|
| `slashFormatMenu.ts` | Tiptap Suggestion extension — `/` opens the format menu |

### `src/context/`

| File | Purpose |
|------|---------|
| `EditorFormatContext.tsx` | Bold/italic active state for sidebar indicators |

### `src/lib/`

| File | Purpose |
|------|---------|
| `editorExtensions.ts` | Trimmed StarterKit + Placeholder + pin slash command |

### `src/constants/`

| File | Purpose |
|------|---------|
| `editor.ts` | Auto-save delay, font size constants (min/max/step/default) |
| `theme.ts` | Color themes for floating pin cards |

## `server/` — Flask API

Python backend following a layered structure.

```
server/
├── app.py               Flask app, CORS, blueprints, error handlers
├── config.py            Environment variable loading
├── exceptions.py        AppError hierarchy
├── middleware/
│   └── auth.py          JWT validation middleware
├── routes/              HTTP blueprints (thin controllers)
├── services/            Business logic
├── repositories/        Database access (Supabase)
├── models/              Domain objects with to_dict()
├── utils/               External client wrappers
└── requirements.txt
```

### `routes/`

One blueprint per resource. Each file wires a repository + service singleton and defines route handlers.

| File | Endpoints |
|------|-----------|
| `auth_routes.py` | `/register`, `/login`, `/refresh`, `/logout` |
| `notes_routes.py` | `/getAll`, `/get/<id>`, `/create`, `/update/<id>` |
| `pins_routes.py` | `/getAll`, `/create` |

### `services/`

Business rules and orchestration. The pins service is the most complex — it coordinates YouTube transcript fetching and Gemini summarization before persisting.

### `repositories/`

Abstract base classes define the contract; `Supabase*` classes implement it using the shared Supabase client. This is the only layer that talks to the database.

### `models/`

Lightweight data classes (`User`, `Note`, `Pin`) used between repositories and route responses.

### `utils/`

| File | Purpose |
|------|---------|
| `supabase_client.py` | Shared Supabase client instance |
| `gemini_client.py` | Gemini prompt and JSON parsing for summaries |
| `youtube_transcript.py` | Video ID extraction and transcript retrieval |

## `docs/`

| File | Contents |
|------|----------|
| `architecture.md` | System design, data flow, patterns |
| `folder-structure.md` | This file |
| `api.md` | REST endpoint reference |
| `decisions.md` | Inferred architectural decisions |

## Important files to read first

When onboarding, start with these files in order:

1. `server/app.py` — entry point, middleware, error handlers
2. `server/middleware/auth.py` — how requests are authenticated
3. `client/src/App.tsx` — routes, providers, and `AppShell` layout wrapper
4. `client/src/components/layout/AppShell.tsx` — app-wide slate shell and theme rail
5. `client/src/pages/notesPages/Editor.tsx` — core product experience
6. `server/services/pins_service.py` — AI + YouTube integration flow
