import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { ErrorBoundary, FullScreenLoader } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'
import { useSessionBootstrap } from '@/hooks/useSessionBootstrap'
import { KitchenSink } from '@/pages/_KitchenSink'

function App() {
  const { theme } = useTheme()
  const ready = useSessionBootstrap()

  return (
    <ErrorBoundary>
      {/* Etapa 3.5: KitchenSink se reemplaza por <AppRouter /> */}
      {ready ? <KitchenSink /> : <FullScreenLoader />}
      <ToastContainer position="top-right" autoClose={4000} theme={theme} />
    </ErrorBoundary>
  )
}

export default App
