import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { ErrorBoundary } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'
import { KitchenSink } from '@/pages/_KitchenSink'

function App() {
  const { theme } = useTheme()

  return (
    <ErrorBoundary>
      {/* Etapa 3: aquí irá <AppRouter />. Por ahora, el kitchen sink. */}
      <KitchenSink />
      <ToastContainer position="top-right" autoClose={4000} theme={theme} />
    </ErrorBoundary>
  )
}

export default App
