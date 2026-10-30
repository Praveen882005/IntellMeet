import { Router } from 'express'
import { summarizeMeeting } from '../controllers/ai.controller'
import { asyncHandler } from '../utils/asyncHandler'
import { validate } from '../middleware/validate.middleware'
import { summarizeMeetingSchema } from '../validators/ai.validator'

const router = Router()

router.post('/summarize', validate(summarizeMeetingSchema), asyncHandler(summarizeMeeting))

export default router
