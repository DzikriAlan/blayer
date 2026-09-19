import { createRoute } from '../../shared/route'
import { modelsController } from './controllers/models.controller'

export const modelsModule = {
  collection: createRoute('models', {
    GET: (req, res) => modelsController.loadModels(req, res),
  }),
}
