# PRD — Blayer

**Versi 1.9 · Draft**

Form builder yang hasilnya langsung terbaca. Satu template menentukan cara form diisi sekaligus cara hasilnya ditampilkan — ujian dikunci dan diperingkat, pendaftaran acara memberi tiket dan link Meet, pesanan restoran memberi struk, kursus membuka video kelas setelah dibayar.

| | |
| --- | --- |
| **Pemilik** | Dzikri Alan |
| **Status** | Draft — Review |
| **Terakhir diperbarui** | 18 Agustus 2026 |
| **Target rilis** | Belum ditetapkan |

---

## 01 · Latar Belakang & Masalah

Form builder umum berhenti di pengumpulan jawaban. Setelah data masuk, penyelenggara masih harus menyalinnya ke spreadsheet untuk menilai, mengurutkan, atau sekadar merekap siapa saja yang hadir.

- Guru memakai form untuk ujian, tapi tidak ada yang mencegah siswa membuka tab lain, dan tidak ada catatan berapa lama tiap siswa mengerjakan.
- Penyelenggara acara memakai form pendaftaran, lalu harus mengirim link Google Meet secara manual satu per satu.
- Restoran yang memakai form untuk pesan di meja hanya bisa mengumpulkan teks — pelanggan tidak melihat gambar makanan, dan pembayaran tetap terjadi di luar form.
- Pengajar kursus harus menagih pembayaran lewat kanal terpisah, lalu mengirim tautan materi secara manual setelah pembayaran masuk.
- Semua pengguna menerima rekap mentah — kolom jawaban apa adanya, tanpa nilai maupun urutan.

Blayer menutup jarak itu: bentuk form dan bentuk hasilnya ditentukan sekaligus di awal, lewat pilihan template.

---

## 02 · Sasaran & Metrik

| Sasaran | Metrik keberhasilan |
| --- | --- |
| Hasil terbaca tanpa spreadsheet | Penyelenggara mengambil keputusan langsung dari halaman hasil; ekspor CSV hanya untuk arsip |
| Ujian daring lebih tepercaya | Setiap jawaban ujian punya catatan durasi pengerjaan dan jumlah pelanggaran layar |
| Pendaftaran acara selesai sendiri | Pendaftar menerima link Google Meet seketika setelah submit, tanpa tindakan penyelenggara |
| Transaksi selesai di dalam form | Pemesan memilih item bergambar, melihat tagihannya, dan memilih metode bayar tanpa pindah kanal |
| Materi berbayar terbuka sendiri | Peserta kursus melihat video kelas seketika setelah formulir dan pembayarannya terkirim |
| Template baru murah dibuat | Menambah template hanya perlu satu entri katalog, tanpa mengubah komponen mana pun |

**Di luar cakupan v1:** kolaborasi multi-editor; verifikasi pembayaran otomatis lewat payment gateway; pengiriman email otomatis; aplikasi mobile native; penilaian esai berbasis kunci jawaban.

---

## 03 · Pengguna & User Story

| Persona | Kebutuhan utama | User story |
| --- | --- | --- |
| **Pembuat form** — guru, panitia, HR | Menyusun form cepat dan melihat hasil yang sudah terolah | Sebagai pembuat form, saya ingin memilih template agar pertanyaan dan bentuk laporannya langsung sesuai kebutuhan saya. |
| **Peserta ujian** — siswa | Mengerjakan soal tanpa gangguan, tahu aturannya sejak awal | Sebagai siswa, saya ingin tahu bahwa layar ujian terkunci dan waktu saya tercatat, agar penilaiannya adil bagi semua. |
| **Pendaftar acara** — peserta webinar | Mendaftar sekali, langsung pegang bukti dan link acara | Sebagai pendaftar, saya ingin menerima link Google Meet segera setelah submit, agar tidak perlu menunggu email panitia. |
| **Pemesan di restoran** — tamu di meja | Memilih makanan sambil melihat gambarnya, lalu bayar di tempat | Sebagai tamu, saya ingin memilih menu bergambar dan membayar lewat QRIS dari ponsel saya, agar tidak perlu menunggu pelayan. |
| **Pemilik restoran** — kasir, dapur | Melihat pesanan per meja lengkap dengan metode bayarnya | Sebagai kasir, saya ingin tiap pesanan mencantumkan meja, item, total, dan metode pembayaran, agar bisa langsung dicocokkan. |
| **Peserta kursus** — pembelajar | Bayar sekali, materi langsung terbuka | Sebagai peserta, saya ingin video kelas terbuka begitu saya membayar dan mengisi form, agar tidak menunggu balasan pengajar. |

---

## 04 · Kebutuhan Fungsional

> Prioritas: **P0** wajib · **P1** penting · **P2** nanti

| ID | Kebutuhan | Kriteria penerimaan | Prio | Status |
| --- | --- | --- | --- | --- |
| F-01 | Membuat form dari template | Memilih template mengisi judul, deskripsi, dan seluruh pertanyaan; semuanya masih bisa diubah. Template masih bisa diganti berkali-kali di builder, dan `?template=` di URL mengikuti pilihan terakhir | P0 | Selesai |
| F-02 | Menyusun pertanyaan manual | 15 tipe field tersedia; urutan bisa digeser; field pilihan wajib punya minimal 2 opsi | P0 | Selesai |
| F-03 | Mengisi form lewat tautan publik | Form terbuka tanpa login; field wajib divalidasi di klien dan server | P0 | Selesai |
| F-04 | Satu nilai template menentukan tampilan | Field `view` bernilai `scoring`, `exam`, `survey`, `event`, `order`, atau `course`; halaman isi, layar setelah kirim, dan dashboard hasil diturunkan dari nilai itu | P0 | Selesai |
| F-05 | Mode ujian: layar terkunci | Klik kanan, salin-tempel, seleksi teks, dan pintasan tab/jendela baru, cari, cetak, simpan, devtools dinonaktifkan | P0 | Selesai |
| F-06 | Mode ujian: pelanggaran tercatat | Pindah tab, pindah aplikasi, dan keluar layar penuh menambah hitungan pelanggaran yang terlihat oleh peserta | P0 | Selesai |
| F-07 | Durasi pengerjaan | Dihitung sejak soal tampil sampai submit, tersimpan per jawaban, tampil di tiap baris hasil | P0 | Selesai |
| F-08 | Dashboard hasil per template | `scoring`/`exam` menampilkan skor dan peringkat; `event`/`order`/`course` menampilkan daftar orang; `survey` menampilkan ringkasan | P0 | Selesai |
| F-09 | Ekspor CSV | Tepat tiga kolom: Nama, Nilai, Waktu Pengerjaan; seluruh data diekspor, bukan halaman aktif | P1 | Selesai |
| F-10 | Banner form | Pembuat form mengunggah gambar maks. 4 MB ke Supabase Storage; banner tampil utuh mengikuti rasio aslinya; dipakai template acara, restoran, dan kursus | P1 | Selesai |
| F-11 | Halaman acara setelah mendaftar | Menampilkan tiket atas nama pendaftar, sesi, lokasi, jumlah terdaftar, dan link Google Meet. Baris tanggal baru muncul setelah F-25 — form pendaftaran tidak lagi menanyakannya ke pendaftar | P1 | Selesai |
| F-12 | Link acara ditahan sampai mendaftar | Link Google Meet tidak tampil di halaman pendaftaran, hanya setelah submit berhasil | P1 | Selesai |
| F-13 | Filter riwayat form per template | Tombol **See** di tiap kartu template menyaring daftar riwayat form ke template itu; klik ulang atau tombol Hapus Filter mengembalikannya | P1 | Selesai |
| F-14 | Field menu bergambar (`MENU`) | Tiap opsi ditulis `Nama\|Harga\|URL Gambar`; pengisi menambah/mengurangi porsi lewat kartu bergambar; subtotal tampil hidup di bawah kartu | P0 | Selesai |
| F-15 | Field metode pembayaran (`PAYMENT`) | Tiap opsi ditulis `Metode\|Petunjuk`; total tagihan diambil dari field `MENU` di form yang sama, atau dari harga tetap form bila tidak ada menu; metode terpilih tersimpan bersama nominalnya | P0 | Selesai |
| F-16 | Pembayaran QRIS | Pembuat form mengunggah kode QRIS miliknya; kode itu tampil saat pengisi memilih metode QRIS. Tanpa unggahan, metode tetap bisa dipilih tapi hanya menampilkan petunjuknya | P0 | Selesai |
| F-17 | Struk pesanan restoran | Setelah submit, pemesan menerima struk berisi nama, daftar item beserta jumlah dan subtotal, total tagihan, dan metode pembayaran | P0 | Selesai |
| F-18 | Template menu restoran | Lima field siap pakai: nomor meja, menu bergambar, cara penyajian, catatan dapur, metode pembayaran. Pemesan hanya ditanya nama — tidak ada email atau nomor telepon | P0 | Selesai |
| F-19 | Template kursus kelas | Empat field siap pakai: WhatsApp, level, tujuan, metode pembayaran. Satu form = satu kelas, jadi peserta tidak memilih paket — harganya ditetapkan pengajar di builder | P0 | Selesai |
| F-20 | Harga tetap form berbayar | Form berbayar tanpa field menu memakai harga yang diisi pembuat form; harga wajib angka lebih dari 0 | P0 | Selesai |
| F-21 | Identitas seperlunya, tidak kembar | Halaman isi menyediakan kolom identitas bawaan yang mengisi `respondentName`/`respondentEmail`, dan template dilarang menambahkannya lagi. Email hanya ditanyakan pada view yang memang mengirim sesuatu ke sana; pesanan di meja cukup nama | P0 | Selesai |
| F-22 | Video kelas terbuka setelah bayar | Link video diisi di builder, tidak tampil di halaman pendaftaran; setelah form terkirim, video YouTube diputar langsung di halaman dan penyedia lain dibuka sebagai tautan | P0 | Selesai |
| F-23 | Verifikasi pembayaran otomatis | Status pembayaran dikonfirmasi payment gateway, bukan dicocokkan manual oleh petugas | P0 | Belum |
| F-24 | Penilaian ujian berbasis kunci jawaban | Pembuat form menetapkan jawaban benar per pertanyaan; skor dihitung dari ketepatan, bukan dari field terukur | P0 | Belum |
| F-25 | Detail acara oleh penyelenggara | Tanggal, jam mulai, jam selesai, dan nama penyelenggara diisi di builder. Tiket saat ini tampil tanpa tanggal karena data itu memang milik penyelenggara, bukan jawaban pendaftar | P1 | Belum |
| F-26 | Akun dan kepemilikan form | Masuk dengan username-kata sandi atau akun Google. Halaman `/forms`, `/forms/create`, dan `/forms/[id]/result` dikunci guard; tiap form menyimpan `userId` pemiliknya sehingga daftar form, jawaban peserta, dan analisis AI hanya terbuka bagi pemiliknya. Penolakan dilakukan di API, bukan hanya di tampilan — request tanpa token dibalas 401 dan milik akun lain dibalas 403. Halaman depan tetap menampilkan katalog form yang sudah dipublikasikan tanpa menuntut akun | P0 | Selesai |
| F-27 | Rekap pendapatan di dashboard | Halaman hasil form berbayar menampilkan total pemasukan dan rincian per metode pembayaran | P1 | Belum |
| F-28 | Analisis AI atas jawaban | Peringkat dan rekomendasi naratif berdasarkan tujuan form; kode sudah ada, disembunyikan di balik saklar tampilan | P2 | Ditunda |
| F-29 | Landing page publik | Halaman depan berdiri sendiri di luar rangka aplikasi: navbar, hero berikut ringkasan kategori, statistik, pita berjalan, daftar kategori, dan footer — memakai palet dan tipografi yang sama dengan aplikasinya | P1 | Selesai |
| F-30 | Satu penangan tampilan data | Seluruh permukaan yang menampilkan data memakai `LoadData` untuk keadaan memuat, gagal, dan kosong — tidak ada halaman yang menyisakan layar kosong. Aksi lanjutan (Retry, Buat Form) diletakkan di bawah placeholder karena `LoadData` tidak punya slot aksi | P1 | Selesai |
| F-31 | Identitas visual | Lambang Blayer dipakai sebagai logo di navbar halaman depan, bilah atas aplikasi, dan footer, sekaligus sebagai favicon dan ikon layar utama | P2 | Selesai |
| F-32 | Tampilan ponsel di seluruh halaman | Halaman depan sampai dalam aplikasi tidak menghasilkan geseran samping pada 320 px, 390 px, dan 768 px; navigasi halaman depan berubah jadi tombol menu di bawah 640 px | P1 | Selesai |
| F-33 | Halaman kesalahan sendiri | Alamat yang tidak dikenal menampilkan halaman 404 bergaya sistem desain sendiri lengkap dengan jalan keluarnya, bukan halaman bawaan Next; kegagalan server memakai halaman 500 yang setara | P1 | Selesai |
| F-34 | Judul form hidup di bilah atas | Bilah atas builder mengikuti isi kolom Form Title seketika, termasuk saat template menimpanya; kosong kembali ke label UNTITLED FORM | P2 | Selesai |

---

## 05 · Alur Utama

**Pembuat form**

1. Pilih template di beranda — atau klik **See** dulu untuk melihat form apa saja yang pernah dibuat dari template itu
2. Sunting judul, pertanyaan, dan detail tambahan bila ada (banner, link Meet, link video, kode QRIS)
3. Simpan & bagikan tautan
4. Pantau dashboard hasil, ekspor bila perlu

**Peserta ujian**

1. Buka tautan, layar ujian terkunci
2. Kerjakan soal, waktu berjalan
3. Submit — durasi dan pelanggaran ikut tersimpan

**Pendaftar acara**

1. Buka tautan, lihat banner acara
2. Isi nama, email, dan pilih sesi
3. Terima halaman acara berisi tiket dan link Meet

**Pemesan di restoran**

1. Buka tautan di meja, isi nama dan pilih nomor meja
2. Ketuk kartu menu bergambar untuk menambah porsi; subtotal berjalan mengikuti
3. Pilih metode pembayaran — QRIS menampilkan kode milik restoran
4. Submit — terima struk berisi item, total, dan metode bayar

**Peserta kursus**

1. Buka tautan, lihat poster kelas
2. Lengkapi data diri — kelas dan harganya sudah ditetapkan pengajar, tidak dipilih ulang
3. Pilih metode pembayaran dan selesaikan pembayarannya
4. Submit — video materi terbuka di halaman yang sama beserta rincian pembayaran

---

## 06 · Kebutuhan Non-Fungsional

| Aspek | Ketentuan |
| --- | --- |
| Keamanan | Secret key Supabase hanya dibaca di API route, tidak pernah dikirim ke browser. Unggahan divalidasi tipe dan ukurannya di klien maupun server. |
| Pesan kesalahan | Setiap kegagalan menyebut penyebab dan langkah perbaikannya. Pesan mentah dari layanan pihak ketiga diterjemahkan lebih dulu. |
| Kompatibilitas data | Kolom baru bersifat nullable. Jawaban lama tanpa catatan durasi ditandai `—`, bukan `00:00`. Nilai enum baru (`MENU`, `PAYMENT`) tidak mengubah tipe field yang sudah ada. |
| Kejujuran transaksi | Halaman pembayaran menyatakan terang-terangan bahwa pembayaran belum diverifikasi otomatis dan masih dicocokkan petugas. |
| Uang & angka | Harga ditulis sebagai angka polos di konfigurasi, ditampilkan dalam format rupiah Indonesia. Menu tanpa harga ditolak saat form disimpan. |
| Responsif | Seluruh halaman terpakai dari lebar 320 px ke atas tanpa geseran samping. Tabel, kartu template, dan konten lebar menggulir di wadahnya sendiri. Kartu menu turun menjadi satu kolom di layar sempit. Sasaran sentuh minimal 32 px, kecuali kotak centang yang dibantu labelnya. |
| Aksesibilitas | Kontras teks memadai di terang dan gelap; kontrol punya status fokus yang terlihat; gambar punya teks alternatif; tombol tambah/kurang porsi punya label. |

---

## 07 · Arsitektur & Keputusan

| Lapisan | Pilihan | Alasan |
| --- | --- | --- |
| Aplikasi | Next.js 14 (Pages Router), TypeScript | Satu basis kode untuk antarmuka dan API |
| Tampilan | Tailwind CSS + Shadcn/UI | Konsisten dengan sistem desain yang sudah ada |
| State | Zustand (klien), TanStack Query (server) | Pemisahan tegas antara state tampilan dan data |
| Basis data | Prisma + PostgreSQL (Supabase) | Skema bertipe, migrasi terkelola |
| Autentikasi | Supabase Auth — username-kata sandi dan Google OAuth | Sesi, penyegaran token, dan OAuth ditangani penyedia yang sama dengan basis data, jadi tidak ada penyimpanan kata sandi sendiri |
| Bentuk username | Username disintesis jadi `username@blayer.id` di satu berkas bersama | Supabase Auth hanya mengenal email untuk kata sandi, sedangkan produk memakai username. Konversi di satu tempat mencegah bentuk yang berbeda antara mendaftar dan masuk |
| Pendaftaran | Lewat API route sendiri memakai Admin API | Alamat email sintetis tidak bisa menerima tautan konfirmasi; menandai akun terkonfirmasi dari server lebih aman daripada mematikan konfirmasi email untuk seluruh project |
| Letak guard halaman | Satu `AuthGuard` di `_app.tsx`, daftar rute publik di satu berkas | Halaman baru terkunci secara bawaan; pengecualian harus ditulis sengaja, bukan terlupakan |
| Penegakan kepemilikan | Diperiksa di API lewat token, bukan hanya di tampilan | Guard di browser hanya menyembunyikan tampilan — `curl` tetap tembus. Pemilik diambil dari token, tidak pernah dari body, agar pengirim tidak bisa mengaku sebagai akun lain |
| Katalog publik | Endpoint `/api/v1/forms/public` terpisah dari `/api/v1/forms` | Halaman depan menawarkan pengunjung untuk ikut form yang sudah dibuka orang lain, jadi daftarnya harus terbaca tanpa akun. Memakai satu endpoint untuk dua kebutuhan memaksa memilih antara halaman depan yang kosong atau daftar milik akun yang bocor; memisahkannya membuat kolom yang dikirim ke publik bisa dibatasi sejak query |
| Penyimpanan berkas | Supabase Storage, bucket publik | Banner dan kode QRIS harus permanen dan bisa dibuka tanpa login |
| Unggahan | Base64 lewat API route | Secret key tetap di server, tanpa parser multipart tambahan |
| Rangka halaman | `PageShell` untuk aplikasi, `LandingShell` untuk halaman depan | Halaman kerja butuh rail samping dan kolom sempit agar form terbaca; halaman depan butuh lebar penuh dan navigasi biasa. Memaksakan satu rangka membuat salah satunya terasa keliru |
| Penangan tampilan data | `LoadData` di `src/shared/components` | Memuat, gagal, dan kosong ditangani satu komponen yang membaca bentuk `data` dari konvensi kode, jadi tiap permukaan tidak menyusun ulang keadaan yang sama |
| Identitas pengisi | Kolom bawaan di halaman isi, jumlahnya ditentukan `view` | Keduanya mengisi `respondentName`/`respondentEmail` yang dipakai tiket, struk, dan dashboard. Template yang menambahkannya lagi hanya melahirkan pertanyaan kembar. Email ditanyakan hanya kalau ada yang dikirim ke sana — pesanan di meja selesai di tempat, jadi cukup nama |
| Harga form berbayar | `Form.priceAmount` untuk form tanpa menu | Kelas dijual satu paket; harganya milik form, bukan pilihan yang diulang tiap peserta |
| Konfigurasi opsi field | Satu opsi per baris, bagian dipisah `\|` | Menu dan metode pembayaran butuh data lebih dari sekadar label, tapi tetap muat di editor opsi yang sudah ada — tanpa skema baru maupun editor baru |
| Pembayaran | Kode QRIS statis milik pembuat form | Tanpa integrasi gateway, kode QRIS statis adalah cara paling jujur untuk benar-benar menerima uang; verifikasinya menyusul lewat F-23 |
| Video kelas | Tautan yang disematkan setelah submit | Tanpa hosting video sendiri; YouTube disematkan, penyedia lain dibuka sebagai tautan |

---

## 08 · Risiko & Pertanyaan Terbuka

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Pembayaran belum terverifikasi otomatis | Tinggi | Pemesan bisa menekan submit tanpa benar-benar membayar. Produk menyatakan status "menunggu konfirmasi" dan menyerahkan pencocokan ke petugas. Diselesaikan oleh F-23. |
| Video kelas bisa dibagikan ulang | Sedang | Tautan video baru muncul setelah submit, tapi setelah itu bisa disalin siapa saja. Perlindungan sungguhan butuh hosting video ber-token, di luar cakupan v1. |
| Penguncian ujian tidak mutlak | Tinggi | Browser tidak bisa memblokir Alt+Tab, Cmd+Space, atau perangkat kedua. Produk menutup seluruh jalan keluar di dalam browser dan mencatat sisanya. Penguncian sungguhan butuh mode kiosk atau aplikasi proctoring terpisah. |
| Skor ujian belum mengukur kebenaran | Tinggi | Skor kini dihitung dari field terukur, sehingga peringkat ujian belum bermakna. Diselesaikan oleh F-24. |
| Dashboard Hasil
| Harga tersimpan sebagai teks opsi | Sedang | Mengubah harga menu tidak mengubah pesanan lama, karena nominalnya ikut disimpan di jawaban. Ini disengaja — struk lama harus tetap memperlihatkan harga saat transaksi terjadi. |
| Ketergantungan pada Supabase Storage | Sedang | Bila env belum terisi, unggahan menolak dengan pesan jelas dan sisa aplikasi tetap berjalan. |

**Pertanyaan terbuka**

- Payment gateway mana yang dipakai untuk F-23 — Midtrans, Xendit, atau QRIS dinamis langsung dari bank?
- Apakah pesanan restoran perlu status berjalan (dibayar → diproses → disajikan), atau cukup daftar pesanan seperti sekarang?
- Apakah satu form kursus boleh punya lebih dari satu video, misalnya satu video per paket kelas?
- Apakah pelanggaran layar ujian perlu disimpan ke basis data dan ditampilkan ke guru, bukan hanya ke siswa?
- Apakah satu form boleh punya lebih dari satu sesi acara dengan kuota terpisah?
- Analisis AI dilanjutkan, atau dilepas dari lingkup produk?

---

## 09 · Rencana Rilis

| Tahap | Cakupan | Syarat lulus |
| --- | --- | --- |
| M1 — Fondasi | F-01 s/d F-09 | Form bisa dibuat, diisi, dan hasilnya terbaca tanpa spreadsheet |
| M2 — Acara | F-10 s/d F-12 | Pendaftar menerima tiket dan link Meet tanpa campur tangan panitia |
| M3 — Transaksi | F-13 s/d F-22 | Pemesan memilih item bergambar, membayar, dan menerima struk atau video kelas di dalam satu alur |
| M4 — Uang tepercaya | F-23, F-27 | Status pembayaran datang dari gateway, bukan dari klaim pengisi |
| M5 — Ujian tepercaya | F-24, F-25 | Nilai ujian mencerminkan ketepatan jawaban, bukan kepercayaan diri peserta |
| M6 — Siap publik | F-26 ✅ | Hasil form hanya terbuka bagi pemiliknya |

---

*BLAYER® Studio · Dokumen internal · Status: butuh review*
