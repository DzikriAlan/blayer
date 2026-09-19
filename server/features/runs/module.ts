import { createRoute } from '../../shared/route'
import { runsController } from './controllers/runs.controller'

export const runsModule = {
  confirm: createRoute('runs-confirm', {
    POST: (req, res) => runsController.saveRunsConfirm(req, res),
  }),
}
