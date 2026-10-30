import { Router } from 'express'
import {
  getMeetings,
  getMeetingByRoom,
  saveMeeting,
} from '../controllers/meeting.controller'
import { asyncHandler } from '../utils/asyncHandler'
import { validate } from '../middleware/validate.middleware'
import {
  saveMeetingReportSchema,
  getMeetingByRoomSchema,
} from '../validators/meeting.validator'

const router = Router()

router.get('/', asyncHandler(getMeetings))
router.get('/:roomId', validate(getMeetingByRoomSchema), asyncHandler(getMeetingByRoom))
router.post('/', validate(saveMeetingReportSchema), asyncHandler(saveMeeting))

export default router
