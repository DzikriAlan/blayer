# Blayer

**AI Agent Platform / AI Control Plane** — tempat membuat, mengatur, menguji, dan
menyediakan AI Agent yang bisa dipakai banyak aplikasi lewat satu API.
Self-hosted, berlisensi MIT.

> **Blayer mengatur AI, project menguasai data.**
> Blayer menyimpan *kontrak* tool — bukan database bisnismu. Implementasi tool
> tetap berjalan di sisi project, di infrastruktur yang kamu kuasai sendiri.

---

## Status repositori

Repositori ini sedang berada di titik awal pembangunan platform. Isi aplikasi
produk sebelumnya (form builder) sudah dicabut; yang tersisa adalah landing page
beserta fondasi teknis yang akan dipakai ulang. **Belum ada Agent Runtime, Tool
Registry, maupun SDK di dalam repo ini.** Jangan pakai untuk produksi.

| Bagian | Status |
|---|---|
| Landing page (`/`) + halaman 404/500 | ✅ ada |
| Fondasi HTTP: amplop jawaban API, request id, logger terstruktur, rate limit | ✅ ada |
| Fondasi data: Prisma + PostgreSQL, migrasi, health check | ✅ ada |
| Skema basis data produk lama (`forms`, `form_responses`, dll) | ⚠️ masih ada, sudah tidak dibaca kode mana pun |
| CI (lint, typecheck, test, build) + Vitest | ✅ ada |
| Agent CRUD, Builder UI, Playground, Versioning | ⛔ belum dibangun |
| Tool Definition Registry, Tool Executor, Integration | ⛔ belum dibangun |
| Knowledge Base, Memory, Guardrails | ⛔ belum dibangun |
| Agent Run API (`POST /v1/agents/{id}/run`) + SDK TypeScript | ⛔ belum dibangun |
| Observability (token, cost, latency, tool calls) | ⛔ belum dibangun |
| Paket self-hosting (Docker Compose) + `CONTRIBUTING.md` | ⛔ belum dibangun |

Landing page masih memakai naskah dan tampilan produk sebelumnya, tapi tidak lagi
menyentuh basis data: daftar kategori, acara, dan angkanya adalah **data contoh**
yang ditulis di `src/features/landing/components/landingCatalog.ts`. Desainnya
dipertahankan sebagai rangka; naskah dan isinya diganti begitu permukaan platform
yang baru siap.

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
| Agent CRUD & configuration | Must | Belum |
| Multi-provider model (OpenAI, Anthropic, Google, dll) | Must | Belum |
| Agent Builder (wizard UI) | Must | Belum |
| Tool Definition Registry | Must | Belum |
| Integration management (base URL, auth, API key) | Must | Belum |
| Tool permission read/write + confirmation | Must | Belum |
| Tool Executor | Must | Belum |
| Knowledge Base | Must | Belum |
| Playground | Must | Belum |
| Agent versioning & deployment (dev/staging/prod) | Must | Belum |
| Project workspace + API key per project | Must | Belum |
| Agent Run API & SDK TypeScript | Must | Belum |
| Observability & logs (token, cost, latency, tool calls) | Must | Belum |
| Guardrails enforcement | Must | Belum |
| SDK tool registration (`blayer.tools.register`) | Should | Belum |
| Memory per sesi | Should | Belum |
| Analytics dashboard | Should | Belum |
| Paket self-hosting (Docker Compose) | Should | Belum |
| Rate limiting & fair usage per API key | Should | Sebagian (rate limit per IP sudah ada) |
| Evaluation / regression testing | Could | Belum |

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

Satu-satunya variabel yang wajib terisi:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/blayer"
```

Opsional, semuanya punya nilai bawaan yang aman:

| Variabel | Gunanya |
|---|---|
| `TRUST_PROXY_HOPS` | Jumlah proxy tepercaya di depan aplikasi. Wajib diisi di produksi di balik proxy, kalau tidak rate limit membaca IP yang salah. |
| `RATE_LIMIT_STORE` | `memory` atau `postgres`. Tanpa diisi: Redis kalau kredensialnya ada, selain itu Postgres di produksi dan memori proses di pengembangan. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Penyimpanan rate limit di Redis (bisa juga `RATE_LIMIT_REDIS_REST_URL` / `RATE_LIMIT_REDIS_REST_TOKEN`). |
| `SLOW_REQUEST_MS` | Ambang batas permintaan lambat yang dicatat di log (bawaan 1000). |
| `ALERT_WEBHOOK_URL` | Tujuan kiriman log level error. |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL API kalau front-end dan API dipisah. |

> `.env.example` masih memuat variabel Supabase dan Resend dari produk
> sebelumnya. Variabel itu tidak lagi dibaca kode, kecuali
> `NEXT_PUBLIC_SUPABASE_URL` yang hanya dipakai `next.config.js` untuk
> melonggarkan CSP.

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

---

## Struktur proyek

```
src/
├── pages/                 # Rute halaman & API (Pages Router)
│   ├── index.tsx          # Landing page
│   └── api/
│       └── health.ts      # Kesiapan layanan
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
| Pengujian | Vitest + Testing Library |
| Kualitas kode | ESLint + TypeScript strict |

---

## Kontrak API

Semua rute di bawah `/api/v1` menjawab dengan satu bentuk amplop yang sama —
berhasil maupun gagal — lengkap dengan `request_id` yang juga muncul di header
`X-Request-Id` dan di log. Rinciannya di
[docs/API_RESPONSE.md](./docs/API_RESPONSE.md).

Belum ada rute `/api/v1` yang terpasang. Endpoint yang ada saat ini hanya:

| Endpoint | Gunanya |
|---|---|
| `GET /api/health` | Kesiapan aplikasi, basis data, dan penyimpanan rate limit |

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
```

CI menjalankan lint, typecheck, test, dan build di tiap PR
([.github/workflows/ci.yml](./.github/workflows/ci.yml)). Jangan gabungkan
branch yang merah.

---

## Peta jalan

| Fase | Fokus |
|---|---|
| Phase 1 — Agent Foundation | Project, Agent CRUD, konfigurasi model, instructions, Playground, API, API key |
| Phase 2 — Agent Intelligence | Tools, Knowledge, RAG, function calling, memory dasar |
| Pilot Integration | Integrasi end-to-end dengan satu project consumer |
| Phase 3 — Production Readiness | Versioning, deployment layer, log, monitoring, cost tracking |
| Persiapan Open Source | Pemisahan core, paket self-hosting, dokumentasi publik, rate limiting per API key |
| Rilis Open Source | Publikasi repositori dan dokumentasi |
| Phase 4 — Evaluation | Test case, dataset, regression testing (opsional, setelah pilot stabil) |

Estimasi dan metrik suksesnya ada di [PRD.md](./PRD.md).

## Kontribusi

Panduan kontribusi (`CONTRIBUTING.md`) belum ditulis dan menjadi salah satu
prasyarat sebelum repositori dibuka ke publik. Sementara itu, tiap perubahan
tetap harus lolos `npm run lint`, `npm run typecheck`, `npm test`, dan
`npm run build`.

## Lisensi

[MIT](https://opensource.org/licenses/MIT).
