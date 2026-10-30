import { Socket, Server } from 'socket.io'
import { logger } from '../utils/logger'

interface RoomParticipant {
  socketId: string
  userId?: string
  userName: string
  joinedAt: string
}

// In-memory room occupancy tracking
const activeRooms = new Map<string, Map<string, RoomParticipant>>()

export const registerRoomHandlers = (io: Server, socket: Socket): void => {
  socket.on('join-room', ({ roomId, userName, userId }) => {
    socket.join(roomId)

    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Map())
    }

    const participant: RoomParticipant = {
      socketId: socket.id,
      userId: userId || socket.id,
      userName: userName || 'Anonymous',
      joinedAt: new Date().toISOString(),
    }

    activeRooms.get(roomId)!.set(socket.id, participant)

    logger.info(`👤 ${participant.userName} (${socket.id}) joined room: ${roomId}`)

    // Notify other peers in room
    socket.to(roomId).emit('user-joined', {
      userId: socket.id,
      userName: participant.userName,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })

    // Send current participants list to joining client
    const currentUsers = Array.from(activeRooms.get(roomId)!.values())
    socket.emit('room-users', currentUsers)
  })

  socket.on('leave-room', ({ roomId }) => {
    handleUserLeave(io, socket, roomId)
  })

  socket.on('disconnecting', () => {
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        handleUserLeave(io, socket, roomId)
      }
    }
  })
}

function handleUserLeave(io: Server, socket: Socket, roomId: string): void {
  const room = activeRooms.get(roomId)
  if (room && room.has(socket.id)) {
    const user = room.get(socket.id)
    room.delete(socket.id)

    if (room.size === 0) {
      activeRooms.delete(roomId)
    }

    logger.info(`🚪 User ${user?.userName} (${socket.id}) left room: ${roomId}`)

    io.to(roomId).emit('user-left', {
      userId: socket.id,
      userName: user?.userName,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })
  }

  socket.leave(roomId)
}

export const getActiveRoomCount = (): number => activeRooms.size
