# Agent API

Semua rute di bawah `/api/v1` menjawab dengan amplop yang sama seperti dijelaskan
di [API_RESPONSE.md](./API_RESPONSE.md).

## Dua jenis kredensial

| Kredensial | Dipakai siapa | Cara mengirim |
|---|---|---|
| **Sesi pengelolaan** — hasil login, berawalan `blas_` | Operator instance (Console) | `Authorization: Bearer blas_…` |
| **Token pengelolaan mentah** — isi `BLAYER_ADMIN_TOKEN`, opsional | Skrip, CI, curl | `Authorization: Bearer <token>` |
| **API key project** — diterbitkan per project, berawalan `blr_` | Project consumer | `Authorization: Bearer blr_…` |

Kredensial pengelolaan membuka seluruh rute konfigurasi. API key project hanya
boleh menjalankan agent, selalu pada versi production dan pada environment yang
melekat di kuncinya.

### Masuk

```bash
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

```json
{
  "success": true,
  "data": {
    "token": "blas_…",
    "username": "admin",
    "expiresAt": "2026-09-20T00:53:35.499Z",
    "isDefaultCredentials": true
  },
  "message": "Berhasil masuk",
  "meta": { "requestId": "…", "timestamp": "…" }
}
```

Kredensialnya dibaca dari `BLAYER_ADMIN_USERNAME` dan `BLAYER_ADMIN_PASSWORD`,
dengan bawaan `admin` / `admin123` supaya instance baru langsung bisa dibuka —
`isDefaultCredentials: true` menandai instance yang masih memakainya.

Token sesi ditandatangani (HMAC-SHA256) dan berlaku 12 jam; tidak ada sesi yang
disimpan di basis data, dan mengganti `BLAYER_SESSION_SECRET` membatalkan semua
sesi yang beredar. Rute login dibatasi 10 percobaan per menit per sumber, dan
jawabannya tidak membedakan username salah dari kata sandi salah.

Token API key hanya utuh sekali, pada jawaban pembuatannya. Yang tersimpan di
basis data adalah hash SHA-256 dan dua belas karakter awalnya.

## Ringkasan rute

| Rute | Method | Kredensial | Gunanya |
|---|---|---|---|
| `/api/v1/auth/login` | POST | — | Menukar username + kata sandi dengan token sesi |
| `/api/v1/projects` | GET, POST | pengelolaan | Daftar & pembuatan project |
| `/api/v1/projects/{projectId}` | GET | pengelolaan | Project beserta agent, key, dan kredensialnya |
| `/api/v1/projects/{projectId}/keys` | GET, POST | pengelolaan | API key project |
| `/api/v1/projects/{projectId}/credentials` | GET, PUT | pengelolaan | Kunci provider AI per environment |
| `/api/v1/agents` | GET, POST | pengelolaan | Daftar & pembuatan agent |
| `/api/v1/agents/{agentId}` | GET, PUT, DELETE | pengelolaan | Agent beserta seluruh versinya |
| `/api/v1/agents/{agentId}/versions` | GET, POST | pengelolaan | Riwayat versi & pembuatan draf |
| `/api/v1/agents/{agentId}/publish` | POST | pengelolaan | Menaikkan satu versi ke production |
| `/api/v1/agents/{agentId}/run` | POST | pengelolaan **atau** API key project | Menjalankan agent |
| `/api/v1/agents/{agentId}/sessions` | GET, POST | pengelolaan **atau** API key project | Sesi percakapan (ingatan antar permintaan) |
| `/api/v1/agents/{agentId}/runs` | GET | pengelolaan | Riwayat eksekusi & ringkasannya |
| `/api/v1/runs/{runId}/confirm` | POST | pengelolaan **atau** API key project | Menyetujui atau menolak tool yang mengubah data |
| `/api/v1/projects/{projectId}/integrations` | GET, POST | pengelolaan | Koneksi ke API project beserta kredensialnya |
| `/api/v1/integrations/{integrationId}` | GET, PUT, DELETE | pengelolaan | Satu integration beserta toolnya |
| `/api/v1/integrations/{integrationId}/tools` | GET, POST | pengelolaan | Kontrak tool di bawah integration itu |
| `/api/v1/tools/{toolId}` | PUT, DELETE | pengelolaan | Ubah atau hapus satu kontrak tool |
| `/api/v1/projects/{projectId}/knowledge` | GET, POST | pengelolaan | Dokumen pengetahuan project |
| `/api/v1/knowledge/{documentId}` | GET, PUT, DELETE | pengelolaan | Satu dokumen pengetahuan |
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
    "costUsd": 0.0175,
    "status": "SUCCEEDED",
    "toolCalls": [],
    "pendingToolCall": null
  },
  "message": "Agent berhasil dijalankan",
  "meta": { "requestId": "…", "timestamp": "…" }
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

## Tool

Tool hidup di bawah sebuah **Integration** — satu koneksi ke API milik project,
berisi base URL dan kredensialnya. Yang tersimpan di Blayer hanya kontraknya:

```bash
curl -X POST http://localhost:3002/api/v1/integrations/$INTEGRATION_ID/tools \
  -H "Authorization: Bearer $BLAYER_ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{
        "name": "get_profit_loss",
        "description": "Ambil laporan laba rugi satu periode.",
        "method": "GET",
        "path": "/ai/tools/profit-loss",
        "permission": "READ",
        "inputSchema": {
          "type": "object",
          "properties": { "month": { "type": "string" } },
          "required": ["month"]
        }
      }'
```

Saat agent berjalan, Blayer memanggil `baseUrl + path`. Nilai `{nama}` di dalam
path diambil dari masukan tool; sisanya menjadi query untuk GET/DELETE atau body
JSON untuk method lain. Jawaban endpoint dipotong di 8.000 karakter.

Tool dipasang **per versi agent** lewat `toolIds` pada pembuatan draf, jadi versi
lama tetap memakai daftar tool yang berlaku saat ia dipublikasikan.

### Tool yang mengubah data

Tool ber-`permission: "WRITE"` tidak pernah dijalankan langsung. Eksekusi
berhenti, jawabannya membawa `status: "PENDING_CONFIRMATION"` dan
`pendingToolCall`, lalu menunggu:

```bash
curl -X POST http://localhost:3002/api/v1/runs/$RUN_ID/confirm \
  -H "Authorization: Bearer $BLAYER_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"toolCallId":"clz…","decision":"CONFIRM"}'
```

`CONFIRM` menjalankan toolnya lalu melanjutkan percakapan; `REJECT` tidak
menjalankan apa pun tapi tetap memberi tahu model, sehingga ia bisa menjawab
pengguna dengan layak. Tiap eksekusi dibatasi enam putaran tool.

## Knowledge

Dokumen disimpan per project lalu dipasang ke versi agent lewat `documentIds`.
Isinya ikut dikirim sebagai rujukan di system prompt, terpisah dari instruksi,
dengan batas 24.000 karakter per eksekusi.

## Memory

Sesi menyimpan percakapan supaya agent mengingat pesan sebelumnya:

```bash
SESSION=$(curl -s -X POST http://localhost:3002/api/v1/agents/$AGENT_ID/sessions \
  -H "Authorization: Bearer $BLAYER_API_KEY" -H 'Content-Type: application/json' \
  -d '{}' | jq -r .data.id)

curl -X POST http://localhost:3002/api/v1/agents/$AGENT_ID/run \
  -H "Authorization: Bearer $BLAYER_API_KEY" -H 'Content-Type: application/json' \
  -d "{\"input\":\"Siapa nama saya?\",\"sessionId\":\"$SESSION\"}"
```

Dua puluh pesan terakhir ikut dikirim ke model. Environment sesi mengikuti kunci
pemanggilnya, sehingga ingatan development tidak tercampur dengan production.

## Guardrail

Selain konfirmasi tool tulis, tiap eksekusi membawa aturan tetap di system
prompt: jangan mengarang angka, ambil data lewat tool, jelaskan dulu apa yang
akan diubah, dan jawab dalam bahasa penanya. Aturan ini ditambahkan Blayer, tidak
bisa dihapus lewat instruksi agent.

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
| `UNAUTHORIZED` | 401 | Kredensial tidak dikirim, tidak dikenal, atau sesinya kedaluwarsa |
| `INVALID_CREDENTIALS` | 401 | Username atau kata sandi salah |
| `VERSION_NOT_ALLOWED` | 403 | API key project mencoba memilih versi |
| `AGENT_NOT_FOUND` | 404 | Agent tidak ada, atau milik project lain |
| `PROJECT_NOT_FOUND` | 404 | Project tidak ada |
| `VERSION_NOT_FOUND` | 404 | Versi bukan milik agent itu |
| `INTEGRATION_NOT_FOUND` | 404 | Integration tidak ada |
| `TOOL_NOT_FOUND` | 404 | Tool tidak ada |
| `DOCUMENT_NOT_FOUND` | 404 | Dokumen pengetahuan tidak ada |
| `SESSION_NOT_FOUND` | 404 | Sesi bukan milik agent itu |
| `TOOL_CALL_NOT_FOUND` | 404 | Permintaan konfirmasi tidak ada |
| `TOOL_CALL_RESOLVED` | 409 | Permintaan konfirmasi sudah diputuskan sebelumnya |
| `NAME_TAKEN` | 409 | Nama tool sudah dipakai di integration itu |
| `SLUG_TAKEN` | 409 | Slug sudah dipakai |
| `AGENT_NOT_PUBLISHED` | 409 | Agent belum punya versi production |
| `PROVIDER_KEY_MISSING` | 409 | Project belum punya kunci provider di environment itu |
| `VALIDATION_ERROR` | 422 | Validasi gagal; `error.details` memuat pesan per field |
| `METHOD_NOT_ALLOWED` | 405 | Method tidak dilayani rute itu |
| `ROUTE_NOT_FOUND` | 404 | Alamat tidak terdaftar di tabel rute |
| `AGENT_REFUSED` | 422 | Model menolak permintaan |
| `RATE_LIMITED` | 429 | Melewati batas laju |
| `PROVIDER_UNAUTHORIZED` | 502 | Kunci provider ditolak vendornya |
| `PROVIDER_FAILED` | 502 | Provider menjawab gagal atau jawabannya tidak terbaca |
| `PROVIDER_UNREACHABLE` | 502 | Provider tidak bisa dihubungi |
| `PROVIDER_RATE_LIMITED` | 503 | Provider sedang membatasi permintaan |
| `CONFIG_MISSING` | 503 | Instance belum disetel (`BLAYER_ENCRYPTION_KEY`) |
| `DATABASE_UNAVAILABLE` | 503 | Basis data tidak bisa dihubungi; periksa `DATABASE_URL` |
