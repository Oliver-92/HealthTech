import pino from 'pino'
import { env } from './env.js'

// Structured logger. JSON in all environments; quieter in tests.
export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : env.NODE_ENV === 'production' ? 'info' : 'debug',
})
