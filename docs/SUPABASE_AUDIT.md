# Checklist Audit Konfigurasi Dashboard Supabase (Produksi)

Daftar periksa untuk konfigurasi Supabase di produksi.

**Status: belum diaudit.** Kotak di bawah sengaja kosong. Semua item di sini
adalah setelan di dashboard Supabase yang tidak bisa dibaca dari repositori,
jadi hanya orang dengan akses dashboard yang boleh mencentangnya. Menandainya
selesai tanpa membuka dashboard membuat orang berikutnya berhenti memeriksa.

## Yang sudah terverifikasi dari kode

Dua hal ini diperiksa lewat API Supabase, bukan diasumsikan:

- Provider `google` dan `email` aktif (`GET /auth/v1/settings` menjawab
  `external.google = true`, `external.email = true`).
- `SUPABASE_SERVICE_ROLE_KEY` tidak pernah muncul di modul yang terbundel ke
  klien; `.env` tidak ada di riwayat git.

Sisanya di bawah masih perlu dibuka satu per satu.

---

## 1. Kebijakan Storage Bucket (`form-banners`)

- [ ] **Tipe Bucket:** Set ke `Public` (agar banner form & aset QRIS dapat dimuat oleh pengisi form tanpa autentikasi).
- [ ] **File Size Limit:** Batasi ukuran maksimum unggahan file (mis. **5MB** per file) di menu *Bucket Settings*.
- [ ] **Allowed MIME Types:** Batasi MIME type yang diizinkan hanya pada gambar: `image/jpeg`, `image/png`, `image/webp`, `image/gif`, `image/avif`. (SVG dilarang karena berisiko eksekusi skrip).

---

## 2. Authentication & Redirect URLs

- [ ] **Site URL:** Atur `Site URL` produksi (mis. `https://blayer.app`).
- [ ] **Redirect URLs:** Pastikan daftar `Additional Redirect URLs` hanya berisi domain tepercaya dan callback sah:
  - `http://localhost:3000/auth/callback` (hanya untuk pengujian lokal)
  - `http://localhost:3002/auth/callback`
  - `https://blayer.app/auth/callback`
  - `https://blayer.app/auth/reset-password`
- [ ] **OAuth Providers:** Google OAuth dikonfigurasi dengan Client ID & Client Secret resmi di dashboard Supabase (*Authentication -> Providers -> Google*).

---

## 3. Database & Row Level Security (RLS) Policies

- [ ] **Akses API Server:** Seluruh pembacaan/penulisan basis data dilakukan melalui API Server Next.js menggunakan `DATABASE_URL` / Prisma ORM yang memvalidasi `userId` milik pengguna terautentikasi (401 & 403 enforcement).
- [ ] **Proteksi Anon Key Direct Access:** Jika tabel diakses via PostgREST/Supabase client langsung, aktifkan `Row Level Security (RLS)` pada tabel `forms`, `form_fields`, `form_responses`, dan `form_analyses`.

---

## 4. API Keys & Environment Variables Security

- [ ] `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Key publik aman terkirim ke peramban.
- [ ] `SUPABASE_SERVICE_ROLE_KEY`: Key rahasia tingkat tinggi, **HANYA** disimpan pada environment server (bukan `NEXT_PUBLIC_`) dan dilarang terekspos ke klien browser.
