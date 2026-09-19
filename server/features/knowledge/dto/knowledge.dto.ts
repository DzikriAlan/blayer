import { z } from 'zod'

export const createKnowledgeValidation = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Judul minimal 3 karakter.')
    .max(120, 'Judul maksimal 120 karakter.'),
  content: z
    .string()
    .trim()
    .min(10, 'Isi dokumen minimal 10 karakter.')
    .max(200_000, 'Isi dokumen maksimal 200.000 karakter.'),
})

export const updateKnowledgeValidation = createKnowledgeValidation

export type CreateKnowledgeDto = z.infer<typeof createKnowledgeValidation>
export type UpdateKnowledgeDto = z.infer<typeof updateKnowledgeValidation>

export interface KnowledgeResponseDto {
  id: string
  title: string
  preview: string
  totalChars: number
  updatedAt: string
}
