# Bolean

Peer-to-peer credit reputation and background verification for Lesotho — Next.js frontend.

The backend is a separate FastAPI project (`Flagger_app`).

## Running the app

1. Copy `.env.local.example` to `.env.local` and point `NEXT_PUBLIC_API_URL` at your running backend (defaults to `http://127.0.0.1:8000`, matching the backend's own default).
2. `npm install`
3. `npm run dev`

## Other scripts

- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint

## Project layout

- `src/app/` — Next.js App Router routes: `(auth)` for login/registration, `(dashboard)` for the authenticated app (consumer + lender views).
- `src/lib/api/` — the single axios client and typed wrappers per backend resource.
- `src/store/` — the auth store (JWT held in memory only, never persisted).
- `src/hooks/` — React Query hooks wrapping the API layer.
- `src/components/` — UI components, grouped by feature.
- `legacy/` — the original prototype's screens and mock data, kept only as a reference while the remaining screens are ported onto the real backend. Not part of the build.
