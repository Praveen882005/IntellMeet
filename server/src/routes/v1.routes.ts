import { Router } from 'express'
import authRoutes from './auth.routes'
import userRoutes from './user.routes'
import organizationRoutes from './organization.routes'
import workspaceRoutes from './workspace.routes'
import meetingRoutes from './meeting.routes'
import participantRoutes from './participant.routes'
import messageRoutes from './message.routes'
import transcriptRoutes from './transcript.routes'
import summaryRoutes from './summary.routes'
import actionItemRoutes from './actionItem.routes'
import recordingRoutes from './recording.routes'
import notificationRoutes from './notification.routes'
import aiRoutes from './ai.routes'
import healthRoutes from './health.routes'
import calendarRoutes from './calendar.routes'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/organizations', organizationRoutes)
router.use('/workspaces', workspaceRoutes)
router.use('/meetings', meetingRoutes)
router.use('/participants', participantRoutes)
router.use('/messages', messageRoutes)
router.use('/transcripts', transcriptRoutes)
router.use('/summaries', summaryRoutes)
router.use('/action-items', actionItemRoutes)
router.use('/recordings', recordingRoutes)
router.use('/notifications', notificationRoutes)
router.use('/ai', aiRoutes)
router.use('/health', healthRoutes)
router.use('/calendar', calendarRoutes)

export default router
