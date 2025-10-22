# Riverflow (StackOverflow-style) — My Learning Journey, Stack, and Architecture

A full-stack Next.js app built to learn modern React/Next patterns, managed backend with Appwrite, and client state with Zustand. This README captures what I learned, why I chose this stack, what I built, and the patterns I’ll reuse in future projects.

## Tech Stack
- Next.js (App Router) + React 19
- Tailwind CSS
- Appwrite (node-appwrite Server SDK): TablesDB, Users, Storage
- Zustand (persist + immer)
- Radix UI label + small UI primitives

## Why These Choices
- Next.js App Router: server-first by default, layouts, colocated API routes, simpler mental model for data and routing.
- Appwrite: production-ready auth, database, and storage without running my own backend.
- Zustand: tiny, predictable client state with hydration control and persistence.
- Tailwind: fast, consistent styling; primitives keep components simple and accessible.

## Features Built
- Auth: register, login, session persistence (Zustand + Appwrite account)
- Voting: upvote/downvote with idempotent logic and author reputation updates
- Database + Storage bootstrap: automatic DB/tables/bucket creation in development
- Clean routing: auth routes grouped under `(auth)` with layout-based redirects

## Architecture at a Glance
See the full write-up with patterns and rationale:
- docs/Project-Architecture-and-Patterns.md

Key modules:
- app/ — App Router pages, layouts, API route handlers
- src/models/server/ — Appwrite client and schema setup (TablesDB, Storage)
- src/store/Auth.ts — Zustand auth store with hydration and session verification
- src/components/ui/ — Small UI primitives (Input, Label)
- src/middleware.ts — One-time setup for DB and Storage in dev

## Learning Highlights
- App Router vs Pages Router: use next/navigation hooks in app/; server components by default; mark interactive components with "use client".
- Hydration: avoid mismatches by providing deterministic defaults (e.g., input type) and moving dynamic-only logic to client components.
- Middleware: great for cross-cutting logic; run heavy setup once-per-process to avoid per-request costs.
- Appwrite TablesDB: define tables, columns, and indexes; make creation idempotent and handle 404/409 codes.
- Zustand: use persist + hydration gates (hydrated/authChecked) to avoid redirect flicker and stale session issues.

## Challenges Faced (and Fixes)
- NextRouter not mounted: in app/ use next/navigation, not next/router.
- Hydration mismatch on inputs: added "use client" and explicit default type="text".
- DB creation race: awaited `databases.create` before creating tables; made schema setup idempotent.
- Multiple setup runs: cached a module-level promise in middleware to run setup once.
- Windows/OneDrive readlink errors: clear .next/.turbo; prefer a non-OneDrive path or enable Developer Mode.
- Workspace root warning: remove extra lockfiles or set `outputFileTracingRoot` in next.config.

## Project Structure
- app/
  - layout.tsx, page.tsx
  - (auth)/layout.tsx, (auth)/login/page.tsx, (auth)/register/page.tsx
  - api/vote/route.ts
- src/models/server/
  - config.ts, dbSetup.ts, storageSetup.ts
  - question.collection.ts, answer.collection.ts, comment.collection.ts, vote.collection.ts
- src/store/Auth.ts
- src/components/ui/input.tsx, src/components/ui/label.tsx
- src/middleware.ts

## Setup
1) Install dependencies
- npm install

2) Environment
- Provide Appwrite values through your env loader (see src/models/server/config.ts). You’ll need:
  - APPWRITE_ENDPOINT
  - APPWRITE_PROJECT_ID
  - APPWRITE_API_KEY

3) Dev
- npm run dev
- First request triggers DB/bucket bootstrap in development.

## Scripts
- npm run dev — start dev server
- npm run build — production build
- npm run start — start production server
- npm run lint — lint the codebase

## API Overview
- POST /api/vote — create/update/withdraw a vote, then recalc totals and adjust author reputation.

## Reusing These Patterns
- Start server-first with App Router; use client components only when needed.
- Encapsulate backend setup in idempotent functions; run once via middleware in dev.
- Centralize auth in a small persisted store with hydration gates and a dedicated auth layout.
- Keep UI primitives small and deterministic to avoid hydration issues.

## License
Personal learning project; feel free to use the documented patterns.
