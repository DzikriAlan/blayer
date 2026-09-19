import { z } from 'zod'
import { AgentEnvironment, AgentProvider } from '@prisma/client'

export const nameValidation = z
  .string()
  .trim()
  .min(3, 'Nama minimal 3 karakter.')
  .max(80, 'Nama maksimal 80 karakter.')

export const slugValidation = z
  .string()
  .trim()
  .min(3, 'Slug minimal 3 karakter.')
  .max(48, 'Slug maksimal 48 karakter.')
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    'Slug hanya boleh huruf kecil, angka, dan tanda hubung.'
  )

// Slug boleh dikosongkan; service menurunkannya dari nama.
export const optionalSlugValidation = z
  .union([slugValidation, z.literal('')])
  .optional()
  .transform((value) => (value ? value : undefined))

export const descriptionValidation = z
  .string()
  .trim()
  .max(500, 'Deskripsi maksimal 500 karakter.')
  .default('')

export const createProjectsValidation = z.object({
  name: nameValidation,
  slug: optionalSlugValidation,
  description: descriptionValidation,
})

export const createProjectsKeysValidation = z.object({
  name: nameValidation,
  environment: z
    .nativeEnum(AgentEnvironment)
    .default(AgentEnvironment.DEVELOPMENT),
})

export const updateProjectsCredentialsValidation = z.object({
  provider: z.nativeEnum(AgentProvider),
  environment: z.nativeEnum(AgentEnvironment),
  secret: z
    .string()
    .trim()
    .min(8, 'Kunci provider minimal 8 karakter.')
    .max(500, 'Kunci provider maksimal 500 karakter.'),
})

export type CreateProjectsDto = z.infer<typeof createProjectsValidation>
export type CreateProjectsKeysDto = z.infer<typeof createProjectsKeysValidation>
export type UpdateProjectsCredentialsDto = z.infer<
  typeof updateProjectsCredentialsValidation
>

export interface ProjectsResponseDto {
  id: string
  slug: string
  name: string
  description: string
  totalAgents: number
  totalApiKeys: number
  createdAt: string
}

export interface ProjectsKeysResponseDto {
  id: string
  name: string
  environment: AgentEnvironment
  prefix: string
  lastUsedAt: string
  isRevoked: boolean
  createdAt: string
}

export interface ProjectsCredentialsResponseDto {
  id: string
  provider: AgentProvider
  environment: AgentEnvironment
  hint: string
  updatedAt: string
}
