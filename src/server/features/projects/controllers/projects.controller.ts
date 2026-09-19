import type { NextApiRequest, NextApiResponse } from 'next'

import { sendSuccess } from '@/server/shared/response'
import { getQueryValue, parseDto } from '@/server/shared/route'
import { authService } from '@/server/shared/services/auth.service'
import {
  createProjectsKeysValidation,
  createProjectsValidation,
  updateProjectsCredentialsValidation,
} from '../dto/projects.dto'
import {
  projectsService,
  type ProjectsService,
} from '../services/projects.service'

export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  async loadProjectsList(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Daftar project berhasil dimuat',
      data: await this.projectsService.fetchProjectsList(),
    })
  }

  async saveProjects(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    const dto = parseDto(createProjectsValidation, req.body)

    return sendSuccess(res, {
      status: 201,
      message: 'Project berhasil dibuat',
      data: await this.projectsService.storeProjects(dto),
    })
  }

  async loadProjects(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Project berhasil dimuat',
      data: await this.projectsService.fetchProjects(
        getQueryValue(req.query.projectId)
      ),
    })
  }

  async loadProjectsKeysList(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Daftar API key berhasil dimuat',
      data: await this.projectsService.fetchProjectsKeysList(
        getQueryValue(req.query.projectId)
      ),
    })
  }

  async saveProjectsKeys(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    const dto = parseDto(createProjectsKeysValidation, req.body)

    return sendSuccess(res, {
      status: 201,
      message:
        'API key berhasil dibuat. Salin sekarang — token ini tidak bisa dilihat lagi.',
      data: await this.projectsService.storeProjectsKeys(
        getQueryValue(req.query.projectId),
        dto
      ),
    })
  }

  async loadProjectsCredentialsList(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Daftar kredensial provider berhasil dimuat',
      data: await this.projectsService.fetchProjectsCredentialsList(
        getQueryValue(req.query.projectId)
      ),
    })
  }

  async modifyProjectsCredentials(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    const dto = parseDto(updateProjectsCredentialsValidation, req.body)

    return sendSuccess(res, {
      message: 'Kredensial provider berhasil disimpan',
      data: await this.projectsService.changeProjectsCredentials(
        getQueryValue(req.query.projectId),
        dto
      ),
    })
  }
}

export const projectsController = new ProjectsController(projectsService)
