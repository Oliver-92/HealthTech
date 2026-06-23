import app from './app.js'
import { env } from './config/env.js'
import { prisma } from './config/prisma.js'
import { logger } from './config/logger.js'

const server = app.listen(env.PORT, () => {
  logger.info(`🚀  Server running on http://localhost:${env.PORT} (${env.NODE_ENV})`)
})

// Graceful shutdown: stop accepting connections, drain, disconnect DB
async function shutdown(signal: string) {
  logger.info(`${signal} received — shutting down gracefully`)
  server.close(async () => {
    await prisma.$disconnect()
    logger.info('HTTP server closed and database disconnected')
    process.exit(0)
  })
  // Force-exit if connections do not drain in time
  setTimeout(() => {
    logger.error('Could not close connections in time — forcing shutdown')
    process.exit(1)
  }, 10000).unref()
}

process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))
