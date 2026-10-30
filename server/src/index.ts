import http from 'http'
import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { env } from './config/env'
import { corsOptions } from './config/cors'
import { db } from './config/db'
import { logger } from './utils/logger'
import { requestLogger } from './middleware/requestLogger.middleware'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware'
import rootRouter from './routes'
import { initSocketServer } from './sockets/socketHandler'

export const createApp = (): { app: Express; server: http.Server } => {
  const app = express()
  const server = http.createServer(app)

  // Security & Utility Middleware
  app.use(helmet({ crossOriginResourcePolicy: false }))
  app.use(cors(corsOptions))
  app.use(compression())
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  app.use(requestLogger)

  // Root welcome & status
  app.get('/', (req, res) => {
    res.json({
      service: 'IntellMeet Enterprise Collaboration Engine',
      version: '1.0.0',
      status: 'active',
      endpoints: {
        health: '/api/v1/health',
        meetings: '/api/v1/meetings',
        aiSummaries: '/api/v1/ai/summarize',
      },
    })
  })

  // API Routes
  app.use('/api', rootRouter)

  // 404 & Centralized Error Handler
  app.use(notFoundHandler)
  app.use(errorHandler)

  // Socket.io initialization
  initSocketServer(server)

  return { app, server }
}

export const startServer = async (): Promise<http.Server> => {
  const { server } = createApp()

  // Connect to Database
  await db.connect()

  // Listen on PORT
  const port = env.PORT || 5000
  server.listen(port, () => {
    logger.info(`🚀 IntellMeet Server running at http://localhost:${port}`)
    logger.info(`📡 Real-time Socket.io signaling active on port ${port}`)
    logger.info(`🩺 Health check accessible at http://localhost:${port}/api/v1/health`)
  })

  // Graceful shutdown
  const handleShutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Gracefully shutting down IntellMeet server...`)
    server.close(async () => {
      await db.disconnect()
      logger.info('IntellMeet server terminated gracefully.')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => handleShutdown('SIGTERM'))
  process.on('SIGINT', () => handleShutdown('SIGINT'))

  return server
}

// Start when executed directly
if (require.main === module) {
  startServer().catch((err) => {
    logger.error('Fatal error during server startup:', { error: err.message })
    process.exit(1)
  })
}
