# Beautiful To-Do App (React)

This project has been converted from a single-file HTML app into a modern React app (Vite + Tailwind).

The original version is preserved at `legacy/index.legacy.html`.

## Run locally

1) Install dependencies

`npm install`

2) Start dev server

`npm run dev`

Then open the URL shown in the terminal (usually `http://localhost:5173`).

## Features

- Offline-first (autosaves to localStorage)
- Private/Public lists (two separate lists)
- Add / edit (double click) / delete / complete tasks
- Filter (All / Active / Done), search, sort by priority
- Bulk actions (toggle all, clear done)
- Import/Export tasks as JSON

## Notes

- If you want Firebase auth + sync again, we can add it back via `.env` and the Firebase SDK (the dependency is already included). Tell me and I’ll wire it up.