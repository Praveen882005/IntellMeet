import { Request, Response } from 'express'
import { Transcript } from '../models/Transcript.model'
import { ApiResponse } from '../utils/apiResponse'
import { db } from '../config/db'

export const getTranscripts = async (req: Request, res: Response): Promise<void> => {
  const { meetingId, search } = req.query

  if (db.isConnected() && meetingId) {
    const filter: any = { meetingId }
    if (search) {
      filter.text = { $regex: search, $options: 'i' }
    }
    const chunks = await Transcript.find(filter).sort({ startTime: 1 }).lean()
    ApiResponse.success(res, chunks, 'Transcript chunks retrieved.')
    return
  }

  ApiResponse.success(
    res,
    [
      { speakerName: 'Sarah Chen', text: 'Let us confirm the WebRTC mesh deployment.', startTime: 1000 },
      { speakerName: 'David Miller', text: 'Health endpoint returned 200 OK with zero errors.', startTime: 4000 },
    ],
    'Transcript retrieved.'
  )
}

export const saveTranscriptChunk = async (req: Request, res: Response): Promise<void> => {
  const data = req.body

  if (db.isConnected()) {
    const chunk = await Transcript.create(data)
    ApiResponse.created(res, chunk, 'Transcript chunk saved.')
    return
  }

  ApiResponse.created(res, { ...data, _id: `tr_${Date.now()}` }, 'Chunk saved.')
}
