import { Router } from 'express'
import {
  getMeetings,
  getMeetingByRoom,
  saveMeeting,
  createMeeting,
  validateMeetingAccess,
  getSfuToken,
  endMeeting,
} from '../controllers/meeting.controller'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

router.get('/', asyncHandler(getMeetings))
router.post('/', asyncHandler(saveMeeting))
router.post('/create', asyncHandler(createMeeting))
router.get('/validate/:roomId', asyncHandler(validateMeetingAccess))
router.get('/:roomId/token', asyncHandler(getSfuToken))
router.post('/:roomId/end', asyncHandler(endMeeting))
router.get('/:roomId', asyncHandler(getMeetingByRoom))

export default router
