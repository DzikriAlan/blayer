# Blayer

**AI Agent Platform / AI Control Plane** — tempat membuat, mengatur, menguji, dan
menyediakan AI Agent yang bisa dipakai banyak aplikasi lewat satu API.
Self-hosted, berlisensi MIT.

> **Blayer mengatur AI, project menguasai data.**
> Blayer menyimpan *kontrak* tool — bukan database bisnismu. Implementasi tool
> tetap berjalan di sisi project, di infrastruktur yang kamu kuasai sendiri.

---

## Status repositori

**Phase 1 dan Phase 2 sudah berjalan**: project, API key, agent beserta versinya,
Playground, Agent Run API, observability, lalu tool beserta eksekutornya,
knowledge, memory per sesi, dan guardrail konfirmasi tool tulis. SDK TypeScript
dan paket Docker ikut tersedia. Belum diuji di produksi, dan alur end-to-end-nya
belum pernah dijalankan terhadap basis data sungguhan.

| Bagian | Status |
|---|---|
| Login operator (username + kata sandi) dengan sesi bertanda tangan | ✅ ada |
| Project workspace + API key per project & environment | ✅ ada |
| Agent CRUD + versioning (draf → production, rollback) | ✅ ada |
| Model provider key per project & environment, tersimpan terenkripsi | ✅ ada |
| Multi-provider model (Anthropic, Chat Completions) | ✅ ada |
| Agent Run API (`POST /api/v1/agents/{id}/run`) + rate limit per project | ✅ ada |
| Console: builder konfigurasi, Playground, riwayat eksekusi | ✅ ada |
| Observability: token, biaya, latency, success rate per agent | ✅ ada |
| Fondasi HTTP & data: amplop jawaban API, request id, logger, Prisma, migrasi | ✅ ada |
| CI (lint, typecheck, test, build) + Vitest | ✅ ada |
| Landing page (`/`) + halaman 404/500 | ✅ ada |
| Integration, Tool Definition Registry, Tool Executor | ✅ ada |
| Tool tulis berhenti menunggu konfirmasi eksplisit | ✅ ada |
| Knowledge Base per project, dipasang per versi agent | ✅ ada |
| Memory percakapan per sesi | ✅ ada |
| Guardrail tetap di tiap eksekusi | ✅ ada |
| SDK TypeScript (`blayer.agents.run`, `blayer.tools.register`) | ✅ ada — di [`sdk/`](./sdk) |
| Paket self-hosting (Docker Compose) | ✅ ada — lihat [docs/SELF_HOSTING.md](./docs/SELF_HOSTING.md) |
| Harness evaluasi/regresi agent | ✅ dasar — lihat [`eval/`](./eval) |
| Knowledge berbasis vector store / RAG | ⛔ belum — dokumen dikirim apa adanya |
| `CONTRIBUTING.md` | ⛔ belum ditulis |
| Skema basis data produk lama (`forms`, `form_responses`, dll) | ⚠️ masih ada, sudah tidak dibaca kode mana pun |

Landing page menjelaskan platform ini apa adanya — termasuk menandai bagian yang
masih dibangun — dan tidak menyentuh basis data sama sekali; isinya konstanta di
`src/features/landing/components/landingCatalog.ts`. Bahasa desainnya diwarisi
dari produk sebelumnya, naskahnya tidak.

Rencana produk selengkapnya ada di [PRD.md](./PRD.md).

---

## Masalah yang diselesaikan

- Tiap project membangun logic AI-nya sendiri — duplikasi kerja, kualitas tidak
  seragam, sulit dirawat.
- Tidak ada tempat terpusat untuk mengelola prompt, model, knowledge, dan tool
  lintas project.
- Menyimpan agent sebagai `system_prompt` mentah tidak bisa di-versioning, sulit
  diuji, dan tidak terpantau.
- Tidak ada catatan biaya, token, latency, dan error atas pemakaian AI.
- Data bisnis tidak boleh diakses bebas oleh layer AI — perlu batas tegas antara
  *siapa mendefinisikan tool* dan *siapa menjalankannya*.

## Prinsip arsitektur

**Control plane vs data plane.** Blayer tidak pernah menyimpan atau meng-query
database project. Yang disimpan hanya kontrak tool: nama, deskripsi, skema
input/output, method, dan referensi endpoint — plus konfigurasi *Integration*
(base URL, autentikasi) milik project tujuan.

**Definition vs implementation.** Selama endpoint memenuhi kontrak yang
didaftarkan, implementasi di baliknya bisa diganti (project lain, atau mock API)
tanpa mengubah definisi di Blayer.

**Runtime dependency satu arah,** bukan circular:

```mermaid
flowchart LR
    A[Project consumer] -->|POST /v1/agents/:id/run| B[Blayer API]
    B --> C[Agent Runtime]
    C --> D[LLM Reasoning]
    D -->|butuh data| E[Tool Executor]
    E -->|HTTP, sesuai kontrak| F[Endpoint tool milik project]
    F --> G[(Database project)]
    F --> E
    E --> D
    D --> H[Response + log token, cost, latency]
    H --> A
```

Analogi: **Blayer = otak**, **project = tubuh**, **tool = tangan**. Otak
memerintah "ambil laporan laba rugi"; tangan yang tahu caranya — otak tidak perlu
tahu di mana databasenya.

**Aturan yang tidak dinegosiasikan:**

- Tool WRITE berhenti di runtime dan mengembalikan status *pending confirmation*;
  eksekusi baru lanjut setelah ada konfirmasi eksplisit lewat API/SDK.
- Agent tidak boleh mengarang angka — angka harus datang dari hasil tool.
- Kredensial AI provider tersimpan di instance milikmu sendiri, di-scope per
  project dan per environment. Tidak ada server pusat Blayer yang menerimanya.

## Peta fitur

| Fitur | Prioritas | Status |
|---|---|---|
| Agent CRUD & configuration | Must | ✅ |
| Multi-provider model (Anthropic, Chat Completions) | Must | ✅ |
| Agent Builder (UI konfigurasi + publikasi) | Must | ✅ sebagian — belum berbentuk wizard bertahap |
| Agent versioning & deployment (dev/staging/prod) | Must | ✅ |
| Project workspace + API key per project | Must | ✅ |
| Model provider key per project & environment | Must | ✅ |
| Playground | Must | ✅ |
| Agent Run API | Must | ✅ |
| Observability & logs (token, cost, latency) | Must | ✅ — tool call menyusul bersama Phase 2 |
| Token usage tracking per agent & environment | Must | ✅ |
| Rate limiting & fair usage per API key | Should | ✅ per project, 60 eksekusi/menit |
| Analytics dashboard | Should | ✅ dasar — ringkasan per agent |
| Tool Definition Registry | Must | ✅ |
| Integration management (base URL, auth, API key) | Must | ✅ |
| Tool permission read/write + confirmation | Must | ✅ |
| Tool Executor | Must | ✅ |
| Knowledge Base | Must | ✅ — dokumen dikirim apa adanya, belum vector store |
| Guardrails enforcement | Must | ✅ |
| SDK TypeScript & SDK tool registration | Must / Should | ✅ |
| Memory per sesi | Should | ✅ |
| Paket self-hosting (Docker Compose) | Should | ✅ |
| Evaluation / regression testing | Could | ✅ dasar |

**Di luar cakupan fase ini:** multi-agent orchestration, workflow builder,
marketplace agent, long-term memory lintas sesi, scheduled/event-triggered agent,
SDK selain TypeScript, dan versi cloud berbayar. Blayer murni open source
self-hosted.

---

## Menjalankan secara lokal

### Prasyarat

- [Node.js](https://nodejs.org) v20.9+ (`node --version`)
- [PostgreSQL](https://www.postgresql.org) v14+, lokal atau terkelola
- npm (ikut terpasang bersama Node.js)

### 1. Pasang dependensi

```bash
git clone <repo-url>
cd blayer
npm install
```

### 2. Siapkan environment

```bash
cp .env.example .env
```

Dua variabel yang wajib terisi:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/blayer"

# Kunci enkripsi kredensial provider — 32 byte acak dalam base64
BLAYER_ENCRYPTION_KEY="$(openssl rand -base64 32)"
```

`BLAYER_ENCRYPTION_KEY` membuka kunci provider yang sudah tersimpan. Menggantinya
membuat kredensial lama tidak bisa dibaca lagi dan eksekusi agent menjawab
`503 CONFIG_MISSING` — simpan seperti rahasia produksi lain, jangan dibangkitkan
ulang tiap deploy.

**Masuk ke Console dengan `admin` / `admin123`.** Itu kredensial bawaan supaya
instance baru langsung bisa dibuka; Console memasang spanduk peringatan selama
masih dipakai. Gantilah sebelum instance dijangkau siapa pun selain kamu:

```env
BLAYER_ADMIN_USERNAME="operator"
BLAYER_ADMIN_PASSWORD="kata-sandi-yang-panjang"
BLAYER_SESSION_SECRET="$(openssl rand -base64 32)"   # opsional, membatalkan semua sesi saat diganti
```

Opsional, semuanya punya nilai bawaan yang aman:

| Variabel | Gunanya |
|---|---|
| `TRUST_PROXY_HOPS` | Jumlah proxy tepercaya di depan aplikasi. Wajib diisi di produksi di balik proxy, kalau tidak rate limit membaca IP yang salah. |
| `RATE_LIMIT_STORE` | `memory` atau `postgres`. Tanpa diisi: Redis kalau kredensialnya ada, selain itu Postgres di produksi dan memori proses di pengembangan. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Penyimpanan rate limit di Redis (bisa juga `RATE_LIMIT_REDIS_REST_URL` / `RATE_LIMIT_REDIS_REST_TOKEN`). |
| `SLOW_REQUEST_MS` | Ambang batas permintaan lambat yang dicatat di log (bawaan 1000). |
| `ALERT_WEBHOOK_URL` | Tujuan kiriman log level error. |
| `BLAYER_ADMIN_TOKEN` | Token mentah untuk skrip, CI, dan curl — dipakai langsung sebagai Bearer tanpa perlu login. Tanpa ini, akses pengelolaan hanya lewat login. |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL API kalau front-end dan API dipisah. |
| `OPENAI_BASE_URL` | Endpoint sebentuk Chat Completions selain OpenAI (gateway, proxy, model lokal). Bawaannya `https://api.openai.com/v1`. |

> `.env.example` belum memuat variabel `BLAYER_*` di atas, dan masih memuat
> variabel Supabase dan Resend dari produk sebelumnya. Variabel lama itu tidak
> lagi dibaca kode, kecuali `NEXT_PUBLIC_SUPABASE_URL` yang hanya dipakai
> `next.config.js` untuk melonggarkan CSP.

### 3. Siapkan basis data

```bash
npx prisma generate
npm run db:migrate
```

`db:push` sengaja diblokir — perubahan skema harus lewat migrasi supaya punya
jejak dan bisa diputar balik.

### 4. Jalankan

```bash
npm run dev
```

Aplikasi berjalan di **http://localhost:3002**. Periksa kesiapannya:

```bash
curl http://localhost:3002/api/health
```

Jawaban `503` dengan kode `DATABASE_UNAVAILABLE` berarti `DATABASE_URL` belum
menunjuk basis data yang hidup.

### 5. Agent pertama

Buka **http://localhost:3002/console** dan masuk dengan `admin` / `admin123`
(atau kredensial yang kamu setel sendiri). Sesinya berlaku 12 jam, disimpan di
browser itu saja, dan dikirim sebagai header `Authorization` — tidak ada sesi
yang disimpan di server.

1. **Buat project.** Wadah agent, API key, dan kredensial provider.
2. **Simpan kunci provider** untuk environment yang akan dipakai. Tanpa itu
   eksekusi menjawab `409 PROVIDER_KEY_MISSING`, bukan gagal diam-diam.
3. **Buat agent** beserta instruksi dan modelnya. Agent lahir sebagai draf v1.
4. **Uji di Playground.** Jawaban, token, biaya, dan lamanya langsung terlihat.
5. **Publikasikan versinya.** Baru setelah itu API key project bisa memanggilnya.
6. **Terbitkan API key project**, lalu panggil dari aplikasi lain:

```bash
curl -X POST http://localhost:3002/api/v1/agents/$AGENT_ID/run \
  -H "Authorization: Bearer $BLAYER_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"input":"Berapa laba bulan lalu?"}'
```

Rincian tiap rute ada di [docs/AGENT_API.md](./docs/AGENT_API.md).

---

## Struktur proyek

```
src/
├── pages/                 # Rute halaman & API (Pages Router)
│   ├── index.tsx          # Landing page
│   ├── console/           # Console operator (project, agent, playground)
│   └── api/
│       ├── health.ts      # Kesiapan layanan
│       └── v1/            # Agent API — satu amplop jawaban untuk semuanya
├── features/console/      # Login operator dan gerbang sesinya
├── features/integrations/ # Integration dan kontrak tool
├── features/knowledge/    # Dokumen pengetahuan project
├── features/projects/     # Project, API key, kredensial provider
├── features/agents/       # Builder, versi, playground, riwayat eksekusi
├── features/landing/      # Isi halaman depan (statis, tanpa pemanggilan API)
├── features/<fitur>/      # Satu fitur = satu folder berlapis
│   ├── types/             # Bentuk data & payload
│   ├── states/            # State klien (Zustand)
│   ├── services/          # Pemanggilan HTTP
│   ├── controllers/       # Query/mutation (TanStack Query) + turunan state
│   └── components/        # Tampilan
├── components/ui/         # Komponen dasar (Shadcn/UI)
└── shared/
    ├── components/        # LoadData, ErrorBoundary
    ├── lib/               # apiHandler, apiResponse, logger, rateLimit, prisma
    │                      # agentRuntime, toolExecutor, agentCatalog,
    │                      # agentCrypto, adminSession, providers/
    └── styles/            # Tailwind + token desain
```

Fitur baru mengikuti jalur `types → states → services → controllers → components`
supaya penambahannya tidak menyusun ulang pola dari nol.

### Tumpukan teknologi

| Lapis | Pilihan |
|---|---|
| Framework | Next.js 16 (Pages Router) + React 18 |
| Bahasa | TypeScript (strict) |
| Tampilan | Tailwind CSS + Shadcn/UI + Lucide |
| State klien | Zustand |
| State server | TanStack Query |
| Basis data | PostgreSQL + Prisma |
| Validasi | Zod, dipakai ulang di seluruh rute |
| Provider AI | Anthropic SDK resmi + adaptor Chat Completions |
| Pengujian | Vitest + Testing Library |
| Kualitas kode | ESLint + TypeScript strict |

---

## Kontrak API

Semua rute di bawah `/api/v1` menjawab dengan satu bentuk amplop yang sama —
berhasil maupun gagal — lengkap dengan `request_id` yang juga muncul di header
`X-Request-Id` dan di log. Rinciannya di
[docs/API_RESPONSE.md](./docs/API_RESPONSE.md).

Rincian tiap rute, kredensial, dan kode kesalahannya ada di
[docs/AGENT_API.md](./docs/AGENT_API.md).

| Endpoint | Kredensial | Gunanya |
|---|---|---|
| `GET /api/health` | — | Kesiapan aplikasi, basis data, dan penyimpanan rate limit |
| `POST /api/v1/auth/login` | — | Menukar username + kata sandi dengan token sesi 12 jam |
| `/api/v1/projects…` | token pengelolaan | Project, API key, kredensial provider |
| `/api/v1/agents…` | token pengelolaan | Agent, versi, publikasi, riwayat eksekusi |
| `/api/v1/integrations…`, `/api/v1/tools…` | token pengelolaan | Kontrak tool dan koneksi ke API project |
| `/api/v1/projects/{id}/knowledge` | token pengelolaan | Dokumen pengetahuan |
| `POST /api/v1/agents/{id}/run` | API key project | Menjalankan agent |
| `POST /api/v1/agents/{id}/sessions` | API key project | Membuka sesi percakapan |
| `POST /api/v1/runs/{id}/confirm` | API key project | Menyetujui tool yang mengubah data |
| `GET /api/v1/models` | token pengelolaan | Katalog model, harga, dan kemampuannya |

## Skrip

```bash
npm run dev          # Server pengembangan (port 3002)
npm run build        # Build produksi
npm run start        # Jalankan hasil build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test         # Vitest sekali jalan
npm run test:watch   # Vitest mode pantau
npm run db:generate  # Regenerasi Prisma Client
npm run db:migrate   # Buat & terapkan migrasi (pengembangan)
npm run db:deploy    # Terapkan migrasi tertunda (produksi)
npm run db:studio    # Prisma Studio
npm run sdk:build    # Build paket @blayer/sdk
npm run eval         # Uji regresi agent terhadap instance yang hidup
```

CI menjalankan lint, typecheck, test, dan build di tiap PR
([.github/workflows/ci.yml](./.github/workflows/ci.yml)). Jangan gabungkan
branch yang merah.

---

## Peta jalan

| Fase | Fokus |
|---|---|
| Phase 1 — Agent Foundation | Project, Agent CRUD, konfigurasi model, instructions, Playground, API, API key — **selesai** |
| Phase 2 — Agent Intelligence | Tools, Knowledge, RAG, function calling, memory dasar — **berikutnya** |
| Pilot Integration | Integrasi end-to-end dengan satu project consumer |
| Phase 3 — Production Readiness | Deployment layer, monitoring lanjutan, error tracking (versioning & cost tracking sudah ada sejak Phase 1) |
| Persiapan Open Source | Pemisahan core, paket self-hosting, dokumentasi publik, rate limiting per API key |
| Rilis Open Source | Publikasi repositori dan dokumentasi |
| Phase 4 — Evaluation | Test case, dataset, regression testing (opsional, setelah pilot stabil) |

Estimasi dan metrik suksesnya ada di [PRD.md](./PRD.md).

## Dokumentasi

- **[docs/AGENT_API.md](./docs/AGENT_API.md)** — rute Agent API, kredensial, tool, konfirmasi, contoh permintaan, dan kode kesalahannya
- **[docs/SELF_HOSTING.md](./docs/SELF_HOSTING.md)** — menjalankan Blayer sendiri lewat Docker Compose atau tanpa Docker
- **[sdk/README.md](./sdk/README.md)** — klien TypeScript untuk memanggil agent dari aplikasimu
- **[eval/README.md](./eval/README.md)** — harness regresi sebelum menaikkan versi agent
- **[docs/API_RESPONSE.md](./docs/API_RESPONSE.md)** — bentuk amplop jawaban yang dipakai semua rute
- **[PRD.md](./PRD.md)** — rencana produk, metrik sukses, dan batasan arsitekturnya

## Kontribusi

Panduan kontribusi (`CONTRIBUTING.md`) belum ditulis dan menjadi salah satu
prasyarat sebelum repositori dibuka ke publik. Sementara itu, tiap perubahan
tetap harus lolos `npm run lint`, `npm run typecheck`, `npm test`, dan
`npm run build`.

## Lisensi

[MIT](https://opensource.org/licenses/MIT).
