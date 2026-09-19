import { createRoute } from '../../shared/route'
import { agentsController } from './controllers/agents.controller'

export const agentsModule = {
  collection: createRoute('agents', {
    GET: (req, res) => agentsController.loadAgentsList(req, res),
    POST: (req, res) => agentsController.saveAgents(req, res),
  }),

  detail: createRoute('agents-detail', {
    GET: (req, res) => agentsController.loadAgents(req, res),
    PUT: (req, res) => agentsController.modifyAgents(req, res),
    DELETE: (req, res) => agentsController.destroyAgents(req, res),
  }),

  versions: createRoute('agents-versions', {
    GET: (req, res) => agentsController.loadAgentsVersionsList(req, res),
    POST: (req, res) => agentsController.saveAgentsVersions(req, res),
  }),

  publish: createRoute('agents-publish', {
    POST: (req, res) => agentsController.saveAgentsPublish(req, res),
  }),

  run: createRoute('agents-run', {
    POST: (req, res) => agentsController.saveAgentsRun(req, res),
  }),

  runs: createRoute('agents-runs', {
    GET: (req, res) => agentsController.loadAgentsRunsList(req, res),
  }),

  sessions: createRoute('agents-sessions', {
    GET: (req, res) => agentsController.loadAgentsSessionsList(req, res),
    POST: (req, res) => agentsController.saveAgentsSessions(req, res),
  }),
}
