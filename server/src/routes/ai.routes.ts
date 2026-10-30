import { Router } from 'express'
import multer from 'multer'
import {
  summarizeMeeting,
  extractTasks,
  askAssistant,
  transcribeAudio,
  getJobStatus,
  getInsights,
} from '../controllers/ai.controller'
import { asyncHandler } from '../utils/asyncHandler'

const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB audio files
})

const router = Router()

router.post('/summarize', asyncHandler(summarizeMeeting))
router.post('/extract-tasks', asyncHandler(extractTasks))
router.post('/chat', asyncHandler(askAssistant))
router.post('/assistant', asyncHandler(askAssistant))
router.post('/query', asyncHandler(askAssistant))
router.post('/transcribe', audioUpload.single('audio'), asyncHandler(transcribeAudio))
router.get('/jobs/:jobId', asyncHandler(getJobStatus))
router.get('/insights/:meetingId', asyncHandler(getInsights))

export default router
