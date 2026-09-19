import { z } from 'zod'
import { IntegrationAuth, ToolMethod, ToolPermission } from '@prisma/client'

import {
  descriptionValidation,
  nameValidation,
  optionalSlugValidation,
} from '../../projects/dto/projects.dto'

export const createIntegrationsValidation = z.object({
  name: nameValidation,
  slug: optionalSlugValidation,
  description: descriptionValidation,
  baseUrl: z
    .string()
    .trim()
    .url('Base URL harus URL yang sah, lengkap dengan http atau https.'),
  auth: z.nativeEnum(IntegrationAuth).default(IntegrationAuth.NONE),
  authHeader: z.string().trim().max(80).default(''),
  secret: z.string().trim().max(500).default(''),
})

const jsonSchemaValidation = z
  .record(z.unknown())
  .refine((value) => value.type === 'object', {
    message: 'Skema masukan tool harus objek JSON Schema bertipe object.',
  })

export const createIntegrationsToolsValidation = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Nama tool minimal 3 karakter.')
    .max(64, 'Nama tool maksimal 64 karakter.')
    .regex(
      /^[a-z][a-z0-9_]*$/,
      'Nama tool hanya boleh huruf kecil, angka, dan garis bawah.'
    ),
  description: z
    .string()
    .trim()
    .min(
      10,
      'Deskripsi tool minimal 10 karakter — model membacanya untuk tahu kapan tool ini dipakai.'
    )
    .max(500, 'Deskripsi tool maksimal 500 karakter.'),
  method: z.nativeEnum(ToolMethod).default(ToolMethod.GET),
  path: z
    .string()
    .trim()
    .min(1, 'Path wajib diisi.')
    .max(200, 'Path maksimal 200 karakter.'),
  permission: z.nativeEnum(ToolPermission).default(ToolPermission.READ),
  inputSchema: jsonSchemaValidation,
})

export type CreateIntegrationsDto = z.infer<typeof createIntegrationsValidation>
export type UpdateIntegrationsDto = CreateIntegrationsDto
export type CreateIntegrationsToolsDto = z.infer<
  typeof createIntegrationsToolsValidation
>

export interface IntegrationsToolsResponseDto {
  id: string
  integrationId: string
  name: string
  description: string
  method: ToolMethod
  path: string
  permission: ToolPermission
  inputSchema: unknown
  createdAt: string
}

export interface IntegrationsResponseDto {
  id: string
  projectId: string
  slug: string
  name: string
  description: string
  baseUrl: string
  auth: IntegrationAuth
  authHeader: string
  hint: string
  totalTools: number
  createdAt: string
  tools: IntegrationsToolsResponseDto[]
}
