import { Router } from 'express'
import { getNotifications, markNotificationRead } from '../controllers/notification.controller'
import { asyncHandler } from '../utils/asyncHandler'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.use(authenticate)

router.get('/', asyncHandler(getNotifications))
router.patch('/:id/read', asyncHandler(markNotificationRead))

export default router
