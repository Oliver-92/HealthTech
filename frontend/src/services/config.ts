export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

// Simula latencia de red en los mocks
export const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))
