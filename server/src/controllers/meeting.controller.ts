import { Request, Response } from 'express'
import { MeetingService } from '../services/meeting.service'
import { ApiResponse } from '../utils/apiResponse'
import { AppError } from '../utils/appError'

export const getMeetings = async (req: Request, res: Response): Promise<void> => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20
  const meetings = await MeetingService.getRecentMeetings(limit)
  ApiResponse.success(res, meetings, 'Meetings retrieved successfully')
}

export const getMeetingByRoom = async (req: Request, res: Response): Promise<void> => {
  const roomId = String(req.params.roomId)
  const meeting = await MeetingService.getMeetingByRoomId(roomId)

  if (!meeting) {
    throw AppError.notFound(`No meeting found with room ID: ${roomId}`)
  }

  ApiResponse.success(res, meeting, 'Meeting details retrieved')
}

export const saveMeeting = async (req: Request, res: Response): Promise<void> => {
  const meeting = await MeetingService.saveMeeting(req.body)
  ApiResponse.created(res, meeting, 'Meeting record saved successfully')
}
