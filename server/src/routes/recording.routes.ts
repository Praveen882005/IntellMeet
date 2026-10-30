import { Router } from 'express'
import { getRecordings, createRecording } from '../controllers/recording.controller'
import { asyncHandler } from '../utils/asyncHandler'

const router = Router()

router.get('/', asyncHandler(getRecordings))
router.post('/', asyncHandler(createRecording))

export default router
