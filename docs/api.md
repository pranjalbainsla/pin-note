# API reference

Base URL (local dev): `http://localhost:5000/api`

The client reads this from `VITE_API_BASE_URL`.

## Authentication

Most endpoints require a valid Supabase JWT:

```
Authorization: Bearer <access_token>
```

Tokens are returned by `/auth/login` and `/auth/register`. The auth middleware validates tokens via `supabase.auth.get_user(token)` and attaches the user to `g.user`.

### Public routes (no token required)

| Method | Path |
|--------|------|
| POST | `/api/auth/login` |
| POST | `/api/auth/register` |

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

On the client, `apiFetch` clears `localStorage` and redirects to `/` on any `401` response.

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
| Auth | `{ user, token }` | `{ status: "error", message }` via AppError |
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
  "token": "eyJ..."
}
```

> **Note:** Supabase may require email confirmation depending on project settings. If `response.session` is null after signup, `token` may be `null`.

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
  "token": "eyJ..."
}
```

**Errors**

| Status | Condition | Body |
|--------|-----------|------|
| 400 | Missing/invalid email format | `{ "status": "error", "message": "..." }` |
| 401 | Wrong credentials | `{ "status": "error", "message": "Invalid email or password" }` |

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
      "summary": "AI-generated summary text..."
    }
  ]
}
```

Returns an empty array if the user has no pins.

---

### POST `/api/pins/create`

Create a pin from a YouTube URL. The server fetches the transcript, summarizes it with Gemini, and stores the result.

**Request body**

```json
{
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
}
```

**Validation**
- `url` is required (`ValidationError`, 400)
- Must be a valid YouTube URL (`ValidationError`, 400)
- Transcript must be available (`ValidationError`, 400)

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
    "summary": "A well-written summary..."
  }
}
```

**Errors**

| Status | Message (examples) |
|--------|---------------------|
| 400 | `"URL is required"` |
| 400 | `"Invalid YouTube URL"` |
| 400 | `"Transcript not available for this video"` |

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
| 2 | Skip `/api/auth/login` and `/api/auth/register` |
| 3 | Require `Authorization: Bearer <token>` header |
| 4 | Validate token via Supabase; set `g.user` |
| 5 | Return 401 JSON on failure |

The middleware attaches the raw Supabase user object to `g.user`. Route handlers access `g.user.id` for the authenticated user's UUID.

---

## Client-side API usage

| Module | Endpoints used |
|--------|----------------|
| `AuthContext` | `POST /auth/login`, `POST /auth/register` |
| `notesService` | All `/notes/*` endpoints |
| `pinsService` | `GET /pins/getAll`, `POST /pins/create` |

All authenticated calls go through `apiFetch`, which prepends `VITE_API_BASE_URL` and attaches the Bearer token from `localStorage`.
