# Project Rules

## Token Efficiency
These rules apply to normal development tasks (bug fixes, features, small
refactors, reviews, single-file changes). They do NOT apply to explicitly
requested full-repo tasks (e.g., "onboard this repo", "audit the entire
codebase", "generate full documentation").

- Optimize for minimal token usage on normal tasks.
- Never scan the entire codebase unless explicitly requested.
- Read only the files required for the task.
- Prefer semantic search and existing context over exhaustive exploration.
- Reuse previously gathered knowledge within the same session.
- Update only affected sections instead of regenerating entire files.
- If a task seems to require broad exploration but wasn't explicitly framed
  as a full-repo task, ask for confirmation first.

## Full-Repo / Onboarding Tasks
- Exploration is expected and should not be artificially limited.
- To avoid redundant re-reading across multiple outputs (e.g., generating
  README + architecture.md + api.md + decisions.md), use a two-phase
  approach:
  1. First pass: explore the codebase once and write findings to a single
     internal notes file (e.g., `docs/_notes.md`) — architecture, folder
     structure, data flow, API surface, patterns, inferred decisions.
  2. Subsequent passes: generate each requested doc from `docs/_notes.md`
     only, without re-scanning the repo, unless something is missing or
     unclear.
- If `docs/_notes.md` becomes stale on a later run, prefer targeted
  re-exploration of changed areas over a full re-scan.

## Error handling
- Use global error handlers.
- Do not add unnecessary try/catch blocks.
- Catch only where you need to transform an error into a specific AppError
  type, or handle it differently from the default.
- Raise AppError for expected failures.

## Database
- All database access goes through repositories.
- Services should not execute SQL directly.

## API responses
- Return JSON in the format:
  {
    "status": "...",
    "message": "...",
    "data": ...
  }

## Code style
- Prefer small functions.
- Reuse existing utilities before creating new ones.
- Follow existing folder structure.
- Extend existing patterns instead of introducing new abstractions.
- If an existing pattern genuinely doesn't fit, propose the new abstraction
  explicitly rather than silently deviating.

## Documentation
- When a change affects architecture, API surface, folder structure, or a
  documented decision, update the relevant doc in the same task — small,
  targeted edits only (don't regenerate whole files).
- If unsure whether a change is doc-worthy, ask rather than skipping silently.