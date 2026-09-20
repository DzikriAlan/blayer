import { AgentVersionStatus, type AgentEnvironment } from '@prisma/client'

import { conflictError, notFoundError } from '../../../shared/http-error'
import { getFreeSlug, getSlugCandidates } from '../../../shared/utils/slug.util'
import {
  agentRuntimeService,
  type AgentRuntimeService,
} from '../../../shared/services/agentRuntime.service'
import type {
  AgentsResponseDto,
  AgentsVersionsResponseDto,
  CreateAgentsDto,
  CreateAgentsPublishDto,
  CreateAgentsPreviewDto,
  CreateAgentsRunDto,
  CreateAgentsVersionsDto,
  UpdateAgentsDto,
} from '../dto/agents.dto'
import {
  agentsRepository,
  type AgentsRepository,
} from '../repositories/agents.repository'

interface VersionRecord {
  id: string
  version: number
  status: string
  instructions: string
  provider: AgentsVersionsResponseDto['provider']
  model: string
  effort: AgentsVersionsResponseDto['effort']
  maxTokens: number
  temperature: number | null
  publishedAt: Date | null
  createdAt: Date
  tools: { toolDefinitionId: string }[]
  documents: { documentId: string }[]
}

export class AgentsService {
  constructor(
    private readonly agentsRepository: AgentsRepository,
    private readonly agentRuntimeService: AgentRuntimeService
  ) {}

  async fetchAgentsList(projectId: string): Promise<AgentsResponseDto[]> {
    const agents = await this.agentsRepository.getAgentsMany(projectId)

    return agents.map((agent) => ({
      id: agent.id,
      slug: agent.slug,
      name: agent.name,
      description: agent.description ?? '',
      projectId: agent.projectId,
      projectName: agent.project.name,
      isPublished: !!agent.productionVersionId,
      totalVersions: agent._count.versions,
      totalRuns: agent._count.runs,
      createdAt: agent.createdAt.toISOString(),
    }))
  }

  async fetchAgents(id: string) {
    const agent = await this.fetchAgentsRecord(id)

    return {
      id: agent.id,
      slug: agent.slug,
      name: agent.name,
      description: agent.description ?? '',
      projectId: agent.projectId,
      projectName: agent.project.name,
      productionVersionId: agent.productionVersionId ?? '',
      createdAt: agent.createdAt.toISOString(),
      versions: agent.versions.map((version) =>
        this.getVersionResponse(version, agent.productionVersionId)
      ),
    }
  }

  // Agent lahir bersama draf pertamanya, jadi tidak pernah ada agent tanpa
  // konfigurasi yang bisa dibuka di builder.
  async storeAgents(dto: CreateAgentsDto) {
    const slug = await this.fetchFreeSlug(dto.projectId, dto.name, dto.slug)

    return this.agentsRepository.postAgents({
      projectId: dto.projectId,
      slug,
      name: dto.name,
      description: dto.description || null,
      versions: {
        create: {
          version: 1,
          status: AgentVersionStatus.DRAFT,
          instructions: dto.instructions,
          provider: dto.provider,
          model: dto.model,
          effort: dto.effort,
          maxTokens: dto.maxTokens,
          temperature: dto.temperature,
          tools: {
            create: dto.toolIds.map((toolDefinitionId) => ({ toolDefinitionId })),
          },
          documents: {
            create: dto.documentIds.map((documentId) => ({ documentId })),
          },
        },
      },
    })
  }

  async changeAgents(id: string, dto: UpdateAgentsDto) {
    const agent = await this.fetchAgentsRecord(id)
    const slug = dto.slug ?? agent.slug

    if (agent.slug !== slug) {
      const taken = await this.agentsRepository.getAgentsBySlug(
        agent.projectId,
        slug
      )

      if (taken) {
        throw conflictError(
          'SLUG_TAKEN',
          `Slug ${slug} sudah dipakai agent lain di project ini.`
        )
      }
    }

    return this.agentsRepository.updateAgents(id, {
      name: dto.name,
      slug,
      description: dto.description || null,
    })
  }

  async removeAgents(id: string) {
    await this.fetchAgentsRecord(id)

    return this.agentsRepository.deleteAgents(id)
  }

  async fetchAgentsVersionsList(
    agentId: string
  ): Promise<AgentsVersionsResponseDto[]> {
    const agent = await this.fetchAgentsRecord(agentId)
    const versions = await this.agentsRepository.getAgentsVersionsMany(agentId)

    return versions.map((version) =>
      this.getVersionResponse(version, agent.productionVersionId)
    )
  }

  // Perubahan konfigurasi selalu lahir sebagai draf baru. Versi yang sedang
  // melayani production tidak pernah ikut berubah.
  async storeAgentsVersions(agentId: string, dto: CreateAgentsVersionsDto) {
    await this.fetchAgentsRecord(agentId)

    const last = await this.agentsRepository.getAgentsVersionsLast(agentId)

    return this.agentsRepository.postAgentsVersions({
      agentId,
      version: (last?.version ?? 0) + 1,
      status: AgentVersionStatus.DRAFT,
      instructions: dto.instructions,
      provider: dto.provider,
      model: dto.model,
      effort: dto.effort,
      maxTokens: dto.maxTokens,
      temperature: dto.temperature,
      tools: {
        create: dto.toolIds.map((toolDefinitionId) => ({ toolDefinitionId })),
      },
      documents: {
        create: dto.documentIds.map((documentId) => ({ documentId })),
      },
    })
  }

  async storeAgentsPublish(agentId: string, dto: CreateAgentsPublishDto) {
    const version = await this.agentsRepository.getAgentsVersionsById(
      agentId,
      dto.versionId
    )

    if (!version) {
      throw notFoundError('VERSION_NOT_FOUND', 'Versi itu bukan milik agent ini.')
    }

    await this.agentsRepository.updateAgentsPublish(agentId, version.id)

    return { agentId, versionId: version.id, version: version.version }
  }

  async fetchAgentsRunsList(agentId: string, page: number, limit: number) {
    await this.fetchAgentsRecord(agentId)

    const [runs, { summary, failed }] = await Promise.all([
      this.agentsRepository.getAgentsRunsMany(agentId, (page - 1) * limit, limit),
      this.agentsRepository.getAgentsRunsSummary(agentId),
    ])

    const totalRuns = summary._count._all

    return {
      total: totalRuns,
      data: {
        summary: {
          totalRuns,
          // Success rate dihitung dari eksekusi yang gagal ikut tercatat, bukan
          // hanya dari yang berhasil.
          successRate:
            totalRuns > 0
              ? Math.round(((totalRuns - failed) / totalRuns) * 1000) / 10
              : 0,
          avgLatencyMs: Math.round(summary._avg.latencyMs ?? 0),
          totalInputTokens: summary._sum.inputTokens ?? 0,
          totalOutputTokens: summary._sum.outputTokens ?? 0,
          totalCostUsd: summary._sum.costUsd ?? 0,
        },
        runs: runs.map((run) => ({
          id: run.id,
          version: run.agentVersion.version,
          environment: run.environment,
          status: run.status,
          provider: run.provider,
          model: run.model,
          input: run.input,
          output: run.output ?? '',
          errorCode: run.errorCode ?? '',
          errorMessage: run.errorMessage ?? '',
          inputTokens: run.inputTokens,
          outputTokens: run.outputTokens,
          costUsd: run.costUsd,
          latencyMs: run.latencyMs,
          totalToolCalls: run.toolCalls.length,
          createdAt: run.createdAt.toISOString(),
        })),
      },
    }
  }

  async fetchAgentsSessionsList(agentId: string, limit: number) {
    const sessions = await this.agentsRepository.getAgentsSessionsMany(
      agentId,
      limit
    )

    return sessions.map((session) => ({
      id: session.id,
      environment: session.environment,
      totalMessages: session._count.messages,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    }))
  }

  async storeAgentsSessions(
    agentId: string,
    projectId: string,
    environment: AgentEnvironment
  ) {
    const session = await this.agentsRepository.postAgentsSessions({
      projectId,
      agentId,
      environment,
    })

    return { ...session, createdAt: session.createdAt.toISOString() }
  }

  async storeAgentsRun(
    agentId: string,
    dto: CreateAgentsRunDto,
    scope: { environment: AgentEnvironment; scopedProjectId: string | null; versionId: string | null }
  ) {
    return this.agentRuntimeService.storeAgentsRun({
      agentId,
      environment: scope.environment,
      input: dto.input,
      sessionId: dto.sessionId ?? null,
      versionId: scope.versionId,
      scopedProjectId: scope.scopedProjectId,
    })
  }

  async storeAgentsPreview(dto: CreateAgentsPreviewDto) {
    return this.agentRuntimeService.storeAgentsPreview({
      projectId: dto.projectId,
      environment: dto.environment,
      provider: dto.provider,
      model: dto.model,
      effort: dto.effort,
      maxTokens: dto.maxTokens,
      temperature: dto.temperature,
      instructions: dto.instructions,
      toolIds: dto.toolIds,
      documentIds: dto.documentIds,
      messages: dto.messages,
    })
  }

  // Dipakai controller untuk memastikan agent memang milik project pemanggil.
  async fetchAgentsOwner(agentId: string) {
    const agent = await this.fetchAgentsRecord(agentId)

    return { id: agent.id, projectId: agent.projectId }
  }

  private async fetchAgentsRecord(id: string) {
    const agent = await this.agentsRepository.getAgentsById(id)

    if (!agent) {
      throw notFoundError('AGENT_NOT_FOUND', 'Agent dengan id itu tidak ada.')
    }

    return agent
  }

  private async fetchFreeSlug(projectId: string, name: string, slug?: string) {
    const candidates = slug ? [slug] : getSlugCandidates(name)

    const free = await getFreeSlug(candidates, async (candidate) =>
      !!(await this.agentsRepository.getAgentsBySlug(projectId, candidate))
    )

    if (!free) {
      throw conflictError(
        'SLUG_TAKEN',
        `Slug ${candidates[0]} sudah dipakai agent lain di project ini.`
      )
    }

    return free
  }

  private getVersionResponse(
    version: VersionRecord,
    productionVersionId: string | null
  ): AgentsVersionsResponseDto {
    return {
      id: version.id,
      version: version.version,
      status: version.status,
      instructions: version.instructions,
      provider: version.provider,
      model: version.model,
      effort: version.effort,
      maxTokens: version.maxTokens,
      temperature: version.temperature,
      toolIds: version.tools.map((item) => item.toolDefinitionId),
      documentIds: version.documents.map((item) => item.documentId),
      isProduction: version.id === productionVersionId,
      publishedAt: version.publishedAt?.toISOString() ?? '',
      createdAt: version.createdAt.toISOString(),
    }
  }
}

export const agentsService = new AgentsService(
  agentsRepository,
  agentRuntimeService
)
