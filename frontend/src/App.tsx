import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { ErrorBoundary, FullScreenLoader } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'
import { useSessionBootstrap } from '@/hooks/useSessionBootstrap'
import { AppRouter } from '@/router/AppRouter'

function App() {
  const { theme } = useTheme()
  const ready = useSessionBootstrap()

  return (
    <ErrorBoundary>
      {ready ? <AppRouter /> : <FullScreenLoader />}
      <ToastContainer position="top-right" autoClose={4000} theme={theme} />
    </ErrorBoundary>
  )
}

export default App
