import type { NextApiRequest, NextApiResponse } from 'next'
import type { Project, ProjectApiKey } from '@prisma/client'

import { prisma } from './prisma'
import { hashToken } from './agentCrypto'
import { isAdminToken } from './adminSession'
import { sendFailure } from './apiResponse'

export const getBearerToken = (req: NextApiRequest) => {
  const header = req.headers.authorization ?? ''

  return header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : ''
}

// Rute pengelolaan dipegang operator instance ini, bukan project consumer.
// Sesi hasil login maupun token mentah sama-sama diterima; keduanya diperiksa
// di satu tempat supaya tidak ada rute yang punya aturannya sendiri.
export const getAdminGuard = (req: NextApiRequest, res: NextApiResponse) => {
  if (isAdminToken(getBearerToken(req))) return true

  sendFailure(res, {
    status: 401,
    message: 'Sesi pengelolaan tidak dikenali atau sudah kedaluwarsa.',
    errors: [
      {
        code: 'UNAUTHORIZED',
        field: 'authorization',
        message: 'Masuk lebih dulu, lalu kirim header Authorization: Bearer <token sesi>.',
      },
    ],
  })

  return false
}

export interface ProjectActor {
  project: Project
  apiKey: ProjectApiKey
}

// Kunci project menentukan sekaligus siapa pemanggilnya dan environment mana
// yang dipakai, sehingga pemanggil tidak bisa meminjam kredensial production
// dengan kunci development.
export const getProjectGuard = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<ProjectActor | null> => {
  const token = getBearerToken(req)

  const sendUnauthorized = () => {
    sendFailure(res, {
      status: 401,
      message: 'API key project tidak dikenali.',
      errors: [
        {
          code: 'UNAUTHORIZED',
          field: 'authorization',
          message: 'Kirim header Authorization: Bearer <api key project>.',
        },
      ],
    })

    return null
  }

  if (!token) return sendUnauthorized()

  const apiKey = await prisma.projectApiKey.findUnique({
    where: { hash: hashToken(token) },
    include: { project: true },
  })

  if (!apiKey || apiKey.revokedAt) return sendUnauthorized()

  await prisma.projectApiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return { project: apiKey.project, apiKey }
}

export type RunActor =
  | { kind: 'admin' }
  | {
      kind: 'project'
      projectId: string
      environment: ProjectApiKey['environment']
    }

// Rute eksekusi melayani dua pemanggil: operator lewat Playground dan project
// consumer lewat API key-nya. Keduanya diperiksa di satu tempat supaya tidak ada
// jalur yang lolos tanpa identitas.
export const getRunActor = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<RunActor | null> => {
  const token = getBearerToken(req)

  const sendUnauthorized = () => {
    sendFailure(res, {
      status: 401,
      message: 'Kredensial tidak dikenali.',
      errors: [
        {
          code: 'UNAUTHORIZED',
          field: 'authorization',
          message:
            'Kirim header Authorization: Bearer <api key project> atau token pengelolaan.',
        },
      ],
    })

    return null
  }

  if (!token) return sendUnauthorized()

  if (isAdminToken(token)) return { kind: 'admin' }

  const apiKey = await prisma.projectApiKey.findUnique({
    where: { hash: hashToken(token) },
    select: { id: true, projectId: true, environment: true, revokedAt: true },
  })

  if (!apiKey || apiKey.revokedAt) return sendUnauthorized()

  await prisma.projectApiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return {
    kind: 'project',
    projectId: apiKey.projectId,
    environment: apiKey.environment,
  }
}
