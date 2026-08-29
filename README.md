# Blayer - Form Builder dengan Dashboard Hasil

**Take Exactly What You Need**

Blayer adalah platform berbasis form untuk membangun berbagai pengalaman interaktif sesuai kebutuhan dan hasil yang ingin dicapai. Dibangun di atas Next.js 14, TypeScript, Prisma, dan Supabase, dengan konvensi arsitektur yang konsisten di seluruh fitur.

## What i do

* Merancang **arsitektur full-stack berlapis** dengan **Next.js 14, React 18, TypeScript, Tailwind CSS, dan Shadcn/UI**, memisahkan tiap fitur menjadi `types → states → services → controllers → components` sehingga penambahan fitur baru mengikuti jalur yang sudah tetap dan tidak menyusun ulang pola dari nol.
* Membangun **satu form builder yang melayani tiga bentuk produk berbeda** — pendaftaran acara, survei, dan form berskor — diturunkan dari satu field `view` pada template, sehingga halaman isi, layar setelah kirim, dan dashboard hasil menyesuaikan diri tanpa cabang kode per produk.
* Mengimplementasikan **autentikasi dan kepemilikan data** dengan **Supabase Auth**, mendukung masuk lewat username-kata sandi maupun Google OAuth, dengan penolakan ditegakkan di API (401 tanpa token, 403 untuk milik akun lain) — bukan sekadar menyembunyikan halaman di browser.
* Menurunkan **halaman kategori publik** dari `view` yang sama, sehingga pengunjung bisa menemukan dan mengikuti form yang sedang terbuka tanpa membuat akun, dan lama pengerjaan tiap jawaban tercatat sendiri.
* Menyusun **penanganan keadaan data terpusat** lewat komponen `LoadData`, sehingga keadaan memuat, kosong, gagal, dan tidak terverifikasi ditangani satu tempat dan tiap permukaan tidak menyusun ulang logika yang sama.
* Menjaga **kualitas lewat pengujian otomatis** dengan **Vitest dan Testing Library** — 202 uji yang menutup builder, halaman isi, guard halaman, layar kredensial, hingga kepemilikan data di API, dengan tiap kasus terpetakan ke ID kebutuhan di `TEST_CASE.md`.
* Merawat **standar kode** memakai **ESLint, TypeScript strict mode, dan konvensi penamaan yang tertulis**, sehingga nama berkas, fungsi, dan prefix method bisa diturunkan langsung dari URL endpoint-nya.

---

## Tech Stack

| Concern | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (Pages Router) + React 18 | Satu basis kode untuk antarmuka dan API |
| **Language** | TypeScript | Pengembangan bertipe dengan strict mode |
| **Styling** | Tailwind CSS + Shadcn/UI | Utility-first CSS dan komponen yang bisa dipakai ulang |
| **State Management (Client)** | Zustand | State tampilan yang ringan dan dapat diprediksi |
| **State Management (Server)** | TanStack Query | Cache, sinkronisasi, dan keadaan permintaan data |
| **Forms** | React Hook Form + Zod | Validasi berskema di klien, dipakai ulang di server |
| **Authentication** | Supabase Auth | Username-kata sandi dan Google OAuth tanpa menyimpan kata sandi sendiri |
| **Database** | PostgreSQL (Supabase) | Basis data relasional yang andal dan bisa diskalakan |
| **ORM** | Prisma | Akses basis data bertipe dan sinkronisasi skema |
| **File Storage** | Supabase Storage | Banner acara yang permanen dan bisa dibuka tanpa login |
| **Testing** | Vitest + Testing Library | Uji unit dan komponen yang selaras dengan struktur fitur |
| **Icons** | Lucide React | Pustaka ikon yang konsisten dan aksesibel |
| **Code Quality** | ESLint + TypeScript Strict | Linting dan pemeriksaan tipe demi keterawatan |

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) v20+ (verify: `node --version`)
- [PostgreSQL](https://www.postgresql.org) (lokal atau Supabase, verify: `psql --version`)
- Akun [Supabase](https://supabase.com) untuk Auth dan Storage
- Package manager: npm (included with Node.js)

### 1. Clone & Install

```bash
git clone <repo-url>
cd blayer
npm install
```

If installation fails, use:
```bash
npm ci
```

### 2. Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/blayer"

# Supabase Auth — key publik, aman terkirim ke browser
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-publishable-or-anon-key"

# Supabase Storage & verifikasi token — hanya dibaca di API route
SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_BANNER_BUCKET="form-banners"

```

Aktifkan Google OAuth di dashboard Supabase:
```bash
# Authentication → Providers → Google  : isi Client ID + Secret
# Authentication → URL Configuration   : tambahkan http://localhost:3000/auth/callback
# Google Cloud Console → Credentials   : tambahkan https://xxxx.supabase.co/auth/v1/callback
```

### 3. Setup Database

```bash
npx prisma generate
npm run db:migrate
```

`db:migrate` menjalankan migrasi yang tersimpan di `prisma/migrations` dan
mencatat setiap perubahan skema. `db:push` masih ada untuk coba-coba cepat di
basis data sekali pakai, tapi jangan dipakai pada basis data yang sudah berisi
data sungguhan — perubahannya tidak punya jejak dan tidak bisa diputar balik.

Verify the database connection:
```bash
npx prisma studio
```

Isi data contoh (butuh akun `adminblayerganteng` sudah terdaftar, atau set `SEED_OWNER_ID`):
```bash
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Verify the app is running:
```bash
curl http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Halaman `/`, `/forms/[id]`, `/login`, dan `/register` terbuka tanpa login. Halaman `/forms`, `/forms/create`, dan `/forms/[id]/result` menuntut sesi lebih dulu.

---

## Troubleshooting

### Database connection error

**Error:** `Error: Can't reach database server`

**Solution:**
```bash
# Verify PostgreSQL is running
psql --version
psql -U postgres -c "SELECT 1"
```

Jika memakai Supabase, gunakan **connection pooler** (`aws-*.pooler.supabase.com`), bukan host `db.*.supabase.co` yang IPv6-only:
```bash
# Password dengan karakter "@" wajib ditulis %40, kalau tidak URL terpotong
DATABASE_URL="postgresql://user:pass%40word@aws-0-region.pooler.supabase.com:5432/postgres"
```

---

### Port 3000 already in use

**Error:** `error: listen EADDRINUSE: address already in use :::3000`

**Solution:**
```bash
# Find process on port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
npm run dev -- -p 3001
```

Callback Google terdaftar di port 3000, jadi login gagal bila aplikasi berjalan di port lain.

---

### Prisma schema out of sync

**Error:** `The Prisma schema validation warnings should not block the Prisma CLI`

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

Project ini memakai `db push`, bukan folder migrasi. Hindari `prisma migrate reset` pada basis data yang berisi data sungguhan — perintah itu mengosongkan seluruh tabel.

---

### npm install fails with peer dependency errors

**Error:** `npm ERR! peer dep missing`

**Solution:**
```bash
# Install with legacy peer deps
npm install --legacy-peer-deps

# Or use npm ci
npm ci
```

---

### TypeScript compilation errors

**Error:** `TS2305: Module not found` or type errors

**Solution:**
```bash
# Regenerate types
npx prisma generate

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

---

## Scripts

```bash
npm run dev              # Development server with hot-reload
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint and fix issues
npm run test             # Run the Vitest suite once
npm run test:watch       # Run Vitest in watch mode
npm run db:generate      # Regenerate Prisma client
npm run typecheck        # Type-check the whole project without emitting
npm run db:push          # Push schema without a migration (throwaway DB only)
npm run db:migrate       # Create and apply a migration (development)
npm run db:deploy        # Apply pending migrations (production)
npm run db:seed          # Seed demo forms for every template
npm run db:studio        # Open Prisma Studio (database GUI)
```

---

## Deploy Checklist

Sebelum melepas ke publik:

1. **Migrasi, bukan push.** Jalankan `npm run db:deploy` memakai koneksi
   langsung ke Postgres. Migrasi tidak bisa lewat pooler:
   ```bash
   DATABASE_URL="$DIRECT_URL" npm run db:deploy
   ```
2. **Pooler untuk aplikasinya.** `DATABASE_URL` yang dipakai aplikasi harus URL
   pooler (`?pgbouncer=true&connection_limit=1`). Tanpa itu, tiap instance
   serverless membuka pool sendiri dan koneksi Postgres habis di bawah trafik.
3. **Rahasia server tanpa prefix publik.** `SUPABASE_SERVICE_ROLE_KEY` dan
   `SUPABASE_SECRET_KEY` tidak boleh pernah diberi prefix `NEXT_PUBLIC_` — apa pun dengan prefix itu ikut terkirim ke browser.
   Lihat `.env.example` untuk daftar lengkapnya.
4. **CI hijau.** `.github/workflows/ci.yml` menjalankan lint, typecheck, test,
   dan build di tiap PR. Jangan deploy dari branch yang merah.
5. **Log terbaca.** Kegagalan API keluar sebagai satu baris JSON berisi
   `requestId`, `route`, dan `errorMessage`. Pengguna menerima requestId yang
   sama pada pesan errornya, jadi laporan bisa langsung dicocokkan ke log.

### Batas yang diketahui

- **Rate limit disimpan di memori instance.** Cukup untuk menahan banjir dari
  satu sumber, tapi di banyak instance tiap instance punya jatah sendiri. Kalau
  trafik tumbuh, ganti isi `src/shared/lib/rateLimit.ts` dengan penyimpanan
  bersama (mis. Redis) — pemanggilnya tidak perlu diubah.
- **Belum ada agregator error pihak ketiga.** Log terstruktur sudah siap
  di-parse; menyambungkannya ke Sentry/Logtail tinggal menambahkan pengirim di
  `src/shared/lib/logger.ts`.

---

## Documentation

- **[CODE.md](./CODE.md)** — Architecture guide, naming conventions, component patterns, and project structure rules
- **[PRD.md](./PRD.md)** — Product requirements, feature status, and architecture decisions
- **[TEST_CASE.md](./TEST_CASE.md)** — Test cases mapped to requirement IDs, automated and manual
- **[Prisma Docs](https://www.prisma.io/docs)** — Database ORM documentation
- **[Next.js Docs](https://nextjs.org/docs)** — Framework documentation
- **[Supabase Docs](https://supabase.com/docs)** — Auth, Storage, and Postgres documentation
- **[Tailwind CSS](https://tailwindcss.com/docs)** — Utility-first CSS framework
- **[Shadcn/UI](https://ui.shadcn.com)** — Component library documentation

---

## License

MIT
