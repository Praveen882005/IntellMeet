import { Socket, Server } from 'socket.io'
import { logger } from '../utils/logger'

export const registerChatHandlers = (io: Server, socket: Socket): void => {
  socket.on('send-message', ({ roomId, message }) => {
    logger.debug(`💬 [Room ${roomId}] ${message.sender}: ${message.text}`)

    const enrichedMessage = {
      ...message,
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    // Broadcast to everyone in the room (including sender or to others depending on client pattern)
    io.to(roomId).emit('receive-message', enrichedMessage)
  })

  socket.on('user-typing', ({ roomId, userName, isTyping }) => {
    socket.to(roomId).emit('user-typing', {
      userId: socket.id,
      userName,
      isTyping,
    })
  })
}
