# Folder structure

This document explains the purpose of each major directory. It focuses on intent rather than listing every file.

```
better/
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
| `editor/` | Editor building blocks: toolbar, content area, pin popup, floating pin cards |
| `errors/ErrorFallback.tsx` | react-error-boundary fallback UI |
| `home/FolderPanel.tsx` | Shared modal panel used by home sub-views (notes list, pins gallery, add pin) |
| `pins/PinCard.tsx` | Pin card component (present in codebase; not currently wired into active pages) |
| `ProtectedRoute.tsx` | Redirects unauthenticated users to login |

### `src/pages/`

Organized by feature area. Each folder has an `index.ts` barrel export.

| Folder | Pages |
|--------|-------|
| `authPages/` | `LoginPage`, `RegisterPage` |
| `homePages/` | `HomePage` hub plus `MyNotesPage`, `MyPinsPage`, `AddPinPage` overlays |
| `notesPages/` | `Editor` — the main note-writing experience |

### `src/hooks/`

Custom hooks that own async logic and state for complex views:

- `useNote` — load/save a note, holds the editor DOM ref
- `useAutoSave` — debounced save scheduling
- `usePins` — pin picker popup and floating pin session state

### `src/services/`

Thin wrappers around the REST API:

- `apiFetch.ts` — authenticated fetch with 401 handling
- `notesService.ts` — notes CRUD endpoints
- `pinsService.ts` — pins list and create endpoints

Auth calls (`login`, `register`) live in `AuthContext` instead of a separate service file.

### `src/utils/`

| File | Purpose |
|------|---------|
| `getCleanHTML.ts` | Sanitize editor HTML via DOMPurify before save |
| `applyMarkdownPattern.ts` | Convert `**bold**`, `*italic*`, `` `code` `` shortcuts inline |

### `src/constants/`

| File | Purpose |
|------|---------|
| `editor.ts` | Auto-save delay, markdown regex patterns |
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
| `auth_routes.py` | `/register`, `/login` |
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
3. `client/src/App.tsx` — routes and auth wrapper
4. `client/src/pages/notesPages/Editor.tsx` — core product experience
5. `server/services/pins_service.py` — AI + YouTube integration flow
