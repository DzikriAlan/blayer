# Checklist Audit Konfigurasi Dashboard Supabase (Produksi)

Daftar periksa untuk konfigurasi Supabase di produksi.

**Status: belum diaudit.** Kotak di bawah sengaja kosong. Semua item di sini
adalah setelan di dashboard Supabase yang tidak bisa dibaca dari repositori,
jadi hanya orang dengan akses dashboard yang boleh mencentangnya. Menandainya
selesai tanpa membuka dashboard membuat orang berikutnya berhenti memeriksa.

## Sudah terverifikasi lewat API, bukan diasumsikan

- Provider `google` dan `email` aktif (`GET /auth/v1/settings`).
- `SUPABASE_SERVICE_ROLE_KEY` tidak pernah muncul di modul yang terbundel ke
  klien; `.env` tidak ada di riwayat git.
- Bucket `form-banners`: `public = true`, `file_size_limit = 4000000`,
  `allowed_mime_types` hanya lima tipe gambar, SVG tidak termasuk.
- RLS aktif di `forms`, `form_fields`, `form_responses`, `form_analyses`.
  Diuji dengan `SET ROLE anon`: baca 0 baris, update 0 baris, delete 0 baris.

## Temuan kritis, sudah ditutup

Sebelum 20 Agustus 2026, RLS mati di seluruh tabel tanpa satu pun policy.
Karena Supabase mengekspos skema `public` lewat `/rest/v1` memakai anon key —
dan anon key ikut terkirim ke setiap peramban — siapa pun pengunjung bisa
membaca, mengubah, dan menghapus seluruh baris tanpa melewati satu pun
pemeriksaan otorisasi di API. Terbukti: `GET /rest/v1/forms` mengembalikan
data, `PATCH` dan `DELETE` dijawab `204`.

Ditutup oleh migrasi `20260820010000_enable_row_level_security`. Aplikasi tidak
terpengaruh karena Prisma menyambung sebagai `postgres` yang ber-`BYPASSRLS`.

## Sisa yang hanya bisa dibuka dari dashboard

---

### Authentication & Redirect URLs

Nilai sebenarnya untuk project ini, bukan contoh:

- [ ] **Site URL** = `https://www.blayer.id`
- [ ] **Redirect URLs** memuat semuanya:
  - `https://www.blayer.id/**`
  - `http://localhost:3002/**` (port dev aplikasi ini adalah 3002, bukan 3000)
- [ ] **Providers - Google**: Client ID dan Client Secret harus sama persis
  dengan yang ada di Google Cloud. Setelah secret diputar di Google Cloud, nilai
  di sini wajib ikut diperbarui — kalau tidak, login Google gagal dengan
  `Unable to exchange external code`.

### Google Cloud Console

- [ ] **Authorized redirect URIs** pada OAuth Client memuat:
  `https://aimwbpgrlugnbpdqeuuw.supabase.co/auth/v1/callback`

  Ini alamat Supabase, bukan alamat aplikasi. Google mengirim kode ke Supabase,
  lalu Supabase yang mengalihkan ke aplikasi.

### Tabel di luar skema Prisma

Tabel `tasks` ada di skema `public` tetapi tidak dikenal Prisma dan tidak dipakai
aplikasi ini. Isinya kosong (0 baris, diperiksa 20 Agustus 2026), dan RLS-nya
sudah dinyalakan lewat migrasi `20260820040000_tasks_rls`.

- [ ] Putuskan apakah tabel itu masih diperlukan. Kalau tidak, hapus. Selama ia
  ada tetapi tidak ada di `schema.prisma`, `prisma migrate dev` akan menawarkan
  untuk menghapusnya — dan itu berarti perintah rutin bisa membuang tabel milik
  pekerjaan lain tanpa disengaja.
