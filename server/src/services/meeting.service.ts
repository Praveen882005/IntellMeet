import { Meeting, IMeetingDocument } from '../models/Meeting.model'
import { db } from '../config/db'
import { logger } from '../utils/logger'

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

export class MeetingService {
  private static inMemoryMeetings: Array<Record<string, unknown>> = []

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

    return this.inMemoryMeetings.slice().reverse().slice(0, limit)
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

    const cached = this.inMemoryMeetings.find((m) => m.roomId === roomId)
    return cached || null
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
      actionItems: (input.actionItems || []).map((item, idx) => ({
        id: item.id || Date.now() + idx,
        text: item.text,
        assignee: item.assignee || 'Unassigned',
        completed: Boolean(item.completed),
      })),
      status: 'completed',
      actualStartTime: new Date(),
      endTime: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Always update in-memory cache
    this.inMemoryMeetings.push(formattedData)

    if (db.isConnected()) {
      try {
        // Upsert by roomId
        const saved = await Meeting.findOneAndUpdate(
          { roomId: input.roomId },
          { $set: formattedData },
          { new: true, upsert: true }
        )
        logger.info(`💾 [MongoDB] Meeting record saved: ${input.roomId}`)
        return saved
      } catch (err: unknown) {
        logger.error('Failed to save meeting in MongoDB, kept in-memory buffer:', {
          error: (err as Error).message,
        })
      }
    }

    logger.info(`💾 [MemoryStore] Meeting record saved: ${input.roomId}`)
    return formattedData
  }
}
