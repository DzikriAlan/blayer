import { createRoute } from '../../shared/route'
import { toolsController } from './controllers/tools.controller'

export const toolsModule = {
  detail: createRoute('tools-detail', {
    PUT: (req, res) => toolsController.modifyTools(req, res),
    DELETE: (req, res) => toolsController.destroyTools(req, res),
  }),
}
