import { createRoute } from '@/server/shared/route'
import { healthController } from './controllers/health.controller'

export const healthModule = {
  status: createRoute('health', {
    GET: (req, res) => healthController.loadHealth(req, res),
  }),
}
