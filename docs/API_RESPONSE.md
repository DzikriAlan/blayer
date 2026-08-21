# Kontrak Jawaban API

Semua rute di bawah `/api/v1` menjawab dengan satu bentuk yang sama, berhasil
maupun gagal.

## Berhasil

```json
{
  "success": true,
  "status": 200,
  "message": "Katalog form publik berhasil dimuat",
  "data": [],
  "meta": {
    "request_id": "mt37df21-r5dmn3",
    "timestamp": "2026-08-21T17:08:01.633Z",
    "version": "v1"
  },
  "errors": null
}
```

## Gagal

```json
{
  "success": false,
  "status": 400,
  "message": "Validasi gagal",
  "data": null,
  "meta": {
    "request_id": "mt37do7f-v200u1",
    "timestamp": "2026-08-21T17:08:12.148Z",
    "version": "v1"
  },
  "errors": [
    {
      "code": "INVALID_CREDENTIALS_FORMAT",
      "field": "username",
      "message": "Username minimal 3 karakter."
    }
  ]
}
```

`data` selalu `null` saat gagal, dan `errors` selalu `null` saat berhasil.
`status` di dalam badan selalu sama dengan status HTTP, karena keduanya dikirim
dari satu tempat: `src/shared/lib/apiResponse.ts`.

`request_id` sama dengan header `X-Request-Id`, sehingga satu kegagalan bisa
dilacak dari laporan pengguna sampai ke baris log.

## Paginasi — berbeda dari usulan awal

Usulannya memakai `page`, `total`, dan `total_pages`. Yang dikirim:

```json
"pagination": { "limit": 20, "next_cursor": "cmszw...", "has_more": true }
```

Dua alasan, keduanya bisa diukur:

**Nomor halaman tidak punya arti di sini.** Paginasinya berbasis cursor. Kalau
ada baris baru masuk di antara dua permintaan, "halaman 2" bergeser dan satu
baris terlewat atau muncul dua kali. Cursor menunjuk posisi, bukan urutan.

**`total` dan `total_pages` menuntut `COUNT` di setiap permintaan**, dan
`page` menuntut `OFFSET`. Itu justru yang dihindari: diukur pada 10.000 baris,
halaman terakhir memakan 7,3 ms lewat cursor dan 63,2 ms lewat OFFSET, dan
selisihnya melebar seiring tabel bertambah besar.

Kalau nomor halaman tetap dibutuhkan untuk sebuah layar, itu bisa ditambahkan
pada rute tertentu saja — tetapi sebaiknya bukan pada katalog publik dan daftar
jawaban, yang keduanya tumbuh tanpa batas.

## Penamaan field

Prefiks entitas dibuang kalau objeknya memang subjek yang dimaksud, dan nama
media diseragamkan.

| Lama              | Baru             |
| ----------------- | ---------------- |
| `bannerUrl`       | `image`          |
| `qrisUrl`         | `qrisImage`      |
| `videoUrl`        | `video`          |
| `meetingUrl`      | `meeting`        |
| `respondentName`  | `name`           |
| `respondentEmail` | `email`          |
| `priceAmount`     | `price`          |
| `durationSeconds` | `duration`       |
| `formTitle`       | `title`          |
| `totalField`      | `totalFields`    |
| `totalResponse`   | `totalResponses` |

Tetap: `formId`, `templateId`, `userId`, `createdAt`, `isPublished`,
`isAiEnabled` — semuanya menunjuk entitas atau keadaan lain, bukan subjek objek
itu sendiri.

Nama ini berlaku dua arah: badan permintaan juga memakainya. **Nama kolom
database tidak ikut berubah** — pemetaan antara kontrak dan kolom dilakukan di
`src/shared/lib/formsInput.ts` dan di masing-masing rute, di satu tempat saja.

## Sisi klien

`src/shared/lib/apiClient.ts` membuka amplopnya:

- `getApiData<T>(res)` untuk jawaban objek tunggal
- `getApiPage<T>(res)` untuk jawaban berdaftar, sekaligus membaca cursornya

Service tidak boleh membaca `res.json()` langsung; yang lupa membuka amplop akan
meneruskan seluruh amplop ke komponen, dan itu muncul sebagai layar kosong tanpa
pesan galat.
