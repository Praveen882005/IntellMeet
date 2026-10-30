import { Request, Response } from 'express'
import { Notification } from '../models/Notification.model'
import { ApiResponse } from '../utils/apiResponse'
import { db } from '../config/db'

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId

  if (db.isConnected() && userId) {
    const list = await Notification.find({ recipientId: userId }).sort({ createdAt: -1 }).limit(20).lean()
    ApiResponse.success(res, list, 'Notifications retrieved.')
    return
  }

  ApiResponse.success(
    res,
    [
      { id: 'notif_1', title: 'Meeting Summary Ready', message: 'AI minutes generated for Sprint Q4.', read: false },
      { id: 'notif_2', title: 'Task Assigned', message: 'You were assigned: Finalize WebRTC signaling.', read: true },
    ],
    'Notifications retrieved.'
  )
}

export const markNotificationRead = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params

  if (db.isConnected()) {
    await Notification.findByIdAndUpdate(id, { read: true, readAt: new Date() })
  }

  ApiResponse.success(res, { id, read: true }, 'Notification marked as read.')
}
