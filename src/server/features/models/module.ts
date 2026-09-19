import { createRoute } from '@/server/shared/route'
import { modelsController } from './controllers/models.controller'

export const modelsModule = {
  collection: createRoute('models', {
    GET: (req, res) => modelsController.loadModels(req, res),
  }),
}
