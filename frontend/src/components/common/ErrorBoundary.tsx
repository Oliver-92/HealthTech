import { Component } from 'react'
import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-4">
          <p className="text-base font-medium text-foreground">Algo salió mal</p>
          <p className="text-sm text-muted max-w-xs">
            Ocurrió un error inesperado. Podés intentar recargar la página.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-1 rounded-(--radius) border border-border px-4 py-2 text-sm hover:bg-surface-2 transition-colors"
          >
            Recargar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
