# Agent API

Semua rute di bawah `/api/v1` menjawab dengan amplop yang sama seperti dijelaskan
di [API_RESPONSE.md](./API_RESPONSE.md).

## Dua jenis kredensial

| Kredensial | Dipakai siapa | Cara mengirim |
|---|---|---|
| **Token pengelolaan** — isi `BLAYER_ADMIN_TOKEN` | Operator instance (Console) | `Authorization: Bearer <token>` |
| **API key project** — diterbitkan per project, berawalan `blr_` | Project consumer | `Authorization: Bearer blr_…` |

Token pengelolaan membuka seluruh rute konfigurasi. API key project hanya boleh
menjalankan agent, selalu pada versi production dan pada environment yang melekat
di kuncinya. Rute pengelolaan menjawab `503 CONFIG_MISSING` selama
`BLAYER_ADMIN_TOKEN` belum disetel — bukan terbuka tanpa penjagaan.

Token API key hanya utuh sekali, pada jawaban pembuatannya. Yang tersimpan di
basis data adalah hash SHA-256 dan dua belas karakter awalnya.

## Ringkasan rute

| Rute | Method | Kredensial | Gunanya |
|---|---|---|---|
| `/api/v1/projects` | GET, POST | pengelolaan | Daftar & pembuatan project |
| `/api/v1/projects/{projectId}` | GET | pengelolaan | Project beserta agent, key, dan kredensialnya |
| `/api/v1/projects/{projectId}/keys` | GET, POST | pengelolaan | API key project |
| `/api/v1/projects/{projectId}/credentials` | GET, PUT | pengelolaan | Kunci provider AI per environment |
| `/api/v1/agents` | GET, POST | pengelolaan | Daftar & pembuatan agent |
| `/api/v1/agents/{agentId}` | GET, PUT, DELETE | pengelolaan | Agent beserta seluruh versinya |
| `/api/v1/agents/{agentId}/versions` | GET, POST | pengelolaan | Riwayat versi & pembuatan draf |
| `/api/v1/agents/{agentId}/publish` | POST | pengelolaan | Menaikkan satu versi ke production |
| `/api/v1/agents/{agentId}/run` | POST | pengelolaan **atau** API key project | Menjalankan agent |
| `/api/v1/agents/{agentId}/runs` | GET | pengelolaan | Riwayat eksekusi & ringkasannya |
| `/api/v1/models` | GET | pengelolaan | Katalog model beserta harga dan kemampuannya |

## Menjalankan agent

```bash
curl -X POST http://localhost:3002/api/v1/agents/$AGENT_ID/run \
  -H "Authorization: Bearer $BLAYER_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"input":"Berapa laba bulan lalu?"}'
```

```json
{
  "success": true,
  "status": 200,
  "message": "Agent berhasil dijalankan",
  "data": {
    "runId": "clz…",
    "agentId": "clz…",
    "version": 3,
    "versionId": "clz…",
    "environment": "PRODUCTION",
    "provider": "ANTHROPIC",
    "model": "claude-opus-5",
    "output": "…",
    "stopReason": "end_turn",
    "latencyMs": 2140,
    "inputTokens": 1000,
    "outputTokens": 500,
    "costUsd": 0.0175
  },
  "meta": { "request_id": "…", "timestamp": "…", "version": "v1" },
  "errors": null
}
```

Badan permintaan:

| Field | Wajib | Catatan |
|---|---|---|
| `input` | ya | 1–20.000 karakter |
| `versionId` | tidak | Hanya untuk token pengelolaan (Playground). API key project ditolak `403 VERSION_NOT_ALLOWED` |
| `environment` | tidak | Hanya untuk token pengelolaan; bawaannya `DEVELOPMENT`. API key project selalu memakai environment kuncinya |

Batas laju: 60 eksekusi per menit per project.

## Membuat agent

```bash
curl -X POST http://localhost:3002/api/v1/agents \
  -H "Authorization: Bearer $BLAYER_ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
        "projectId": "'"$PROJECT_ID"'",
        "name": "Accounting Assistant",
        "slug": "accounting-assistant",
        "instructions": "Jawab pertanyaan akuntansi hanya dari hasil tool.",
        "provider": "ANTHROPIC",
        "model": "claude-opus-5",
        "effort": "HIGH",
        "maxTokens": 16000
      }'
```

Agent lahir bersama draf versi 1. Menyimpan perubahan konfigurasi lewat
`POST /versions` selalu membuat draf bernomor berikutnya — versi yang sedang
melayani production tidak pernah berubah diam-diam. `POST /publish` memindahkan
production ke versi yang dipilih dan mengarsipkan yang lama, jadi rollback cukup
mempublikasikan versi sebelumnya kembali.

## Konfigurasi model

| Field | Nilai | Bawaan |
|---|---|---|
| `provider` | `ANTHROPIC`, `OPENAI` | `ANTHROPIC` |
| `model` | Model Anthropic wajib ada di katalog; provider lain menerima id apa adanya | `claude-opus-5` |
| `effort` | `LOW`, `MEDIUM`, `HIGH`, `XHIGH`, `MAX` | `HIGH` |
| `maxTokens` | 256–64.000 | 16.000 |
| `temperature` | 0–2, atau `null` | `null` |
| `instructions` | 10–20.000 karakter | wajib |

Kemampuan tiap model dipelihara di katalog (`GET /api/v1/models`). Model yang
menolak sampling tidak dikirimi `temperature`, dan model yang penalarannya selalu
menyala tidak dikirimi parameter thinking — jadi konfigurasi yang tidak berlaku
diabaikan, bukan membuat permintaannya ditolak provider.

Penolakan model (`stop_reason: refusal`) dikembalikan apa adanya sebagai eksekusi
gagal. Tidak ada pengalihan diam-diam ke model cadangan: agent selalu dilayani
versi dan model yang tercatat di riwayatnya.

## Kredensial provider

```bash
curl -X PUT http://localhost:3002/api/v1/projects/$PROJECT_ID/credentials \
  -H "Authorization: Bearer $BLAYER_ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"provider":"ANTHROPIC","environment":"PRODUCTION","secret":"sk-ant-…"}'
```

Kunci disimpan terenkripsi (AES-256-GCM) dengan `BLAYER_ENCRYPTION_KEY` milik
instance ini, dipisahkan per project dan per environment, dan tidak pernah bisa
dibaca kembali lewat API — yang keluar hanya empat karakter terakhirnya.

## Observability

`GET /api/v1/agents/{agentId}/runs` mengembalikan ringkasan (jumlah eksekusi,
success rate, rata-rata latency, total token, total biaya) beserta riwayatnya
dengan paginasi cursor. Eksekusi yang gagal ikut tercatat lengkap dengan kode
kesalahannya — tanpa itu success rate hanya menghitung yang berhasil dan selalu
terlihat sempurna.

## Kode kesalahan

| Kode | Status | Artinya |
|---|---|---|
| `UNAUTHORIZED` | 401 | Kredensial tidak dikirim atau tidak dikenal |
| `VERSION_NOT_ALLOWED` | 403 | API key project mencoba memilih versi |
| `AGENT_NOT_FOUND` | 404 | Agent tidak ada, atau milik project lain |
| `PROJECT_NOT_FOUND` | 404 | Project tidak ada |
| `VERSION_NOT_FOUND` | 404 | Versi bukan milik agent itu |
| `SLUG_TAKEN` | 409 | Slug sudah dipakai |
| `AGENT_NOT_PUBLISHED` | 409 | Agent belum punya versi production |
| `PROVIDER_KEY_MISSING` | 409 | Project belum punya kunci provider di environment itu |
| `INVALID_INPUT` | 400 | Validasi badan permintaan gagal; `field` menyebut isiannya |
| `AGENT_REFUSED` | 422 | Model menolak permintaan |
| `RATE_LIMITED` | 429 | Melewati batas laju |
| `PROVIDER_UNAUTHORIZED` | 502 | Kunci provider ditolak vendornya |
| `PROVIDER_FAILED` | 502 | Provider menjawab gagal atau jawabannya tidak terbaca |
| `PROVIDER_UNREACHABLE` | 502 | Provider tidak bisa dihubungi |
| `PROVIDER_RATE_LIMITED` | 503 | Provider sedang membatasi permintaan |
| `CONFIG_MISSING` | 503 | Instance belum disetel (`BLAYER_ADMIN_TOKEN`/`BLAYER_ENCRYPTION_KEY`) |
