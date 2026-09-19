import { z } from 'zod'
import { AgentEffort, AgentEnvironment, AgentProvider } from '@prisma/client'

import {
  DEFAULT_AGENT_MODEL,
  DEFAULT_MAX_TOKENS,
  MAX_MAX_TOKENS,
  MIN_MAX_TOKENS,
  isKnownModel,
} from '@/server/shared/utils/catalog.util'
import {
  descriptionValidation,
  nameValidation,
  optionalSlugValidation,
} from '@/server/features/projects/dto/projects.dto'

const configValidation = z.object({
  provider: z.nativeEnum(AgentProvider).default(AgentProvider.ANTHROPIC),
  model: z
    .string()
    .trim()
    .min(1, 'Model wajib diisi.')
    .max(80, 'Nama model maksimal 80 karakter.')
    .default(DEFAULT_AGENT_MODEL),
  effort: z.nativeEnum(AgentEffort).default(AgentEffort.HIGH),
  maxTokens: z
    .number()
    .int('Batas token harus bilangan bulat.')
    .min(MIN_MAX_TOKENS, `Batas token minimal ${MIN_MAX_TOKENS}.`)
    .max(MAX_MAX_TOKENS, `Batas token maksimal ${MAX_MAX_TOKENS}.`)
    .default(DEFAULT_MAX_TOKENS),
  temperature: z
    .number()
    .min(0, 'Temperature minimal 0.')
    .max(2, 'Temperature maksimal 2.')
    .nullable()
    .default(null),
  instructions: z
    .string()
    .trim()
    .min(10, 'Instruksi minimal 10 karakter.')
    .max(20_000, 'Instruksi maksimal 20.000 karakter.'),
  toolIds: z.array(z.string().trim().min(1)).max(40).optional().default([]),
  documentIds: z.array(z.string().trim().min(1)).max(20).optional().default([]),
})

// Model yang tidak dikenal katalog ditolak sejak di pintu masuk, supaya salah
// ketik id model tidak baru ketahuan saat agentnya dijalankan pengguna.
const withKnownModel = <T extends { provider: AgentProvider; model: string }>(
  schema: z.ZodType<T, z.ZodTypeDef, unknown>
) =>
  schema.superRefine((value, ctx) => {
    if (!isKnownModel(value.provider, value.model)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['model'],
        message: `Model ${value.model} tidak ada di katalog provider ${value.provider}.`,
      })
    }
  })

export const createAgentsValidation = withKnownModel(
  z
    .object({
      projectId: z.string().trim().min(1, 'Project wajib dipilih.'),
      name: nameValidation,
      slug: optionalSlugValidation,
      description: descriptionValidation,
    })
    .merge(configValidation)
)

export const updateAgentsValidation = z.object({
  name: nameValidation,
  slug: optionalSlugValidation,
  description: descriptionValidation,
})

export const createAgentsVersionsValidation = withKnownModel(configValidation)

export const createAgentsPublishValidation = z.object({
  versionId: z.string().trim().min(1, 'Versi wajib dipilih.'),
})

export const createAgentsRunValidation = z.object({
  input: z
    .string()
    .trim()
    .min(1, 'Masukan wajib diisi.')
    .max(20_000, 'Masukan maksimal 20.000 karakter.'),
  versionId: z.string().trim().min(1).optional(),
  environment: z.nativeEnum(AgentEnvironment).optional(),
  sessionId: z.string().trim().min(1).optional(),
})

export const createAgentsSessionsValidation = z.object({
  environment: z.nativeEnum(AgentEnvironment).optional(),
})

export type CreateAgentsDto = z.infer<typeof createAgentsValidation>
export type UpdateAgentsDto = z.infer<typeof updateAgentsValidation>
export type CreateAgentsVersionsDto = z.infer<
  typeof createAgentsVersionsValidation
>
export type CreateAgentsPublishDto = z.infer<typeof createAgentsPublishValidation>
export type CreateAgentsRunDto = z.infer<typeof createAgentsRunValidation>
export type CreateAgentsSessionsDto = z.infer<
  typeof createAgentsSessionsValidation
>

export interface AgentsResponseDto {
  id: string
  slug: string
  name: string
  description: string
  projectId: string
  projectName: string
  isPublished: boolean
  totalVersions: number
  totalRuns: number
  createdAt: string
}

export interface AgentsVersionsResponseDto {
  id: string
  version: number
  status: string
  instructions: string
  provider: AgentProvider
  model: string
  effort: AgentEffort
  maxTokens: number
  temperature: number | null
  toolIds: string[]
  documentIds: string[]
  isProduction: boolean
  publishedAt: string
  createdAt: string
}
