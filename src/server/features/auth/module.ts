import { createRoute } from '@/server/shared/route'
import { authController } from './controllers/auth.controller'

// Composition root feature: merangkai controller ke rute HTTP-nya, tanpa
// business logic apa pun di sini.
export const authModule = {
  login: createRoute('auth-login', {
    POST: (req, res) => authController.saveAuthLogin(req, res),
  }),
}
