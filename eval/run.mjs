#!/usr/bin/env node
/**
 * Penguji regresi agent.
 *
 * Menjalankan tiap kasus di eval/cases.json terhadap instance Blayer yang
 * benar-benar hidup, lalu memeriksa jawabannya. Dipakai sebelum menaikkan versi
 * agent ke production: prompt yang "terasa lebih baik" belum tentu masih
 * memenuhi yang sudah pernah benar.
 *
 *   BLAYER_URL=http://localhost:3000 \
 *   BLAYER_API_KEY=blr_... \
 *   BLAYER_AGENT_ID=clz... \
 *   npm run eval
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))

const baseUrl = (process.env.BLAYER_URL ?? '').replace(/\/+$/, '')
const apiKey = process.env.BLAYER_API_KEY ?? ''
const agentId = process.env.BLAYER_AGENT_ID ?? ''
const casesPath = process.env.BLAYER_EVAL_CASES ?? path.join(here, 'cases.json')

if (!baseUrl || !apiKey || !agentId) {
  console.error(
    'Butuh BLAYER_URL, BLAYER_API_KEY, dan BLAYER_AGENT_ID. Lihat eval/README.md.'
  )
  process.exit(2)
}

const runAgent = async (input) => {
  const response = await fetch(`${baseUrl}/api/v1/agents/${agentId}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ input }),
  })

  const payload = await response.json()

  if (!response.ok || !payload.success) {
    throw new Error(
      payload?.errors?.[0]?.message ?? `Permintaan gagal (${response.status}).`
    )
  }

  return payload.data
}

const checkCase = (run, expect) => {
  const failures = []
  const output = String(run.output ?? '')

  if (expect.status && run.status !== expect.status) {
    failures.push(`status ${run.status}, diharapkan ${expect.status}`)
  }

  if (expect.pendingTool && run.pendingToolCall?.name !== expect.pendingTool) {
    failures.push(
      `tool tertunda ${run.pendingToolCall?.name ?? 'tidak ada'}, diharapkan ${expect.pendingTool}`
    )
  }

  if (expect.toolCalled) {
    const called = (run.toolCalls ?? []).some((call) => call.name === expect.toolCalled)
    if (!called) failures.push(`tool ${expect.toolCalled} tidak dipanggil`)
  }

  ;(expect.contains ?? []).forEach((text) => {
    if (!output.toLowerCase().includes(String(text).toLowerCase())) {
      failures.push(`jawaban tidak memuat "${text}"`)
    }
  })

  ;(expect.notContains ?? []).forEach((text) => {
    if (output.toLowerCase().includes(String(text).toLowerCase())) {
      failures.push(`jawaban memuat "${text}" padahal tidak boleh`)
    }
  })

  return failures
}

const main = async () => {
  const dataset = JSON.parse(await readFile(casesPath, 'utf8'))
  const cases = dataset.cases ?? []

  let failed = 0
  let totalCostUsd = 0
  let totalLatencyMs = 0

  for (const testCase of cases) {
    try {
      const run = await runAgent(testCase.input)
      const failures = checkCase(run, testCase.expect ?? {})

      totalCostUsd += run.costUsd ?? 0
      totalLatencyMs += run.latencyMs ?? 0

      if (failures.length) {
        failed += 1
        console.log(`GAGAL  ${testCase.id}`)
        failures.forEach((failure) => console.log(`       ${failure}`))
      } else {
        console.log(`OK     ${testCase.id} (${run.latencyMs} ms)`)
      }
    } catch (error) {
      failed += 1
      console.log(`ERROR  ${testCase.id}: ${error.message}`)
    }
  }

  console.log(
    `\n${cases.length - failed}/${cases.length} lolos · ${Math.round(
      totalLatencyMs / Math.max(cases.length, 1)
    )} ms rata-rata · $${totalCostUsd.toFixed(4)} total`
  )

  process.exit(failed ? 1 : 0)
}

main().catch((error) => {
  console.error(error)
  process.exit(2)
})
