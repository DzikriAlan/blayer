import {
  conflictError,
  notFoundError,
  serviceUnavailableError,
} from '../../../shared/http-error'
import {
  ENCRYPTION_KEY_ENV,
  createApiKeyToken,
  encryptSecret,
  getSecretHint,
} from '../../../shared/utils/crypto.util'
import { getFreeSlug, getSlugCandidates } from '../../../shared/utils/slug.util'
import type {
  CreateProjectsDto,
  CreateProjectsKeysDto,
  ProjectsCredentialsResponseDto,
  ProjectsKeysResponseDto,
  ProjectsResponseDto,
  UpdateProjectsCredentialsDto,
} from '../dto/projects.dto'
import {
  projectsRepository,
  type ProjectsRepository,
} from '../repositories/projects.repository'

export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async fetchProjectsList(): Promise<ProjectsResponseDto[]> {
    const projects = await this.projectsRepository.getProjectsMany()

    return projects.map((project) => ({
      id: project.id,
      slug: project.slug,
      name: project.name,
      description: project.description ?? '',
      totalAgents: project._count.agents,
      totalApiKeys: project._count.apiKeys,
      createdAt: project.createdAt.toISOString(),
    }))
  }

  async fetchProjects(id: string) {
    const project = await this.projectsRepository.getProjectsById(id)

    if (!project) {
      throw notFoundError('PROJECT_NOT_FOUND', 'Project dengan id itu tidak ada.')
    }

    return {
      id: project.id,
      slug: project.slug,
      name: project.name,
      description: project.description ?? '',
      createdAt: project.createdAt.toISOString(),
      agents: project.agents.map((agent) => ({
        id: agent.id,
        slug: agent.slug,
        name: agent.name,
        description: agent.description ?? '',
        isPublished: !!agent.productionVersionId,
        totalVersions: agent._count.versions,
        totalRuns: agent._count.runs,
        createdAt: agent.createdAt.toISOString(),
      })),
      apiKeys: project.apiKeys.map((apiKey) => this.getKeyResponse(apiKey)),
      providerKeys: project.providerKeys.map((credential) =>
        this.getCredentialResponse(credential)
      ),
    }
  }

  async storeProjects(dto: CreateProjectsDto) {
    const candidates = dto.slug ? [dto.slug] : getSlugCandidates(dto.name)

    const slug = await getFreeSlug(candidates, async (candidate) =>
      !!(await this.projectsRepository.getProjectsBySlug(candidate))
    )

    if (!slug) {
      throw conflictError(
        'SLUG_TAKEN',
        `Slug ${candidates[0]} sudah dipakai project lain.`
      )
    }

    return this.projectsRepository.postProjects({
      slug,
      name: dto.name,
      description: dto.description || null,
    })
  }

  async fetchProjectsKeysList(
    projectId: string
  ): Promise<ProjectsKeysResponseDto[]> {
    await this.fetchProjectsExists(projectId)

    const apiKeys = await this.projectsRepository.getProjectsKeysMany(projectId)

    return apiKeys.map((apiKey) => this.getKeyResponse(apiKey))
  }

  // Token utuh hanya dikembalikan sekali di sini; yang tersimpan cuma hash dan
  // prefiksnya.
  async storeProjectsKeys(projectId: string, dto: CreateProjectsKeysDto) {
    await this.fetchProjectsExists(projectId)

    const created = createApiKeyToken()

    const apiKey = await this.projectsRepository.postProjectsKeys({
      projectId,
      name: dto.name,
      environment: dto.environment,
      prefix: created.prefix,
      hash: created.hash,
    })

    return { ...apiKey, token: created.token }
  }

  async fetchProjectsCredentialsList(
    projectId: string
  ): Promise<ProjectsCredentialsResponseDto[]> {
    await this.fetchProjectsExists(projectId)

    const credentials =
      await this.projectsRepository.getProjectsCredentialsMany(projectId)

    return credentials.map((credential) => this.getCredentialResponse(credential))
  }

  async changeProjectsCredentials(
    projectId: string,
    dto: UpdateProjectsCredentialsDto
  ) {
    await this.fetchProjectsExists(projectId)

    const secret = encryptSecret(dto.secret)

    if (!secret) {
      throw serviceUnavailableError(
        'CONFIG_MISSING',
        `Setel ${ENCRYPTION_KEY_ENV} berisi 32 byte acak dalam base64.`
      )
    }

    return this.projectsRepository.updateProjectsCredentials({
      projectId,
      provider: dto.provider,
      environment: dto.environment,
      secret,
      hint: getSecretHint(dto.secret),
    })
  }

  private async fetchProjectsExists(projectId: string) {
    const project = await this.projectsRepository.getProjectsById(projectId)

    if (!project) {
      throw notFoundError('PROJECT_NOT_FOUND', 'Project dengan id itu tidak ada.')
    }

    return project
  }

  private getKeyResponse(apiKey: {
    id: string
    name: string
    environment: ProjectsKeysResponseDto['environment']
    prefix: string
    lastUsedAt: Date | null
    revokedAt: Date | null
    createdAt: Date
  }): ProjectsKeysResponseDto {
    return {
      id: apiKey.id,
      name: apiKey.name,
      environment: apiKey.environment,
      prefix: apiKey.prefix,
      lastUsedAt: apiKey.lastUsedAt?.toISOString() ?? '',
      isRevoked: !!apiKey.revokedAt,
      createdAt: apiKey.createdAt.toISOString(),
    }
  }

  private getCredentialResponse(credential: {
    id: string
    provider: ProjectsCredentialsResponseDto['provider']
    environment: ProjectsCredentialsResponseDto['environment']
    hint: string | null
    updatedAt: Date
  }): ProjectsCredentialsResponseDto {
    return {
      id: credential.id,
      provider: credential.provider,
      environment: credential.environment,
      hint: credential.hint ?? '',
      updatedAt: credential.updatedAt.toISOString(),
    }
  }
}

export const projectsService = new ProjectsService(projectsRepository)
