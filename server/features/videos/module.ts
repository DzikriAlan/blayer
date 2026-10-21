import { createRoute } from '../../shared/route'
import { videosController } from './controllers/videos.controller'

export const videosModule = {
  list: createRoute('videos.list', {
    GET: (req, res) => videosController.loadVideosList(req, res),
  }),
  search: createRoute('videos.search', {
    GET: (req, res) => videosController.loadVideosSearch(req, res),
  }),
  detail: createRoute('videos.detail', {
    GET: (req, res) => videosController.loadVideosDetail(req, res),
  }),
}
