# @blayer/sdk

Klien TypeScript untuk instance [Blayer](../README.md) milikmu sendiri.

```bash
npm install @blayer/sdk
```

## Menjalankan agent

```ts
import { createClient } from '@blayer/sdk'

const blayer = createClient({
  baseUrl: process.env.BLAYER_URL!,      // https://blayer.instansimu.id
  apiKey: process.env.BLAYER_API_KEY!,   // blr_…
})

const run = await blayer.agents.run({
  agentId: 'clz…',
  input: 'Berapa laba bulan lalu?',
})

console.log(run.output, run.costUsd, run.latencyMs)
```

API key project selalu menjalankan versi yang sedang production, pada environment
yang melekat di kuncinya.

## Percakapan yang diingat

```ts
const session = await blayer.agents.createSession({ agentId })

await blayer.agents.run({ agentId, input: 'Nama saya Dzikri.', sessionId: session.id })
const run = await blayer.agents.run({ agentId, input: 'Siapa nama saya?', sessionId: session.id })
```

## Tool yang mengubah data

Eksekusi berhenti sebelum tool WRITE dijalankan dan mengembalikan
`status: 'PENDING_CONFIRMATION'`. Tool baru berjalan setelah dikonfirmasi:

```ts
const run = await blayer.agents.run({ agentId, input: 'Hapus transaksi INV-1' })

if (run.status === 'PENDING_CONFIRMATION' && run.pendingToolCall) {
  const isAllowed = await tanyaManusia(run.pendingToolCall)   // keputusanmu sendiri

  const lanjutan = await blayer.runs.confirm({
    runId: run.runId,
    toolCallId: run.pendingToolCall.id,
    decision: isAllowed ? 'CONFIRM' : 'REJECT',
  })

  console.log(lanjutan.output)
}
```

## Mendaftarkan tool dari kode

Butuh token pengelolaan instance, bukan API key project:

```ts
const blayer = createClient({
  baseUrl: process.env.BLAYER_URL!,
  adminToken: process.env.BLAYER_ADMIN_TOKEN!,
})

await blayer.tools.register({
  integrationId: 'clz…',
  name: 'get_profit_loss',
  description: 'Ambil laporan laba rugi satu periode.',
  method: 'GET',
  path: '/ai/tools/profit-loss',
  permission: 'READ',
  inputSchema: {
    type: 'object',
    properties: { month: { type: 'string', description: 'Periode YYYY-MM' } },
    required: ['month'],
  },
})
```

Yang terdaftar hanya kontraknya. Endpoint yang dipanggil tetap milikmu, berjalan
di infrastrukturmu.

## Kegagalan

Semua kegagalan dilempar sebagai `BlayerError` dengan `code`, `status`, dan
`requestId` yang sama dengan yang tercatat di log instance.
