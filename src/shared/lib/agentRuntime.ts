import {
  AgentEnvironment,
  AgentRunStatus,
  type AgentVersion,
} from '@prisma/client'

import { prisma } from './prisma'
import { getEffortLevel, getRunCostUsd } from './agentCatalog'
import { ENCRYPTION_KEY_ENV, decryptSecret } from './agentCrypto'
import { getProviderAdapter } from './providers'
import { ProviderError } from './providers/providerTypes'
import { getErrorFields, logger } from './logger'

export class RuntimeError extends Error {
  readonly code: string
  readonly status: number
  readonly field: string

  constructor(code: string, message: string, status: number, field = '') {
    super(message)
    this.name = 'RuntimeError'
    this.code = code
    this.status = status
    this.field = field
  }
}

export interface RunAgentInput {
  agentId: string
  environment: AgentEnvironment
  input: string
  versionId?: string | null
  // Diisi saat pemanggilnya memakai API key project; eksekusi lintas project
  // lalu ditolak seolah agentnya tidak ada.
  scopedProjectId?: string | null
}

export interface RunAgentResult {
  runId: string
  agentId: string
  version: number
  versionId: string
  environment: AgentEnvironment
  provider: string
  model: string
  output: string
  stopReason: string
  latencyMs: number
  inputTokens: number
  outputTokens: number
  costUsd: number | null
}

const getVersion = async (
  agentId: string,
  versionId: string | null | undefined,
  productionVersion: AgentVersion | null
) => {
  if (!versionId) return productionVersion

  return prisma.agentVersion.findFirst({ where: { id: versionId, agentId } })
}

export const runAgent = async ({
  agentId,
  environment,
  input,
  versionId,
  scopedProjectId,
}: RunAgentInput): Promise<RunAgentResult> => {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { productionVersion: true },
  })

  if (!agent || (scopedProjectId && agent.projectId !== scopedProjectId)) {
    throw new RuntimeError('AGENT_NOT_FOUND', 'Agent tidak ditemukan.', 404)
  }

  const version = await getVersion(agent.id, versionId, agent.productionVersion)

  if (!version) {
    throw new RuntimeError(
      'AGENT_NOT_PUBLISHED',
      'Agent ini belum punya versi yang dipublikasikan.',
      409
    )
  }

  const credential = await prisma.providerCredential.findUnique({
    where: {
      projectId_provider_environment: {
        projectId: agent.projectId,
        provider: version.provider,
        environment,
      },
    },
  })

  if (!credential) {
    throw new RuntimeError(
      'PROVIDER_KEY_MISSING',
      `Project ini belum punya kunci ${version.provider} untuk environment ${environment}.`,
      409,
      'provider'
    )
  }

  const secret = decryptSecret(credential.secret)

  if (!secret) {
    throw new RuntimeError(
      'CONFIG_MISSING',
      `Kunci provider tidak bisa dibuka. Pastikan ${ENCRYPTION_KEY_ENV} masih kunci yang sama dengan saat kredensialnya disimpan.`,
      503,
      ENCRYPTION_KEY_ENV
    )
  }

  const startedAt = Date.now()

  const getBaseRun = () => ({
    projectId: agent.projectId,
    agentId: agent.id,
    agentVersionId: version.id,
    environment,
    provider: version.provider,
    model: version.model,
    input,
  })

  try {
    const result = await getProviderAdapter(version.provider)({
      apiKey: secret,
      model: version.model,
      instructions: version.instructions,
      input,
      maxTokens: version.maxTokens,
      effort: getEffortLevel(version.effort),
      temperature: version.temperature,
    })

    const latencyMs = Date.now() - startedAt
    const costUsd = getRunCostUsd(
      version.model,
      result.inputTokens,
      result.outputTokens
    )

    const run = await prisma.agentRun.create({
      data: {
        ...getBaseRun(),
        status: AgentRunStatus.SUCCEEDED,
        output: result.text,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
        costUsd,
        latencyMs,
      },
      select: { id: true },
    })

    return {
      runId: run.id,
      agentId: agent.id,
      version: version.version,
      versionId: version.id,
      environment,
      provider: version.provider,
      model: version.model,
      output: result.text,
      stopReason: result.stopReason,
      latencyMs,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costUsd,
    }
  } catch (error) {
    const failure =
      error instanceof ProviderError
        ? error
        : new ProviderError('PROVIDER_FAILED', 'Eksekusi agent gagal.', 502)

    // Eksekusi yang gagal tetap tercatat. Tanpa itu, angka success rate di PRD
    // hanya menghitung yang berhasil dan selalu terlihat sempurna.
    await prisma.agentRun.create({
      data: {
        ...getBaseRun(),
        status: AgentRunStatus.FAILED,
        errorCode: failure.code,
        errorMessage: failure.message,
        latencyMs: Date.now() - startedAt,
      },
      select: { id: true },
    })

    logger.error('eksekusi agent gagal', {
      agentId: agent.id,
      versionId: version.id,
      provider: version.provider,
      model: version.model,
      ...getErrorFields(error),
    })

    throw new RuntimeError(failure.code, failure.message, failure.status)
  }
}
