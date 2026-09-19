# Evaluasi agent

Menjalankan sekumpulan kasus terhadap agent yang benar-benar hidup, lalu
memeriksa jawabannya. Gunanya satu: sebelum menaikkan versi agent ke production,
pastikan yang dulu benar masih benar.

```bash
BLAYER_URL=http://localhost:3000 \
BLAYER_API_KEY=blr_... \
BLAYER_AGENT_ID=clz... \
npm run eval
```

Keluarannya menyebut kasus yang lolos, yang gagal beserta sebabnya, lalu
rata-rata latency dan total biayanya. Kode keluar `1` kalau ada yang gagal,
sehingga bisa dipasang di pipeline.

## Bentuk kasus

`eval/cases.json` berisi daftar kasus. Tiap kasus punya `input` dan `expect`:

| Kunci | Artinya |
|---|---|
| `status` | Status eksekusi yang diharapkan (`SUCCEEDED`, `PENDING_CONFIRMATION`) |
| `toolCalled` | Nama tool yang wajib dipanggil |
| `pendingTool` | Nama tool yang wajib berhenti menunggu konfirmasi |
| `contains` | Potongan teks yang wajib ada di jawaban |
| `notContains` | Potongan teks yang tidak boleh ada |

Dataset lain bisa dipakai lewat `BLAYER_EVAL_CASES=/path/ke/cases.json`.

Kasus bawaan di repo ini menguji tiga hal yang paling mudah rusak saat prompt
diubah: jawaban yang berlandas hasil tool, penolakan mengarang angka, dan tool
tulis yang berhenti menunggu konfirmasi. Isinya mengacu ke agent contoh — ganti
dengan kasus milikmu sendiri.
