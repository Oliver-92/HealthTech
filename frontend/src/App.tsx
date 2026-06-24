import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer, toast } from 'react-toastify'
import { ThemeToggle } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'

function App() {
  const { theme } = useTheme()

  return (
    <div className="min-h-svh bg-background text-foreground p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">HealthTech — Etapa 1 (WIP)</h1>
        <ThemeToggle />
      </div>

      <div className="flex gap-3 flex-wrap">
        <span className="rounded-md bg-primary px-3 py-1 text-primary-foreground">primary</span>
        <span className="rounded-md bg-surface-2 px-3 py-1 border border-border">surface-2</span>
        <span className="rounded-md bg-success/15 px-3 py-1 text-success">success</span>
        <span className="rounded-md bg-danger/15 px-3 py-1 text-danger">danger</span>
      </div>

      <button
        type="button"
        onClick={() => toast.success('¡Notificaciones funcionando!')}
        className="rounded-md border border-border px-4 py-2 hover:bg-surface-2 transition-colors"
      >
        Probar toast
      </button>

      <ToastContainer position="top-right" autoClose={4000} theme={theme} />
    </div>
  )
}

export default App
