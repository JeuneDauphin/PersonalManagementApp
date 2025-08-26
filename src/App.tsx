export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-4 py-4">
          <h1 className="text-xl font-semibold">Personal Management App</h1>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <p className="text-slate-600">React + Vite + TypeScript + Tailwind is ready.</p>
          <div className="mt-4 flex gap-3">
            <a
              className="inline-flex items-center rounded-md bg-sky-600 px-3 py-2 text-white hover:bg-sky-700"
              href="https://vitejs.dev/"
              target="_blank"
              rel="noreferrer"
            >
              Vite Docs
            </a>
            <a
              className="inline-flex items-center rounded-md border px-3 py-2 hover:bg-slate-50"
              href="https://tailwindcss.com/"
              target="_blank"
              rel="noreferrer"
            >
              Tailwind Docs
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
