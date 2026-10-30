import { Request, Response } from 'express'
import { MeetingService } from '../services/meeting.service'
import { SfuService } from '../services/sfu.service'
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

export const createMeeting = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.userId || 'usr_host'
  const userName = req.user?.email.split('@')[0] || req.body.hostName || 'Lead Host'
  const { title, isPrivate, passcode, workspaceId } = req.body

  const meeting = await MeetingService.createMeeting({
    title,
    hostId: userId,
    hostName: userName,
    isPrivate,
    passcode,
    workspaceId: workspaceId || req.user?.workspaceId,
  })

  const protocol = req.protocol || 'http'
  const host = req.get('host') || 'localhost:5173'
  const inviteUrl = `${protocol}://${host}/room/${meeting.roomId}`

  ApiResponse.created(
    res,
    {
      ...meeting,
      inviteUrl,
    },
    'Meeting room initialized successfully.'
  )
}

export const validateMeetingAccess = async (req: Request, res: Response): Promise<void> => {
  const roomId = String(req.params.roomId)
  const userId = req.user?.userId

  const access = await MeetingService.validateMeetingAccess(roomId, userId)

  ApiResponse.success(res, access, 'Meeting room validated.')
}

export const getSfuToken = async (req: Request, res: Response): Promise<void> => {
  const roomId = String(req.params.roomId)
  const identity = req.user?.userId || (req.query.identity as string) || `user_${Date.now()}`
  const name = req.user?.email.split('@')[0] || (req.query.name as string) || 'Attendee'
  const isHost = req.user?.role === 'super_admin' || req.user?.role === 'org_admin' || req.user?.role === 'meeting_host'

  const credentials = await SfuService.generateToken({
    roomId,
    identity,
    name,
    isHost,
  })

  ApiResponse.success(res, credentials, 'SFU credentials issued.')
}

export const endMeeting = async (req: Request, res: Response): Promise<void> => {
  const roomId = String(req.params.roomId)
  const userId = req.user?.userId

  const result = await MeetingService.endMeeting(roomId, userId)
  ApiResponse.success(res, result, 'Meeting concluded for all participants.')
}
