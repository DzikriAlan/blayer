import { z } from 'zod'

export const loginAuthValidation = z.object({
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

export type CreateAuthLoginDto = z.infer<typeof loginAuthValidation>

export interface AuthLoginResponseDto {
  token: string
  username: string
  expiresAt: string
  isDefaultCredentials: boolean
}
