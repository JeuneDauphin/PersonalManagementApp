PersonalManagementApp — React + Vite + TypeScript + Tailwind

This project is set up with:
- Vite (fast dev server and build)
- React 18/19 (with SWC plugin)
- TypeScript (tsx)
- Tailwind CSS (via PostCSS + Autoprefixer)

Quick start

1) Install dependencies

```bash
npm install
npm install -D vite @vitejs/plugin-react-swc typescript tailwindcss postcss autoprefixer
```

2) Initialize Tailwind (optional if configs already exist)

```bash
npx tailwindcss init -p
```

3) Dev server

```bash
npm run dev
```

4) Build and preview

```bash
npm run build
npm run preview
```

Project structure

- `index.html` — HTML entry
- `vite.config.ts` — Vite config with React SWC plugin
- `tsconfig.json` — TS config for app code
- `postcss.config.js` — PostCSS + Tailwind wiring
- `tailwind.config.ts` — Tailwind config with content paths
- `src/main.tsx` — App bootstrap
- `src/App.tsx` — Example component
- `src/index.css` — Tailwind directives and base styles

Notes

- If you see type errors, run `npm run typecheck` to check TypeScript without emitting.
- If the dev server doesn’t start, ensure dev dependencies are installed (see step 1).

Behavior: Multi-day events

- In month view, events that start on one day and end on a later day are shown on their start day and end day only (not on the in-between days), labeled as “(Start)” and “(End)”.
- In week/day time grid, multi-day timed events have two markers: a small “Starts HH:mm” marker on the start day and a small “Ends HH:mm” marker on the end day. All-day multi-day events appear in the all-day lane on both the start and end days.
- In the sidebar event list and date shortcut, days are marked if they contain either a start or end of a multi-day event, and the list shows “(Start)”/“(End)” labels accordingly.
