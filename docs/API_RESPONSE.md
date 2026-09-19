# Kontrak Jawaban API

Bentuknya mengikuti [standards/RESPONSE.md](../standards/RESPONSE.md): satu
amplop untuk semua rute `/api/v1`, dengan `success` sebagai penandanya.

## Berhasil — satu data

```json
{
  "success": true,
  "data": { "id": "clz…", "name": "EasyAccounting" },
  "message": "Project berhasil dibuat",
  "meta": {
    "requestId": "mu8hsek1-ly6ksd",
    "timestamp": "2026-09-19T14:38:08.253Z"
  }
}
```

## Berhasil — koleksi

Rute yang berhalaman menambahkan `pagination`:

```json
{
  "success": true,
  "data": { "summary": {}, "runs": [] },
  "pagination": { "page": 1, "limit": 20, "total": 128, "totalPages": 7 },
  "message": "Riwayat eksekusi berhasil dimuat",
  "meta": { "requestId": "…", "timestamp": "…" }
}
```

## Gagal

```json
{
  "success": false,
  "error": {
    "code": "AGENT_NOT_PUBLISHED",
    "message": "Agent ini belum punya versi yang dipublikasikan.",
    "details": null
  },
  "meta": { "requestId": "…", "timestamp": "…" }
}
```

`details` hanya terisi pada kegagalan validasi, berupa daftar pesan per field:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Data yang dikirim tidak valid.",
    "details": {
      "password": ["password wajib diisi."],
      "maxTokens": ["Batas token minimal 256."]
    }
  }
}
```

Jawaban sukses tidak pernah membawa `error`, dan jawaban gagal tidak pernah
membawa `data` — field yang tidak relevan memang dihilangkan, bukan diisi null.

## meta.requestId

`requestId` sama dengan header `X-Request-Id` dan dengan `requestId` di log,
sehingga satu laporan pengguna bisa dilacak sampai ke baris lognya. Pada
kegagalan 500, pesannya sengaja tidak menyebut sebab teknis — hanya kode itu.

## Status HTTP

| Status | Dipakai untuk |
|---|---|
| `200` | Berhasil (GET, PUT, DELETE) |
| `201` | Sumber daya baru dibuat |
| `401` | Kredensial tidak dikirim atau tidak dikenal |
| `403` | Dikenali, tapi tidak berwenang |
| `404` | Tidak ditemukan (termasuk milik project lain) |
| `405` | Method tidak dilayani rute itu |
| `409` | Bentrok keadaan (slug dipakai, agent belum publish, konfirmasi sudah diputuskan) |
| `422` | Validasi gagal, atau model menolak permintaan |
| `429` | Melewati batas laju |
| `500` | Kegagalan tak terduga |
| `503` | Instance belum siap (basis data mati, konfigurasi kurang, provider membatasi) |
