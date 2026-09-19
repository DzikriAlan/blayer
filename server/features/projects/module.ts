import { createRoute } from '../../shared/route'
import { projectsController } from './controllers/projects.controller'

export const projectsModule = {
  collection: createRoute('projects', {
    GET: (req, res) => projectsController.loadProjectsList(req, res),
    POST: (req, res) => projectsController.saveProjects(req, res),
  }),

  detail: createRoute('projects-detail', {
    GET: (req, res) => projectsController.loadProjects(req, res),
  }),

  keys: createRoute('projects-keys', {
    GET: (req, res) => projectsController.loadProjectsKeysList(req, res),
    POST: (req, res) => projectsController.saveProjectsKeys(req, res),
  }),

  credentials: createRoute('projects-credentials', {
    GET: (req, res) => projectsController.loadProjectsCredentialsList(req, res),
    PUT: (req, res) => projectsController.modifyProjectsCredentials(req, res),
  }),
}
