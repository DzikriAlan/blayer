import { createRoute } from '../../shared/route'
import { healthController } from './controllers/health.controller'

export const healthModule = {
  status: createRoute('health', {
    GET: (req, res) => healthController.loadHealth(req, res),
  }),
}
