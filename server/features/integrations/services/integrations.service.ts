import { IntegrationAuth, type Prisma } from '@prisma/client'

import {
  badRequestError,
  conflictError,
  notFoundError,
  serviceUnavailableError,
} from '../../../shared/http-error'
import {
  ENCRYPTION_KEY_ENV,
  encryptSecret,
  getSecretHint,
} from '../../../shared/utils/crypto.util'
import { getFreeSlug, getSlugCandidates } from '../../../shared/utils/slug.util'
import type {
  CreateIntegrationsDto,
  CreateIntegrationsToolsDto,
  IntegrationsResponseDto,
  IntegrationsToolsResponseDto,
  UpdateIntegrationsDto,
} from '../dto/integrations.dto'
import {
  integrationsRepository,
  type IntegrationsRepository,
} from '../repositories/integrations.repository'

interface ToolRecord {
  id: string
  integrationId: string
  name: string
  description: string
  method: IntegrationsToolsResponseDto['method']
  path: string
  permission: IntegrationsToolsResponseDto['permission']
  inputSchema: unknown
  createdAt: Date
}

export class IntegrationsService {
  constructor(private readonly integrationsRepository: IntegrationsRepository) {}

  async fetchIntegrationsList(
    projectId: string
  ): Promise<IntegrationsResponseDto[]> {
    const integrations =
      await this.integrationsRepository.getIntegrationsMany(projectId)

    return integrations.map((integration) => ({
      id: integration.id,
      projectId: integration.projectId,
      slug: integration.slug,
      name: integration.name,
      description: integration.description ?? '',
      baseUrl: integration.baseUrl,
      auth: integration.auth,
      authHeader: integration.authHeader ?? '',
      hint: integration.hint ?? '',
      totalTools: integration._count.tools,
      createdAt: integration.createdAt.toISOString(),
      tools: integration.tools.map((tool) => this.getToolResponse(tool)),
    }))
  }

  async fetchIntegrations(id: string): Promise<IntegrationsResponseDto> {
    const integration = await this.fetchIntegrationsRecord(id)

    return {
      id: integration.id,
      projectId: integration.projectId,
      slug: integration.slug,
      name: integration.name,
      description: integration.description ?? '',
      baseUrl: integration.baseUrl,
      auth: integration.auth,
      authHeader: integration.authHeader ?? '',
      hint: integration.hint ?? '',
      totalTools: integration._count.tools,
      createdAt: integration.createdAt.toISOString(),
      tools: integration.tools.map((tool) => this.getToolResponse(tool)),
    }
  }

  // Kredensial ke API project disimpan terenkripsi seperti kunci provider —
  // Blayer memegang aksesnya, bukan datanya.
  async storeIntegrations(projectId: string, dto: CreateIntegrationsDto) {
    if (dto.auth !== IntegrationAuth.NONE && !dto.secret) {
      throw badRequestError(
        'Integration dengan autentikasi wajib membawa kredensialnya.',
        'INVALID_INPUT'
      )
    }

    const candidates = dto.slug ? [dto.slug] : getSlugCandidates(dto.name)

    const slug = await getFreeSlug(candidates, async (candidate) =>
      !!(await this.integrationsRepository.getIntegrationsBySlug(
        projectId,
        candidate
      ))
    )

    if (!slug) {
      throw conflictError(
        'SLUG_TAKEN',
        `Slug ${candidates[0]} sudah dipakai integration lain di project ini.`
      )
    }

    const secret = dto.secret ? this.getEncryptedSecret(dto.secret) : null

    return this.integrationsRepository.postIntegrations({
      projectId,
      slug,
      name: dto.name,
      description: dto.description || null,
      baseUrl: dto.baseUrl.replace(/\/+$/, ''),
      auth: dto.auth,
      authHeader: dto.authHeader || null,
      secret,
      hint: dto.secret ? getSecretHint(dto.secret) : null,
    })
  }

  async changeIntegrations(id: string, dto: UpdateIntegrationsDto) {
    const integration = await this.fetchIntegrationsRecord(id)
    const slug = dto.slug ?? integration.slug

    if (integration.slug !== slug) {
      const taken = await this.integrationsRepository.getIntegrationsBySlug(
        integration.projectId,
        slug
      )

      if (taken) {
        throw conflictError(
          'SLUG_TAKEN',
          `Slug ${slug} sudah dipakai integration lain.`
        )
      }
    }

    // Kredensial hanya diganti kalau memang diisi ulang; membiarkannya kosong
    // berarti kunci lama tetap dipakai, bukan terhapus diam-diam.
    const data: Prisma.IntegrationUncheckedUpdateInput = {
      slug,
      name: dto.name,
      description: dto.description || null,
      baseUrl: dto.baseUrl.replace(/\/+$/, ''),
      auth: dto.auth,
      authHeader: dto.authHeader || null,
    }

    if (dto.auth === IntegrationAuth.NONE) {
      data.secret = null
      data.hint = null
    } else if (dto.secret) {
      data.secret = this.getEncryptedSecret(dto.secret)
      data.hint = getSecretHint(dto.secret)
    }

    return this.integrationsRepository.updateIntegrations(id, data)
  }

  async removeIntegrations(id: string) {
    await this.fetchIntegrationsRecord(id)

    return this.integrationsRepository.deleteIntegrations(id)
  }

  async fetchIntegrationsToolsList(
    integrationId: string
  ): Promise<IntegrationsToolsResponseDto[]> {
    await this.fetchIntegrationsRecord(integrationId)

    const tools =
      await this.integrationsRepository.getIntegrationsToolsMany(integrationId)

    return tools.map((tool) => this.getToolResponse(tool))
  }

  // Yang tersimpan hanya kontraknya: nama, deskripsi, method, potongan path,
  // dan skema masukan. Implementasinya tetap di sisi project.
  async storeIntegrationsTools(
    integrationId: string,
    dto: CreateIntegrationsToolsDto
  ) {
    await this.fetchIntegrationsRecord(integrationId)

    const taken = await this.integrationsRepository.getIntegrationsToolsByName(
      integrationId,
      dto.name
    )

    if (taken) {
      throw conflictError(
        'NAME_TAKEN',
        `Tool bernama ${dto.name} sudah ada di integration ini.`
      )
    }

    return this.integrationsRepository.postIntegrationsTools({
      integrationId,
      name: dto.name,
      description: dto.description,
      method: dto.method,
      path: dto.path,
      permission: dto.permission,
      inputSchema: dto.inputSchema as Prisma.InputJsonValue,
    })
  }

  private async fetchIntegrationsRecord(id: string) {
    const integration = await this.integrationsRepository.getIntegrationsById(id)

    if (!integration) {
      throw notFoundError(
        'INTEGRATION_NOT_FOUND',
        'Integration dengan id itu tidak ada.'
      )
    }

    return integration
  }

  private getEncryptedSecret(secret: string) {
    const encrypted = encryptSecret(secret)

    if (!encrypted) {
      throw serviceUnavailableError(
        'CONFIG_MISSING',
        `Setel ${ENCRYPTION_KEY_ENV} berisi 32 byte acak dalam base64.`
      )
    }

    return encrypted
  }

  private getToolResponse(tool: ToolRecord): IntegrationsToolsResponseDto {
    return {
      id: tool.id,
      integrationId: tool.integrationId,
      name: tool.name,
      description: tool.description,
      method: tool.method,
      path: tool.path,
      permission: tool.permission,
      inputSchema: tool.inputSchema,
      createdAt: tool.createdAt.toISOString(),
    }
  }
}

export const integrationsService = new IntegrationsService(integrationsRepository)
