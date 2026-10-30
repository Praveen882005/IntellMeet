import { Request, Response } from 'express'
import { Recording } from '../models/Recording.model'
import { ApiResponse } from '../utils/apiResponse'
import { db } from '../config/db'

export const getRecordings = async (req: Request, res: Response): Promise<void> => {
  const { meetingId } = req.query

  if (db.isConnected()) {
    const filter = meetingId ? { meetingId } : {}
    const list = await Recording.find(filter).sort({ createdAt: -1 }).lean()
    ApiResponse.success(res, list, 'Recordings retrieved.')
    return
  }

  ApiResponse.success(
    res,
    [
      { id: 'rec_1', title: 'Sprint Q4 Architecture Review', durationSeconds: 2535, format: 'mp4', status: 'ready' },
      { id: 'rec_2', title: 'Weekly Cross-Functional Design Critique', durationSeconds: 1880, format: 'mp4', status: 'ready' },
    ],
    'Recordings retrieved.'
  )
}

export const createRecording = async (req: Request, res: Response): Promise<void> => {
  const data = req.body

  if (db.isConnected()) {
    const recording = await Recording.create(data)
    ApiResponse.created(res, recording, 'Recording logged.')
    return
  }

  ApiResponse.created(res, { ...data, _id: `rec_${Date.now()}` }, 'Recording logged.')
}
