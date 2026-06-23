# Architectural decisions (initial manual review done)

This document records architectural choices **inferred from the current codebase**. Where evidence is indirect, sections are marked as inferences. No commit history or design docs were available to verify intent.

---

## Flask API with layered architecture

**Decision:** Separate the backend into routes, services, repositories, and models.

**Why it appears to have been chosen:** The codebase consistently follows this split — routes are thin, services hold authorization and orchestration, repositories encapsulate all Supabase calls. `rules.md` explicitly requires repository-only database access.

**Tradeoffs:**

- (+) Clear boundaries; services are testable with mock repositories
- (+) Swapping Supabase for another provider would touch only repository implementations
- (−) More files and boilerplate for a small API surface (3 resource groups)
- (−) Repository singletons are created at import time in route modules rather than injected via a DI container

---

## Supabase for auth and database

**Decision:** Use Supabase Auth for signup/login/token validation and Supabase PostgREST for CRUD on `profiles`, `notes`, and `pins`.

**Why it appears to have been chosen:** Every repository imports a shared `supabase` client. Auth middleware validates JWTs through `supabase.auth.get_user`. User signup/login call Supabase Auth methods directly. No local password hashing or SQL driver exists in the project.

**Tradeoffs:**

- (+) Auth, storage, and Postgres in one managed service
- (+) JWT validation delegated to Supabase — no custom session store
- (−) Tight coupling to Supabase SDK and error types (`AuthApiError`, `APIError`)
- (−) Schema changes require the Supabase CLI and a linked project (`supabase/migrations/`)

**Inference:** The `profiles` table is queried for duplicate-email checks separately from Supabase Auth signup. Migration `20260616180100_profiles_on_signup.sql` keeps `profiles` in sync via an `auth.users` insert trigger.

---

## Server-side pin summarization

**Decision:** YouTube transcript fetching and Gemini summarization run on the server, not in the browser.

**Why it appears to have been chosen:** `PinsService.create_pin` orchestrates the full pipeline server-side. The Gemini API key lives in server env (`GEMINI_API_KEY`), never exposed to the client. The client only sends a URL.

**Tradeoffs:**

- (+) API keys stay secret
- (+) Consistent summarization logic regardless of client
- (+) Transcript fetch avoids CORS issues
- (−) Pin creation is slow (transcript + LLM call) and blocks the HTTP request
- (−) No progress/streaming feedback to the client beyond a loading spinner

---

## Gemini for transcript summarization

**Decision:** Use Google Gemini (`gemini-2.5-flash`) with a structured JSON prompt to produce pin title and summary.

**Why it appears to have been chosen:** `gemini_client.py` is the only AI integration. The prompt requests JSON with `title` and `summary` fields; the `author` field is requested but discarded in the return value.

**Tradeoffs:**

- (+) Fast, cost-effective model for summarization
- (+) Structured output reduces parsing ambiguity
- (−) Transcript truncated to 12,000 characters — long videos lose context
- (−) JSON parsing assumes well-formed LLM output; malformed responses will raise unhandled exceptions
- (−) No retry or fallback if Gemini is unavailable

---

## Repository interfaces with Supabase implementations

**Decision:** Define abstract base classes (`IUserRepository`, `INotesRepository`, `IPinsRepository`) alongside concrete Supabase classes.

**Why it appears to have been chosen:** Each repository file follows the same ABC + implementation pattern. Services type-hint against the interface, not the concrete class.

**Tradeoffs:**

- (+) Documents the data-access contract explicitly
- (+) Enables unit testing services with fakes
- (−) Only one implementation exists — the abstraction adds indirection without current benefit
- (−) `IUserRepository` does not include `validate_token`, though `SupabaseUserRepository` implements it (used only indirectly via middleware's direct Supabase call)

---

## Global error handlers over local try/catch

**Decision:** Raise `AppError` subclasses from services/routes; handle them centrally in `app.py`.

**Why it appears to have been chosen:** `rules.md` mandates global error handlers and discourages unnecessary try/catch. `app.py` registers handlers for `AppError` and a catch-all `Exception`.

**Tradeoffs:**

- (+) Consistent error response format for AppErrors
- (+) Cleaner route handlers
- (−) Auth middleware uses inline try/except and returns a different JSON shape (`{ message }` without `status`)
- (−) Some repository TODOs note unmapped database errors that may hit the generic 500 handler

---

## JWT in localStorage with Bearer header

**Decision:** Store the access token and user object in `localStorage`; attach `Authorization: Bearer` on authenticated requests.

**Why it appears to have been chosen:** `AuthContext` writes to `localStorage` on login/register. `apiFetch` reads the token and sets the header. On 401, both are cleared and the user is redirected to login.

**Tradeoffs:**

- (+) Simple, stateless API — no cookies or server sessions
- (+) Works with CORS from a separate Vite dev origin
- (−) localStorage is accessible to XSS — no httpOnly cookie protection
- (−) No refresh-token flow; expired tokens require re-login

---

## Tiptap editor with trimmed StarterKit

**Decision:** Use Tiptap (`@tiptap/react`) with a trimmed StarterKit (bold, italic, code, paragraph, history only) for the note editor. HTML is sanitized with DOMPurify before save. Typing `/` opens an `EditorFormatMenu` (font size, bold, italic) via `@tiptap/suggestion`.

**Why it was chosen:** Replaces a custom `contentEditable` div and hand-rolled markdown shortcut logic with ProseMirror-backed editing, while keeping the same HTML storage format and allowed tag set.

**Tradeoffs:**

- (+) Reliable cursor, undo/redo, and markdown input rules via StarterKit
- (+) HTML stored directly — no conversion layer
- (+) Extension-based architecture for future formatting features
- (−) Larger client bundle than the prior contentEditable approach
- (−) Limited formatting (bold, italic, code only) — same as before

---

## Per-note font size in database (`font_size_px`)

**Decision:** Store document-wide font size as `font_size_px` (integer, 14–28, default 18) on the `notes` table — not inline in HTML.

**Why it was chosen:** Font size applies uniformly to the entire note body (Apple Books–style). A separate column keeps presentation out of content HTML and allows a CSS transition on the editor wrapper without parsing inline styles.

**Tradeoffs:**

- (+) Clean separation of content vs. display preference
- (+) Smooth `transition: font-size` on `.editor-font-wrapper`
- (+) Clamped server-side and client-side
- (−) Requires migration and API changes on create/update

---

## Client-side-only floating pin positions (legacy / unused in editor)

**Decision:** Pin cards (`FloatingPin` via `react-rnd`) were designed to store position/size in React state only — not persisted to the server. The editor no longer inserts pins via `/`; pin management remains on Home and My Pins pages.

**Why it appears to have been chosen:** `usePins` manages `floatingPins` in component state. `saveNote` saves title, HTML content, and `font_size_px` from the Tiptap editor.

**Tradeoffs:**

- (+) Simple implementation — no schema changes needed for pin placement
- (−) Pin-in-editor flow removed in favor of format menu
- (−) `PinsPopup` / `FloatingPin` components remain in codebase but are not wired to the editor

---

## TanStack Query for lists, custom hooks for editor

**Decision:** Use React Query for notes/pins list fetching; use bespoke hooks for the editor's fetch/save cycle.

**Why it appears to have been chosen:** `MyNotesPage` and `MyPinsPage` use `useQuery`. The editor uses `useNote` + `useAutoSave` with manual state because it needs a Tiptap editor instance, debounced saves, and tight coupling to editor update events.

**Tradeoffs:**

- (+) React Query handles caching and loading states for list views
- (+) Editor hooks encapsulate complex, editor-specific logic
- (−) Two data-fetching patterns in one app
- (−) Editor note data is not synced with the React Query cache after saves

---

## CORS locked to local dev origin

**Decision:** Flask CORS allows only `http://localhost:5173` on `/api/`*.

**Why it appears to have been chosen:** Hardcoded in `app.py`. Matches Vite's default dev port. `Config.CLIENT_URL` exists in env but is not used for CORS configuration.

**Tradeoffs:**

- (+) Safe default for local development
- (−) Production deployment requires a code change or env-driven CORS config (not yet implemented)
- (−) `CLIENT_URL` env var is loaded but unused — possible incomplete setup

**Inference:** Production CORS configuration is a TODO.

---

## Notes filtered by non-empty title

**Decision:** `get_notes_by_user_id` excludes notes where `title == ""`.

**Why it appears to have been chosen:** The repository query includes `.neq("title", "")`. New notes are created with an empty title from the home screen, so blank drafts are hidden from the notes list until the user sets a title.

**Tradeoffs:**

- (+) Notes list shows only "named" notes
- (−) Users cannot find in-progress untitled notes from My Notes (only via direct URL if they know the ID)
- (−) Filtering happens in the query, not the UI — behavior may surprise users

---

## Slash command for format menu

**Decision:** Typing `/` in the editor opens `EditorFormatMenu` at the cursor (font size A⁻/A⁺, bold, italic). Dismiss with Escape, backdrop click, or Ctrl+C.

**Why it was chosen:** `slashFormatMenu` Tiptap extension uses `@tiptap/suggestion` to detect `/` and position the menu. Bold/italic state is mirrored in the sidebar above Home via `EditorFormatContext`.

**Tradeoffs:**

- (+) Familiar slash-command pattern without a permanent toolbar
- (+) Font size changes apply document-wide via `font_size_px` column
- (−) Triggers on `/` at a word boundary (same as prior pin picker behavior)
- (−) Ctrl+C dismisses menu while open (reserves shortcut space for future formatting keys)

---

## App-wide SlateSurface shell with manual theme toggle

**Decision:** Wrap all routes in `AppShell` — a fixed 90vw × 90vh slate centered on a themed background — with a shared `SlateSurface` primitive for both the page shell and modal overlays (`FolderPanel`).

**Why it's chosen:** For a minimal, calm UI where all functionality lives inside a single floating workspace (cream slate on pink in light mode; black slate on off-white in dark mode). A unified shell avoids per-page background/layout duplication and leaves room for future docked/minimized slate behavior. (correction: macos-style docked/minimised behaviour for pins)

**Tradeoffs:**

- (+) Consistent look across auth, home, and editor
- (+) `SlateSurface` (`page` | `modal`) centralizes surface styling and theme tokens
- (+) Theme toggle in a fixed right rail is always reachable
- (−) Pages must fit within the slate bounds — editor popups and floating pins need container-relative positioning
- (−) Manual theme (`ThemeContext` + `data-theme`) is separate from OS `prefers-color-scheme` vars still present in `index.css`
- (−) Home/editor hardcoded hex colors are only partially migrated to slate CSS variables

