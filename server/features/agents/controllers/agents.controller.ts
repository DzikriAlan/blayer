import type { NextApiRequest, NextApiResponse } from 'next'
import { AgentEnvironment } from '@prisma/client'

import { forbiddenError, notFoundError } from '../../../shared/http-error'
import { getPagination, sendSuccess } from '../../../shared/response'
import { getQueryNumber, getQueryValue, parseDto } from '../../../shared/route'
import { authService } from '../../../shared/services/auth.service'
import { enforceRateLimit } from '../../../shared/services/rateLimit.service'
import {
  createAgentsPreviewValidation,
  createAgentsPublishValidation,
  createAgentsRunValidation,
  createAgentsSessionsValidation,
  createAgentsValidation,
  createAgentsVersionsValidation,
  updateAgentsValidation,
} from '../dto/agents.dto'
import { agentsService, type AgentsService } from '../services/agents.service'

export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  async loadAgentsList(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Daftar agent berhasil dimuat',
      data: await this.agentsService.fetchAgentsList(
        getQueryValue(req.query.projectId)
      ),
    })
  }

  async saveAgents(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    const dto = parseDto(createAgentsValidation, req.body)

    return sendSuccess(res, {
      status: 201,
      message: 'Agent berhasil dibuat',
      data: await this.agentsService.storeAgents(dto),
    })
  }

  async loadAgents(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Agent berhasil dimuat',
      data: await this.agentsService.fetchAgents(getQueryValue(req.query.agentId)),
    })
  }

  async modifyAgents(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    const dto = parseDto(updateAgentsValidation, req.body)

    return sendSuccess(res, {
      message: 'Agent berhasil diperbarui',
      data: await this.agentsService.changeAgents(
        getQueryValue(req.query.agentId),
        dto
      ),
    })
  }

  async destroyAgents(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Agent berhasil dihapus',
      data: await this.agentsService.removeAgents(
        getQueryValue(req.query.agentId)
      ),
    })
  }

  async loadAgentsVersionsList(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    return sendSuccess(res, {
      message: 'Daftar versi berhasil dimuat',
      data: await this.agentsService.fetchAgentsVersionsList(
        getQueryValue(req.query.agentId)
      ),
    })
  }

  async saveAgentsVersions(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    const dto = parseDto(createAgentsVersionsValidation, req.body)
    const version = await this.agentsService.storeAgentsVersions(
      getQueryValue(req.query.agentId),
      dto
    )

    return sendSuccess(res, {
      status: 201,
      message: `Draf versi ${version.version} berhasil dibuat`,
      data: version,
    })
  }

  async saveAgentsPublish(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    const dto = parseDto(createAgentsPublishValidation, req.body)
    const published = await this.agentsService.storeAgentsPublish(
      getQueryValue(req.query.agentId),
      dto
    )

    return sendSuccess(res, {
      message: `Versi ${published.version} sekarang melayani production`,
      data: published,
    })
  }

  async loadAgentsRunsList(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    const page = getQueryNumber(req.query.page, 1, { max: 10_000 })
    const limit = getQueryNumber(req.query.limit, 20)

    const result = await this.agentsService.fetchAgentsRunsList(
      getQueryValue(req.query.agentId),
      page,
      limit
    )

    return sendSuccess(res, {
      message: 'Riwayat eksekusi berhasil dimuat',
      data: result.data,
      pagination: getPagination(page, limit, result.total),
    })
  }

  async saveAgentsRun(req: NextApiRequest, res: NextApiResponse) {
    const actor = await authService.fetchAuthActor(req)

    await enforceRateLimit(req, {
      name: 'agents-run',
      limit: 60,
      windowMs: 60_000,
      scope: actor.kind === 'project' ? actor.projectId : 'admin',
    })

    const dto = parseDto(createAgentsRunValidation, req.body)

    // Project consumer selalu dilayani versi production di environment
    // kuncinya. Menunjuk versi tertentu adalah kewenangan Playground.
    if (actor.kind === 'project' && dto.versionId) {
      throw forbiddenError(
        'VERSION_NOT_ALLOWED',
        'Kunci project selalu menjalankan versi yang sedang production.'
      )
    }

    return sendSuccess(res, {
      message: 'Agent berhasil dijalankan',
      data: await this.agentsService.storeAgentsRun(
        getQueryValue(req.query.agentId),
        dto,
        {
          environment:
            actor.kind === 'project'
              ? actor.environment
              : (dto.environment ?? AgentEnvironment.DEVELOPMENT),
          scopedProjectId: actor.kind === 'project' ? actor.projectId : null,
          versionId: actor.kind === 'admin' ? (dto.versionId ?? null) : null,
        }
      ),
    })
  }

  async saveAgentsPreview(req: NextApiRequest, res: NextApiResponse) {
    authService.fetchAuthAdmin(req)

    // Pratinjau memanggil provider sungguhan dan ikut menghabiskan token, jadi
    // batasnya lebih rapat daripada eksekusi biasa.
    await enforceRateLimit(req, {
      name: 'agents-preview',
      limit: 30,
      windowMs: 60_000,
      scope: 'admin',
    })

    const dto = parseDto(createAgentsPreviewValidation, req.body)

    return sendSuccess(res, {
      message: 'Pratinjau agent berhasil dijalankan',
      data: await this.agentsService.storeAgentsPreview(dto),
    })
  }

  async loadAgentsSessionsList(req: NextApiRequest, res: NextApiResponse) {
    const agentId = getQueryValue(req.query.agentId)
    await this.fetchAgentsScope(req, agentId)

    return sendSuccess(res, {
      message: 'Daftar sesi berhasil dimuat',
      data: await this.agentsService.fetchAgentsSessionsList(
        agentId,
        getQueryNumber(req.query.limit, 20)
      ),
    })
  }

  async saveAgentsSessions(req: NextApiRequest, res: NextApiResponse) {
    const agentId = getQueryValue(req.query.agentId)
    const scope = await this.fetchAgentsScope(req, agentId)
    const dto = parseDto(createAgentsSessionsValidation, req.body)

    // Environment sesi mengikuti kunci pemanggil supaya ingatan development
    // tidak tercampur dengan production.
    const environment =
      scope.actor.kind === 'project'
        ? scope.actor.environment
        : (dto.environment ?? AgentEnvironment.DEVELOPMENT)

    return sendSuccess(res, {
      status: 201,
      message: 'Sesi percakapan berhasil dibuat',
      data: await this.agentsService.storeAgentsSessions(
        agentId,
        scope.projectId,
        environment
      ),
    })
  }

  private async fetchAgentsScope(req: NextApiRequest, agentId: string) {
    const actor = await authService.fetchAuthActor(req)
    const agent = await this.agentsService.fetchAgentsOwner(agentId)

    if (actor.kind === 'project' && agent.projectId !== actor.projectId) {
      throw notFoundError('AGENT_NOT_FOUND', 'Agent dengan id itu tidak ada.')
    }

    return { actor, projectId: agent.projectId }
  }
}

export const agentsController = new AgentsController(agentsService)
