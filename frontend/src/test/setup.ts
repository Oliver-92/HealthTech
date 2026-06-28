import '@testing-library/jest-dom/vitest'
import { afterEach, afterAll, beforeAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './msw/server'

// jsdom no implementa matchMedia (lo usa useTheme para detectar el tema del sistema)
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList
}

// MSW: intercepta las requests en los tests de flujo. Las requests sin handler
// fallan (atrapa handlers faltantes); los tests unitarios no hacen requests.
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

afterEach(() => {
  cleanup() // desmonta el árbol de React y limpia el DOM
  server.resetHandlers()
})

afterAll(() => server.close())
