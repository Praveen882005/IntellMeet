import { Request, Response } from 'express'
import mongoose from 'mongoose'
import { Message } from '../models/Message.model'
import { Meeting } from '../models/Meeting.model'
import { ApiResponse } from '../utils/apiResponse'
import { db } from '../config/db'

export const inMemoryMessages: any[] = []

export const getMessages = async (req: Request, res: Response): Promise<void> => {
  const meetingId = req.query.meetingId as string

  if (!meetingId) {
    ApiResponse.success(res, [], 'Messages retrieved.')
    return
  }

  if (db.isConnected()) {
    try {
      const queryCriteria: any[] = [
        { meetingId },
        { meetingRoomId: meetingId },
      ]

      if (mongoose.isValidObjectId(meetingId)) {
        queryCriteria.push({ meetingId: new mongoose.Types.ObjectId(meetingId) })
      } else {
        const meeting = await Meeting.findOne({ roomId: meetingId }).select('_id').lean()
        if (meeting) {
          queryCriteria.push({ meetingId: meeting._id })
        }
      }

      const messages = await Message.find({ $or: queryCriteria }).sort({ createdAt: 1 }).lean()
      ApiResponse.success(res, messages, 'Chat messages retrieved.')
      return
    } catch {
      ApiResponse.success(res, [], 'Chat messages retrieved.')
      return
    }
  }

  const filtered = inMemoryMessages.filter(
    (m) => m.meetingId === meetingId || m.meetingRoomId === meetingId
  )
  ApiResponse.success(res, filtered, 'Chat messages retrieved.')
}

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  const data = req.body
  const meetingId = data.meetingId || data.roomId

  if (db.isConnected()) {
    try {
      const msg = await Message.create({
        ...data,
        meetingId,
        meetingRoomId: data.roomId || (typeof meetingId === 'string' ? meetingId : undefined),
        senderId: req.user?.userId,
        senderName: req.user?.email.split('@')[0] || data.senderName || 'Anonymous',
      })
      ApiResponse.created(res, msg, 'Message recorded.')
      return
    } catch {
      // fallback in case of write error
    }
  }

  const mockMsg = {
    ...data,
    _id: `msg_${Date.now()}`,
    meetingId,
    meetingRoomId: data.roomId || meetingId,
    content: data.content || data.text,
    senderName: data.senderName || 'Anonymous',
    createdAt: new Date(),
  }
  inMemoryMessages.push(mockMsg)

  ApiResponse.created(res, mockMsg, 'Message recorded.')
}
