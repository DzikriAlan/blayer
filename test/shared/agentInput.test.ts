import { describe, expect, it } from 'vitest'
import { AgentEffort, AgentEnvironment, AgentProvider } from '@prisma/client'

import {
  agentInputSchema,
  agentRunInputSchema,
  agentVersionInputSchema,
  credentialInputSchema,
  parseInput,
  projectInputSchema,
} from '@/shared/lib/agentInput'

const validAgent = {
  projectId: 'project-1',
  name: 'Accounting Assistant',
  slug: 'accounting-assistant',
  instructions: 'Jawab pertanyaan akuntansi hanya dari hasil tool.',
}

describe('validasi project', () => {
  it('TC-55a menolak slug dengan huruf besar atau spasi', () => {
    const { errors } = parseInput(projectInputSchema, {
      name: 'EasyAccounting',
      slug: 'Easy Accounting',
    })

    expect(errors?.[0].field).toBe('slug')
  })

  it('TC-55b membiarkan deskripsi kosong', () => {
    const { data } = parseInput(projectInputSchema, {
      name: 'EasyAccounting',
      slug: 'easyaccounting',
    })

    expect(data?.description).toBe('')
  })
})

describe('validasi agent', () => {
  it('TC-56a mengisi konfigurasi bawaan saat tidak disebutkan', () => {
    const { data } = parseInput(agentInputSchema, validAgent)

    expect(data).toMatchObject({
      provider: AgentProvider.ANTHROPIC,
      effort: AgentEffort.HIGH,
      maxTokens: 16_000,
      temperature: null,
    })
  })

  it('TC-56b menolak model yang tidak ada di katalog Anthropic', () => {
    const { data, errors } = parseInput(agentInputSchema, {
      ...validAgent,
      provider: AgentProvider.ANTHROPIC,
      model: 'claude-yang-tidak-ada',
    })

    expect(data).toBeNull()
    expect(errors?.[0].field).toBe('model')
  })

  it('TC-56c menerima id model bebas untuk provider di luar katalog', () => {
    const { data } = parseInput(agentInputSchema, {
      ...validAgent,
      provider: AgentProvider.OPENAI,
      model: 'model-baru-kemarin',
    })

    expect(data?.model).toBe('model-baru-kemarin')
  })

  it('TC-56d menjaga batas token di rentang yang didukung', () => {
    expect(
      parseInput(agentVersionInputSchema, {
        ...validAgent,
        maxTokens: 10,
      }).errors?.[0].field
    ).toBe('maxTokens')

    expect(
      parseInput(agentVersionInputSchema, {
        ...validAgent,
        maxTokens: 999_999,
      }).errors?.[0].field
    ).toBe('maxTokens')
  })

  it('TC-56e menolak instruksi yang terlalu pendek', () => {
    const { errors } = parseInput(agentVersionInputSchema, {
      ...validAgent,
      instructions: 'halo',
    })

    expect(errors?.[0].field).toBe('instructions')
  })
})

describe('validasi kredensial dan eksekusi', () => {
  it('TC-57a menolak kunci provider yang terlalu pendek', () => {
    const { errors } = parseInput(credentialInputSchema, {
      provider: AgentProvider.ANTHROPIC,
      environment: AgentEnvironment.PRODUCTION,
      secret: 'sk-1',
    })

    expect(errors?.[0].field).toBe('secret')
  })

  it('TC-57b menolak masukan eksekusi yang kosong', () => {
    const { errors } = parseInput(agentRunInputSchema, { input: '   ' })

    expect(errors?.[0].field).toBe('input')
  })

  it('TC-57c membiarkan environment kosong untuk ditentukan pemanggilnya', () => {
    const { data } = parseInput(agentRunInputSchema, { input: 'halo' })

    expect(data?.environment).toBeUndefined()
  })
})
