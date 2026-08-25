MVP SYSTEM — BLAYER

✓ ada   ◐ sebagian   ✗ belum

SECURE
✓ Kepemilikan form ditegakkan di API, bukan di UI
✓ RLS sebagai lapis kedua
✓ Draf disamarkan 404 untuk non-pemilik
✓ Link rahasia hanya keluar untuk pemilik
✓ Isi berkas unggahan diperiksa magic-byte
✓ PII disaring dari semua jalur log
◐ Proctoring ujian sisi klien
✗ Verifikasi bot di form publik
✗ Verifikasi pembayaran

RELIABLE
✓ Pengiriman jawaban idempoten
✓ Aman saat dua permintaan berbarengan
✓ Validasi field wajib diulang di server
✓ Hapus form ikut hapus jawaban
✓ Skema lewat migrasi, db:push diblokir
✓ CI blokir lint, typecheck, test, build merah
✗ Satu peserta satu jawaban
◐ Ekspor CSV baru memuat ringkasan, belum jawaban lengkap

ROBUST
✓ Kegagalan jadi JSON beramplop, bukan HTML
✓ Konfigurasi kurang jadi pesan, bukan crash
✓ Kegagalan layanan luar tidak menjatuhkan permintaan
✓ Batas panjang jawaban dan ukuran unggahan
✓ Tolak jawaban untuk form yang belum terbit
◐ Timeout pada panggilan keluar

MEASURE
✓ Log JSON terstruktur
✓ requestId sama di pesan pengguna dan log
✓ Latensi tiap permintaan
✓ Permintaan lambat naik jadi peringatan
✗ Error tracking
✗ Metrik agregat

FAST
✓ Cursor pagination, bukan OFFSET
✓ Index komposit untuk daftar jawaban dan katalog publik
✓ Ukuran halaman dibatasi
◐ Rate limit di Redis, bukan Postgres
✗ Hitung total jawaban tanpa scan penuh

AVAILABILITY
✓ Health check
✓ Rate limit fail-open saat penyimpanannya bermasalah
✓ Form publik tetap terbaca tanpa sesi
✗ Uptime monitor terpasang
✗ Backup terverifikasi

SCALABLE
✓ Tidak ada sesi tersimpan di server
✓ Berkas di storage luar, bukan disk instance
✓ Rate limit berlaku lintas instance
✓ Batas kirim dikalibrasi untuk IP bersama
◐ Database lewat pooler
