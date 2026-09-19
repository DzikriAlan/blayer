import { createRoute } from '../../shared/route'
import { knowledgeController } from './controllers/knowledge.controller'

export const knowledgeModule = {
  byProject: createRoute('projects-knowledge', {
    GET: (req, res) => knowledgeController.loadKnowledgeList(req, res),
    POST: (req, res) => knowledgeController.saveKnowledge(req, res),
  }),

  detail: createRoute('knowledge-detail', {
    GET: (req, res) => knowledgeController.loadKnowledge(req, res),
    PUT: (req, res) => knowledgeController.modifyKnowledge(req, res),
    DELETE: (req, res) => knowledgeController.destroyKnowledge(req, res),
  }),
}
