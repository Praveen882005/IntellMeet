import { Router } from 'express'
import multer from 'multer'
import {
  getRecordings,
  createRecording,
  uploadRecordingFile,
} from '../controllers/recording.controller'
import { asyncHandler } from '../utils/asyncHandler'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for recordings
})

const router = Router()

router.get('/', asyncHandler(getRecordings))
router.post('/', asyncHandler(createRecording))
router.post('/upload', upload.single('recording'), asyncHandler(uploadRecordingFile))

export default router
