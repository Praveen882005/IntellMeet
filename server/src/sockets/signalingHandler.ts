import { Socket, Server } from 'socket.io'
import { logger } from '../utils/logger'

export const registerSignalingHandlers = (io: Server, socket: Socket): void => {
  // WebRTC SDP and ICE Candidate exchange
  socket.on('signal', ({ roomId, targetId, signalData }) => {
    if (targetId) {
      io.to(targetId).emit('signal', {
        senderId: socket.id,
        signalData,
      })
    } else if (roomId) {
      socket.to(roomId).emit('signal', {
        senderId: socket.id,
        signalData,
      })
    }
  })

  // Media state changes (mute, camera off, screen share)
  socket.on('media-state-change', ({ roomId, audioEnabled, videoEnabled, screenSharing }) => {
    socket.to(roomId).emit('media-state-change', {
      userId: socket.id,
      audioEnabled,
      videoEnabled,
      screenSharing,
    })
  })
}
