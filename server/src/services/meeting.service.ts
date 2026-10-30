import crypto from 'crypto'
import { Meeting, IMeetingDocument } from '../models/Meeting.model'
import { db } from '../config/db'
import { logger } from '../utils/logger'
import { SfuService, SfuCredentials } from './sfu.service'
import { getSocketServer } from '../sockets/socketHandler'

export interface SaveMeetingInput {
  roomId: string
  title?: string
  hostName?: string
  participants?: string[]
  summary?: string
  keyDecisions?: string[]
  actionItems?: Array<{
    id?: string | number
    text: string
    assignee: string
    completed?: boolean
  }>
}

export interface CreateMeetingInput {
  title?: string
  hostId?: string
  hostName?: string
  passcode?: string
  isPrivate?: boolean
  workspaceId?: string
}

export class MeetingService {
  private static inMemoryMeetings: Map<string, any> = new Map()

  /**
   * Generates a unique, URL-safe meeting ID formatted like meet-abc-xyz
   */
  public static generateRoomId(): string {
    const p1 = crypto.randomBytes(3).toString('hex').slice(0, 4)
    const p2 = crypto.randomBytes(3).toString('hex').slice(0, 4)
    return `meet-${p1}-${p2}`
  }

  public static async createMeeting(input: CreateMeetingInput): Promise<any> {
    const roomId = this.generateRoomId()
    const title = input.title || 'IntellMeet Video Conference'
    const hostId = input.hostId || 'usr_host'
    const hostName = input.hostName || 'Host'

    const meetingData = {
      roomId,
      title,
      hostId,
      hostName,
      status: 'active',
      isPrivate: Boolean(input.isPrivate),
      passcode: input.passcode || '',
      participantsCount: 1,
      participantsList: [hostName],
      actualStartTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (db.isConnected()) {
      try {
        const meeting = await Meeting.create(meetingData)
        return meeting.toObject()
      } catch (err: unknown) {
        logger.warn('Failed to save meeting to MongoDB, using memory cache:', {
          error: (err as Error).message,
        })
      }
    }

    this.inMemoryMeetings.set(roomId, meetingData)
    return meetingData
  }

  public static async validateMeetingAccess(
    roomId: string,
    userId?: string
  ): Promise<{
    meeting: any
    isHost: boolean
    iceServers: RTCIceServer[]
  }> {
    let meeting: any = null

    if (db.isConnected()) {
      try {
        meeting = await Meeting.findOne({ roomId }).lean()
      } catch (err: unknown) {
        logger.warn('Error querying MongoDB for room validation:', { error: (err as Error).message })
      }
    }

    if (!meeting) {
      meeting = this.inMemoryMeetings.get(roomId)
    }

    // Auto-create room record if joining ad-hoc room
    if (!meeting) {
      meeting = {
        roomId,
        title: `Meeting ${roomId}`,
        hostId: userId || 'anonymous',
        hostName: 'Host',
        status: 'active',
        actualStartTime: new Date(),
      }
      this.inMemoryMeetings.set(roomId, meeting)
    }

    const isHost = meeting.hostId === userId || meeting.hostName === userId

    return {
      meeting,
      isHost,
      iceServers: SfuService.getIceServers(),
    }
  }

  public static async endMeeting(roomId: string, userId?: string): Promise<any> {
    const now = new Date()

    if (db.isConnected()) {
      await Meeting.findOneAndUpdate(
        { roomId },
        { status: 'completed', endTime: now },
        { new: true }
      )
    }

    const cached = this.inMemoryMeetings.get(roomId)
    if (cached) {
      cached.status = 'completed'
      cached.endTime = now
    }

    // Broadcast meeting-ended to active participants via Socket.io
    const io = getSocketServer()
    if (io) {
      io.to(roomId).emit('meeting-ended', {
        roomId,
        endedAt: now.toISOString(),
        message: 'The host has ended this meeting for all participants.',
      })
      logger.info(`🛑 Broadcasted meeting-ended event for room: ${roomId}`)
    }

    return { roomId, status: 'completed', endTime: now }
  }

  public static async getRecentMeetings(limit = 20): Promise<unknown[]> {
    if (db.isConnected()) {
      try {
        const meetings = await Meeting.find().sort({ createdAt: -1 }).limit(limit).lean()
        return meetings
      } catch (err: unknown) {
        logger.warn('Failed to query MongoDB, falling back to memory store:', {
          error: (err as Error).message,
        })
      }
    }

    return Array.from(this.inMemoryMeetings.values()).reverse().slice(0, limit)
  }

  public static async getMeetingByRoomId(roomId: string): Promise<unknown | null> {
    if (db.isConnected()) {
      try {
        const meeting = await Meeting.findOne({ roomId }).lean()
        if (meeting) return meeting
      } catch (err: unknown) {
        logger.warn('Failed to query MongoDB for roomId:', { error: (err as Error).message })
      }
    }

    return this.inMemoryMeetings.get(roomId) || null
  }

  public static async saveMeeting(input: SaveMeetingInput): Promise<unknown> {
    const formattedData = {
      roomId: input.roomId,
      title: input.title || `Meeting: ${input.roomId}`,
      hostName: input.hostName || 'Anonymous Host',
      participantsCount: input.participants?.length || 1,
      participantsList: input.participants || [],
      summary: input.summary || '',
      keyDecisions: input.keyDecisions || [],
      actionItems: input.actionItems || [],
      status: 'completed',
      actualStartTime: new Date(),
      endTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (db.isConnected()) {
      try {
        const saved = await Meeting.findOneAndUpdate(
          { roomId: input.roomId },
          { $set: formattedData },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        )
        logger.info(`💾 Meeting report saved to MongoDB: ${input.roomId}`)
        return saved
      } catch (err: unknown) {
        logger.warn('Failed to save meeting report to MongoDB, falling back to memory cache:', {
          error: (err as Error).message,
        })
      }
    }

    this.inMemoryMeetings.set(input.roomId, formattedData)
    logger.info(`💾 [MemoryStore] Meeting record saved: ${input.roomId}`)
    return formattedData
  }
}
