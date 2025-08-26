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
