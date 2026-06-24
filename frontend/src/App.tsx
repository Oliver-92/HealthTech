function App() {
  const toggle = () => document.documentElement.classList.toggle('dark')
  return (
    <div className="min-h-svh bg-background text-foreground p-8 space-y-4">
      <h1 className="text-2xl font-semibold">HealthTech — Etapa 0 ✅</h1>
      <div className="flex gap-3">
        <span className="rounded-md bg-primary px-3 py-1 text-primary-foreground">primary</span>
        <span className="rounded-md bg-surface-2 px-3 py-1 border border-border">surface-2</span>
        <span className="rounded-md bg-success/15 px-3 py-1 text-success">success</span>
        <span className="rounded-md bg-danger/15 px-3 py-1 text-danger">danger</span>
      </div>
      <button onClick={toggle} className="rounded-md border border-border px-4 py-2">
        Toggle dark mode
      </button>
    </div>
  )
}
export default App
