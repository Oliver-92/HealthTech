import { setupServer } from 'msw/node'

// Servidor MSW para los tests de flujo. Cada test registra sus handlers con
// `server.use(...)`; se resetean entre tests desde el setup global.
export const server = setupServer()
