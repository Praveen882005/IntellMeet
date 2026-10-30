import { Router } from 'express'
import v1Routes from './v1.routes'
import { getHealth } from '../controllers/health.controller'

const rootRouter = Router()

// Health check accessible at /health as well
rootRouter.get('/health', getHealth)

// Mount V1 API
rootRouter.use('/v1', v1Routes)

export default rootRouter
