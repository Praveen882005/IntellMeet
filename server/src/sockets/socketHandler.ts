import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { env } from '../config/env'
import { logger } from '../utils/logger'
import { registerRoomHandlers } from './roomHandler'
import { registerSignalingHandlers } from './signalingHandler'
import { registerChatHandlers } from './chatHandler'
import { registerTranscriptionHandlers } from './transcriptionHandler'

let io: Server | null = null

export const initSocketServer = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.isDev ? '*' : env.corsOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  })

  io.on('connection', (socket: Socket) => {
    logger.info(`⚡ [Socket Connected] Client ID: ${socket.id}`)

    // Register modular feature handlers
    registerRoomHandlers(io!, socket)
    registerSignalingHandlers(io!, socket)
    registerChatHandlers(io!, socket)
    registerTranscriptionHandlers(io!, socket)

    socket.on('disconnect', (reason) => {
      logger.info(`🔌 [Socket Disconnected] Client ID: ${socket.id} (Reason: ${reason})`)
    })
  })

  return io
}

export const getSocketServer = (): Server | null => io
