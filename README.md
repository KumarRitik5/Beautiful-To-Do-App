# Beautiful To-Do App (Full Stack)

This project is a full-stack To-Do app built with:

- Frontend: React + Vite + Tailwind
- Backend: Vercel Serverless Functions (`/api/*`)
- Data store: Vercel KV (with in-memory fallback for local development)

## Features

- Email/password auth (signup/login/logout)
- Cookie-based server session
- Cloud-synced private/public task lists
- Add/edit/delete/complete/filter/search/sort tasks
- Import/Export tasks as JSON
- Deployable on Vercel as one project (frontend + backend)

## Run locally

1) Install dependencies

`npm install`

2) Start dev server

`npm run dev`

3) Open the shown URL (usually `http://localhost:5173`)

Local development works without KV (data is kept in-memory on backend process).

## Deploy on Vercel

1) Push this repo to GitHub.

2) Import the project in Vercel.

3) In Vercel dashboard, add **Vercel KV** storage to your project.

4) Ensure these env vars exist in Vercel project settings:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

5) Deploy.

Your API will be available at `/api/*` on the same domain.

## Optional frontend env vars

- `VITE_API_BASE_URL` (optional)
	- Leave empty for same-origin calls (recommended for Vercel).
	- Set only if frontend and backend are on different domains.