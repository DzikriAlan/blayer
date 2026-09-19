import { z } from 'zod'
import { AgentEffort, AgentEnvironment, AgentProvider } from '@prisma/client'

import {
  DEFAULT_AGENT_MODEL,
  DEFAULT_MAX_TOKENS,
  MAX_MAX_TOKENS,
  MIN_MAX_TOKENS,
  isKnownModel,
} from './agentCatalog'
import type { ApiError } from './apiResponse'

const slugSchema = z
  .string()
  .trim()
  .min(3, 'Slug minimal 3 karakter.')
  .max(48, 'Slug maksimal 48 karakter.')
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    'Slug hanya boleh huruf kecil, angka, dan tanda hubung.'
  )

const nameSchema = z
  .string()
  .trim()
  .min(3, 'Nama minimal 3 karakter.')
  .max(80, 'Nama maksimal 80 karakter.')

const descriptionSchema = z
  .string()
  .trim()
  .max(500, 'Deskripsi maksimal 500 karakter.')
  .optional()
  .default('')

export const projectInputSchema = z.object({
  name: nameSchema,
  slug: slugSchema,
  description: descriptionSchema,
})

export const loginInputSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Username wajib diisi.')
    .max(80, 'Username maksimal 80 karakter.'),
  password: z
    .string()
    .min(1, 'Kata sandi wajib diisi.')
    .max(200, 'Kata sandi maksimal 200 karakter.'),
})

export const apiKeyInputSchema = z.object({
  name: nameSchema,
  environment: z.nativeEnum(AgentEnvironment).default(AgentEnvironment.DEVELOPMENT),
})

export const credentialInputSchema = z.object({
  provider: z.nativeEnum(AgentProvider),
  environment: z.nativeEnum(AgentEnvironment),
  secret: z
    .string()
    .trim()
    .min(8, 'Kunci provider minimal 8 karakter.')
    .max(500, 'Kunci provider maksimal 500 karakter.'),
})

const modelConfigBaseSchema = z.object({
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

const agentBaseSchema = z.object({
  projectId: z.string().trim().min(1, 'Project wajib dipilih.'),
  name: nameSchema,
  slug: slugSchema,
  description: descriptionSchema,
})

export const agentInputSchema = withKnownModel(
  agentBaseSchema.merge(modelConfigBaseSchema)
)

export const agentUpdateInputSchema = agentBaseSchema.omit({ projectId: true })

export const agentVersionInputSchema = withKnownModel(modelConfigBaseSchema)

export const agentPublishInputSchema = z.object({
  versionId: z.string().trim().min(1, 'Versi wajib dipilih.'),
})

export const agentRunInputSchema = z.object({
  input: z
    .string()
    .trim()
    .min(1, 'Masukan wajib diisi.')
    .max(20_000, 'Masukan maksimal 20.000 karakter.'),
  versionId: z.string().trim().min(1).optional(),
  environment: z.nativeEnum(AgentEnvironment).optional(),
})

interface ParsedInput<T> {
  data: T | null
  errors: ApiError[] | null
}

// Satu jalur validasi untuk semua rute: pesan gagalnya ikut bentuk amplop API,
// lengkap dengan nama field yang bermasalah.
export const parseInput = <T>(
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  body: unknown
): ParsedInput<T> => {
  const result = schema.safeParse(body ?? {})

  if (result.success) return { data: result.data, errors: null }

  return {
    data: null,
    errors: result.error.issues.map((issue) => ({
      code: 'INVALID_INPUT',
      field: issue.path.join('.'),
      message: issue.message,
    })),
  }
}
