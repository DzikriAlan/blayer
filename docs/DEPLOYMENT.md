# Konfigurasi Deployment

Variabel yang harus terisi di lingkungan produksi. Yang ditandai **wajib**
mengubah perilaku keamanan secara nyata kalau dibiarkan kosong — bukan sekadar
mematikan fitur.

> `.env.example` belum memuat empat variabel terbawah. Salin bagian itu ke sana.

## Rate limit

Tidak ada yang wajib diisi. Di produksi hitungannya disimpan di Postgres yang
sudah dipakai aplikasi, lewat tabel `rate_limit_hits`, sehingga batasnya berlaku
lintas instance tanpa layanan tambahan.

Redis opsional, dan dipakai kalau ada — lebih cepat, dan tidak menambah beban ke
basis data:

```
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

Pilihan penyimpanan bisa dipaksa lewat `RATE_LIMIT_STORE` bernilai `postgres`
atau `memory`. **Jangan pakai `memory` di produksi serverless**: setiap instance
punya salinannya sendiri dan kehilangannya saat cold start, jadi batasnya bisa
dilewati dengan memaksa instance baru. Kalau tetap dipaksa, log produksi akan
memperingatkannya.

## Alamat pemanggil — wajib

```
TRUST_PROXY_HOPS=1
```

Jumlah proxy tepercaya di depan aplikasi. `1` benar untuk Vercel. Tambahkan satu
untuk setiap CDN di depannya.

Tanpa ini `X-Forwarded-For` diabaikan seluruhnya dan alamat soket yang dipakai —
aman, tetapi di belakang proxy semua pemanggil terlihat sebagai satu alamat,
sehingga satu pengunjung bisa menghabiskan kuota pengunjung lain. Diisi terlalu
besar juga berbahaya: header itu ditulis klien, dan menghitung terlalu jauh ke
kiri membuat alamat karangan ikut dipercaya.

## Pengiriman surat — wajib untuk pemulihan akun

```
RESEND_API_KEY=re_xxx
MAIL_FROM=noreply@domainmu.com
```

`MAIL_FROM` baru bisa diisi setelah domainnya diverifikasi di dashboard Resend.
Sebelum itu, pengirimnya jatuh ke `onboarding@resend.dev`, dan alamat percobaan
Resend hanya boleh mengirim ke alamat pemilik akun Resend itu sendiri —
**belum ada domain terverifikasi di akun ini** (dicek lewat `GET /domains`).

Artinya sampai domain diverifikasi, tautan pemulihan hanya sampai ke alamatmu
sendiri, bukan ke pengguna lain. Itu cukup untuk menguji alurnya, tidak cukup
untuk dibuka ke publik.

## Alert kegagalan — opsional

```
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

Menerima `logger.error`. Field yang menunjuk orang — IP, email, nama responden,
token, stack — disaring sebelum dikirim, dan pesan yang sama didiamkan lima
menit supaya satu insiden tidak membanjiri kanal. Kosongkan untuk mematikannya.

## Benchmark — opsional, jangan diisi di produksi

```
BENCHMARK_DATABASE_URL=postgresql://...
```

Hanya dipakai `npx vitest run test/benchmark`. Menulis sepuluh ribu baris, jadi
arahkan ke basis data sekali pakai, tidak pernah ke produksi.

Hasil pengukuran terakhir, 10.000 baris di Postgres lokal:

| Cara | Halaman terakhir |
|---|---|
| cursor (halaman pertama sebagai acuan) | 37,7 ms |
| cursor, setelah 199 halaman | **7,3 ms** |
| OFFSET ke posisi yang sama | 63,2 ms |

Biaya per halaman tidak tumbuh mengikuti posisi — itu yang membedakan cursor
dari OFFSET, dan itu yang membuat index komposit di migrasi kedua penting.

## Basis data

Skema dikelola migrasi, bukan `db:push` — script itu sengaja dibuat gagal.

```
npx prisma migrate deploy
```

Kalau basis datanya pernah dibuat lewat `db:push`, riwayat migrasinya kosong dan
`deploy` akan mencoba menjalankan `0_init` di atas tabel yang sudah ada.
Baseline dulu satu kali:

```
npx prisma migrate resolve --applied 0_init
```

## Setelah deploy pertama

Buka [SUPABASE_AUDIT.md](SUPABASE_AUDIT.md). Sisa itemnya hanya bisa diperiksa
dari dashboard Supabase, dan salah satunya — daftar Redirect URL — menentukan
apakah login Google berfungsi di domain produksi.

## Pesan konsol yang bisa diabaikan di mode dev

```
Refused to execute script from '/_next/static/development/_clientMiddlewareManifest.js'
because its MIME type ('application/json') is not executable
```

Server dev Next 16 menyajikan berkas berekstensi `.js` dengan MIME JSON, dan
header `X-Content-Type-Options: nosniff` menolaknya. Ini bukan pelanggaran CSP
dan tidak muncul di build produksi. Aplikasi tetap berjalan penuh — diuji sampai
login berhasil dan daftar form ter-render.
