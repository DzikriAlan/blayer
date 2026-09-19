import { z } from 'zod'

export const createRunsConfirmValidation = z.object({
  toolCallId: z.string().trim().min(1, 'Id permintaan konfirmasi wajib diisi.'),
  decision: z.enum(['CONFIRM', 'REJECT'], {
    errorMap: () => ({ message: 'Keputusan hanya boleh CONFIRM atau REJECT.' }),
  }),
})

export type CreateRunsConfirmDto = z.infer<typeof createRunsConfirmValidation>
