import { createRoute } from '../../shared/route'
import { integrationsController } from './controllers/integrations.controller'

export const integrationsModule = {
  // Dipasang di bawah /projects/{projectId}/integrations; boundary feature-nya
  // tetap milik integrations.
  byProject: createRoute('projects-integrations', {
    GET: (req, res) => integrationsController.loadIntegrationsList(req, res),
    POST: (req, res) => integrationsController.saveIntegrations(req, res),
  }),

  detail: createRoute('integrations-detail', {
    GET: (req, res) => integrationsController.loadIntegrations(req, res),
    PUT: (req, res) => integrationsController.modifyIntegrations(req, res),
    DELETE: (req, res) => integrationsController.destroyIntegrations(req, res),
  }),

  tools: createRoute('integrations-tools', {
    GET: (req, res) => integrationsController.loadIntegrationsToolsList(req, res),
    POST: (req, res) => integrationsController.saveIntegrationsTools(req, res),
  }),
}
