# API reference

Base URL (local dev): `http://localhost:5000/api`

The client reads this from `VITE_API_BASE_URL`.

## Authentication

Most endpoints require a valid Supabase JWT:

```
Authorization: Bearer <access_token>
```

Login and register return an access token and a refresh token. The auth middleware validates access tokens via `supabase.auth.get_user(token)` and attaches the user to `g.user`.

The client stores both tokens in `localStorage`. When an access token expires, `apiFetch` exchanges the refresh token via `POST /auth/refresh` and retries the request. Logout only happens when the user clicks logout or refresh fails.

### Public routes (no token required)

| Method | Path |
|--------|------|
| POST | `/api/auth/login` |
| POST | `/api/auth/register` |
| POST | `/api/auth/refresh` |
| POST | `/api/auth/logout` |

Preflight `OPTIONS` requests are also allowed through without a token.

### Auth failure responses

When the middleware rejects a request, it returns JSON **without** a `status` field:

```json
{ "message": "Missing token" }
```

```json
{ "message": "Invalid or expired token" }
```

HTTP status: `401`

On the client, `apiFetch` attempts a token refresh on `401`. If refresh succeeds, the original request is retried. If refresh fails (or no refresh token is stored), `apiFetch` clears `localStorage` and redirects to `/`.

---

## Response conventions

### Target shape (from `rules.md`)

```json
{
  "status": "...",
  "message": "...",
  "data": "..."
}
```

### Actual shapes in use

The codebase does not fully follow the `rules.md` envelope yet:

| Endpoint group | Success shape | Error shape |
|----------------|---------------|-------------|
| Auth | `{ user, token, refresh_token }` or `{ token, refresh_token }` | `{ status: "error", message }` via AppError |
| Notes / Pins | `{ status: "ok", <resource>: ... }` | `{ status: "error", message }` via AppError |
| Auth middleware | — | `{ message }` only |

---

## Auth endpoints

### POST `/api/auth/register`

Create a new user account.

**Request body**

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Validation (server)**
- Email and password are required (`ValidationError`, 400)
- Password must be at least 6 characters (`ValidationError`, 400)
- Email must not already exist in `profiles` (`ConflictError`, 409)
- Supabase may also reject weak passwords (`ValidationError`, 400)

**Success — 201**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "eyJ...",
  "refresh_token": "..."
}
```

> **Note:** Supabase may require email confirmation depending on project settings. If `response.session` is null after signup, `token` and `refresh_token` may be `null`.

**Errors**

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing fields, weak password | `{ "status": "error", "message": "..." }` |
| 409 | Duplicate email | `{ "status": "error", "message": "User with this email already exists" }` |
| 500 | Unexpected error | `{ "status": "error", "message": "Something went wrong" }` |

---

### POST `/api/auth/login`

Authenticate an existing user.

**Request body**

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

**Validation (server)**
- Email and password required (`ValidationError`, 400)
- Email format checked with regex (`ValidationError`, 400)
- Invalid credentials (`InvalidCredentialsError`, 401)

**Success — 200**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "eyJ...",
  "refresh_token": "..."
}
```

**Errors**

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing/invalid email format | `{ "status": "error", "message": "..." }` |
| 401 | Wrong credentials | `{ "status": "error", "message": "Invalid email or password" }` |

---

### POST `/api/auth/refresh`

Exchange a refresh token for a new access/refresh token pair. Called by the client when the access token is expired or about to expire.

**Request body**

```json
{
  "refresh_token": "..."
}
```

**Validation (server)**
- Refresh token required (`ValidationError`, 400)
- Invalid or expired refresh token (`UnauthorizedError`, 401)

**Success — 200**

```json
{
  "token": "eyJ...",
  "refresh_token": "..."
}
```

**Errors**

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing refresh token | `{ "status": "error", "message": "..." }` |
| 401 | Invalid or expired refresh token | `{ "status": "error", "message": "Invalid or expired refresh token" }` |

---

### POST `/api/auth/logout`

Invalidate the current session server-side. Requires the current access token in the `Authorization` header.

**Headers**

```
Authorization: Bearer <access_token>
```

**Success — 200**

```json
{
  "message": "Logged out"
}
```

**Errors**

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing access token | `{ "status": "error", "message": "Access token is required" }` |

---

## Notes endpoints

All notes endpoints require authentication. The authenticated user's ID is read from `g.user.id`.

### GET `/api/notes/getAll`

List the current user's notes.

**Query:** none

**Behavior:** Returns notes where `title != ""`, ordered by `updated_at` descending.

**Success — 200**

```json
{
  "status": "ok",
  "notes": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "My note",
      "content": "<p>Hello</p>"
    }
  ]
}
```

---

### GET `/api/notes/get/:note_id`

Fetch a single note by ID.

**Success — 200**

```json
{
  "status": "ok",
  "note": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "My note",
    "content": "<p>Hello</p>"
  }
}
```

**Errors**

| Status | Condition |
|--------|-----------|
| 404 | Note not found |
| 403 | Note belongs to another user |

---

### POST `/api/notes/create`

Create a new note for the authenticated user.

**Request body**

```json
{
  "title": "",
  "content": ""
}
```

Both fields default to `""` if omitted.

**Behavior:** Creates the note and an initial version snapshot (`source: autosave`) via the `create_note_with_version` Postgres RPC.

**Success — 201**

```json
{
  "status": "ok",
  "note": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "",
    "content": ""
  }
}
```

---

### PUT `/api/notes/update/:note_id`

Update a note's title and content. Scoped to the authenticated user (`user_id` match in the repository query).

**Behavior:** Before applying changes, snapshots the current note into `note_versions` when `(title, content, font_size_px)` hash changes. Skips the update entirely when the hash is unchanged. Prunes old versions (last 50 and 30 days) after each new snapshot.

**Request body**

```json
{
  "title": "Updated title",
  "content": "<p>Updated content</p>"
}
```

**Success — 200**

```json
{
  "status": "ok"
}
```

**Errors**

| Status | Condition |
|--------|-----------|
| 404 | Note not found or not owned by user |

---

### GET `/api/notes/versions/:note_id`

List version history for a note. Newest first, up to 50 versions.

**Success — 200**

```json
{
  "status": "ok",
  "versions": [
    {
      "id": "uuid",
      "note_id": "uuid",
      "title": "My note",
      "font_size_px": 18,
      "source": "autosave",
      "created_at": "2026-06-25T12:00:00Z",
      "snippet": "Hello world…"
    }
  ]
}
```

**Errors**

| Status | Condition |
|--------|-----------|
| 404 | Note not found |
| 403 | Note belongs to another user |

---

### GET `/api/notes/version/:note_id/:version_id`

Fetch a full version snapshot (including HTML `content`).

**Success — 200**

```json
{
  "status": "ok",
  "version": {
    "id": "uuid",
    "note_id": "uuid",
    "user_id": "uuid",
    "title": "My note",
    "content": "<p>Hello</p>",
    "font_size_px": 18,
    "content_hash": "hex",
    "source": "autosave",
    "created_at": "2026-06-25T12:00:00Z"
  }
}
```

**Errors**

| Status | Condition |
|--------|-----------|
| 404 | Note or version not found |
| 403 | Note belongs to another user |

---

### POST `/api/notes/restore/:note_id/:version_id`

Restore a note to a previous version. Snapshots the current note first (`source: restore`) so the restore is reversible.

**Success — 200**

```json
{
  "status": "ok",
  "note": {
    "id": "uuid",
    "user_id": "uuid",
    "title": "My note",
    "content": "<p>Hello</p>",
    "font_size_px": 18,
    "updated_at": "2026-06-25T12:05:00Z"
  }
}
```

**Errors**

| Status | Condition |
|--------|-----------|
| 404 | Note or version not found |
| 403 | Note belongs to another user |

---

## Pins endpoints

All pins endpoints require authentication.

### GET `/api/pins/getAll`

List the current user's pins, ordered by `created_at` descending.

**Success — 200**

```json
{
  "status": "ok",
  "pins": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "source_type": "youtube",
      "source_url": "https://www.youtube.com/watch?v=...",
      "title": "AI-generated title",
      "summary": "AI-generated summary text...",
      "thumbnail_url": "https://i.ytimg.com/vi/.../hqdefault.jpg",
      "author": "Channel name",
      "description": "A short 1-2 sentence preview for the pin card.",
      "created_at": "2026-06-19T12:00:00Z"
    }
  ]
}
```

Returns an empty array if the user has no pins.

---

### POST `/api/pins/create`

Create a pin from a supported URL. The server detects the source type, fetches metadata (e.g. YouTube thumbnail and channel via YouTube Data API), fetches content (e.g. transcript), summarizes it with Gemini, and stores the result.

**Request body**

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Validation**
- `url` is required (`ValidationError`, 400)
- Must match a supported source handler (`ValidationError`, 400 — `"Unsupported URL"`)
- For YouTube: must be a valid URL with an available transcript (`ValidationError`, 400)

Supported URL formats (from `extract_video_id`):
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`

**Success — 201**

```json
{
  "status": "ok",
  "pin": {
    "id": "uuid",
    "user_id": "uuid",
    "source_type": "youtube",
    "source_url": "https://www.youtube.com/watch?v=...",
    "title": "Concise engaging title",
    "summary": "A well-written summary...",
    "thumbnail_url": "https://i.ytimg.com/vi/.../hqdefault.jpg",
    "author": "Channel name",
    "description": "A short 1-2 sentence preview for the pin card.",
    "created_at": "2026-06-19T12:00:00Z"
  }
}
```

**Errors**

| Status | Message (examples) |
|--------|---------------------|
| 400 | `"URL is required"` |
| 400 | `"Invalid YouTube URL"` |
| 400 | `"Transcript not available for this video"` |
| 400 | `"Unsupported URL"` |

---

## Error handling

### AppError hierarchy

Defined in `server/exceptions.py`:

| Class | HTTP status | Default message |
|-------|-------------|-----------------|
| `ValidationError` | 400 | (custom) |
| `UnauthorizedError` | 401 | `"Unauthorized"` |
| `InvalidCredentialsError` | 401 | `"Invalid email or password"` |
| `ForbiddenError` | 403 | `"Forbidden"` |
| `NotFoundError` | 404 | `"Not found"` |
| `ConflictError` | 409 | (custom) |

Routes raise these exceptions directly. Global handlers in `app.py` format the response:

```json
{
  "status": "error",
  "message": "Human-readable message"
}
```

Unexpected exceptions log a stack trace and return:

```json
{
  "status": "error",
  "message": "Something went wrong"
}
```

HTTP status: `500`

### Route-level validation

Auth and pins routes check required JSON fields inline and raise `ValidationError` before calling the service. Notes routes rely on defaults for optional fields.

### Repository errors

Some repository methods have TODO comments for mapping low-level Supabase/PostgREST errors to `AppError`. Currently, unhandled database errors may bubble up to the generic 500 handler.

---

## Shared middleware

### `auth_middleware`

Registered as `app.before_request` in `app.py`.

| Step | Behavior |
|------|----------|
| 1 | Skip `OPTIONS` requests |
| 2 | Skip `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`, and `/api/auth/logout` |
| 3 | Require `Authorization: Bearer <token>` header |
| 4 | Validate token via Supabase; set `g.user` |
| 5 | Return 401 JSON on failure |

The middleware attaches the raw Supabase user object to `g.user`. Route handlers access `g.user.id` for the authenticated user's UUID.

---

## Client-side API usage

| Module | Endpoints used |
|--------|----------------|
| `AuthContext` | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout` |
| `authStorage` | `POST /auth/refresh` |
| `notesService` | All `/notes/*` endpoints |
| `pinsService` | `GET /pins/getAll`, `POST /pins/create` |

All authenticated calls go through `apiFetch`, which prepends `VITE_API_BASE_URL`, attaches the Bearer token from `localStorage`, and refreshes on `401` via `authStorage.refreshAccessToken()`.
