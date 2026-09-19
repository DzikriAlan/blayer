# Menjalankan Blayer sendiri

Blayer dirancang untuk hidup di infrastrukturmu. Tidak ada server pusat yang
menyimpan kunci provider, konfigurasi agent, atau catatan eksekusimu.

## Docker Compose

```bash
cp .env.docker.example .env.docker
# isi BLAYER_ENCRYPTION_KEY: openssl rand -base64 32
# ganti BLAYER_ADMIN_PASSWORD dari bawaannya

docker compose --env-file .env.docker up -d
docker compose exec app npx prisma migrate deploy
```

Aplikasinya jalan di `http://localhost:3000`, basis datanya di volume
`blayer-db`. Masuk Console dengan kredensial yang kamu setel di `.env.docker`.

| Layanan | Isinya |
|---|---|
| `db` | PostgreSQL 16, data di volume `blayer-db` |
| `app` | Blayer, build standalone dari `Dockerfile` |

## Tanpa Docker

```bash
npm ci
npx prisma generate
npm run db:deploy      # menerapkan migrasi
npm run build
npm run start
```

Butuh Node.js 20.9+ dan PostgreSQL 14+.

## Variabel yang wajib

| Variabel | Gunanya |
|---|---|
| `DATABASE_URL` | Koneksi PostgreSQL |
| `BLAYER_ENCRYPTION_KEY` | 32 byte acak base64; membuka kredensial provider dan integration |

`BLAYER_ENCRYPTION_KEY` tidak boleh berganti setelah ada kredensial tersimpan —
kredensial lama akan gagal dibuka dan eksekusi agent menjawab
`503 CONFIG_MISSING`. Simpan seperti rahasia produksi lain.

Kredensial Console (`BLAYER_ADMIN_USERNAME`, `BLAYER_ADMIN_PASSWORD`) punya
bawaan `admin` / `admin123` supaya instance baru langsung bisa dibuka. Console
memasang spanduk peringatan selama masih memakainya. Selengkapnya di
[README](../README.md#2-siapkan-environment).

## Di balik proxy

Setel `TRUST_PROXY_HOPS` sesuai jumlah proxy tepercaya di depan aplikasi. Tanpa
itu rate limit membaca IP proxy, bukan IP pemanggil, dan seluruh trafik terhitung
sebagai satu sumber.

## Rate limit lintas instance

Bawaannya memakai PostgreSQL yang sudah dipakai aplikasi (`RATE_LIMIT_STORE=postgres`),
jadi batasnya berlaku lintas instance tanpa layanan tambahan. Redis (Upstash REST)
dipakai kalau kredensialnya tersedia.

## Memperbarui

```bash
git pull
docker compose --env-file .env.docker up -d --build
docker compose exec app npx prisma migrate deploy
```

Migrasi selalu maju lewat `prisma migrate deploy`; `db push` sengaja diblokir
supaya tiap perubahan skema punya jejak dan bisa diputar balik.
