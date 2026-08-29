# PRD — Blayer

**Versi 1.9 · Draft**

Form builder yang hasilnya langsung terbaca. Satu template menentukan cara form diisi sekaligus cara hasilnya ditampilkan — pendaftaran acara memberi tiket dan link Meet, form berskor diperingkat sendiri, survei dirangkum sendiri.

| | |
| --- | --- |
| **Pemilik** | Dzikri Alan |
| **Status** | Draft — Review |
| **Terakhir diperbarui** | 18 Agustus 2026 |
| **Target rilis** | Belum ditetapkan |

---

## 01 · Latar Belakang & Masalah

Form builder umum berhenti di pengumpulan jawaban. Setelah data masuk, penyelenggara masih harus menyalinnya ke spreadsheet untuk menilai, mengurutkan, atau sekadar merekap siapa saja yang hadir.

- Penyelenggara acara memakai form pendaftaran, lalu harus mengirim link Google Meet secara manual satu per satu.
- Semua pengguna menerima rekap mentah — kolom jawaban apa adanya, tanpa nilai maupun urutan.

Blayer menutup jarak itu: bentuk form dan bentuk hasilnya ditentukan sekaligus di awal, lewat pilihan template.

---

## 02 · Sasaran & Metrik

| Sasaran | Metrik keberhasilan |
| --- | --- |
| Hasil terbaca tanpa spreadsheet | Penyelenggara mengambil keputusan langsung dari halaman hasil; ekspor CSV hanya untuk arsip |
| Penilaian tidak lagi manual | Setiap jawaban punya skor, peringkat, dan catatan durasi pengerjaannya sendiri |
| Pendaftaran acara selesai sendiri | Pendaftar menerima link Google Meet seketika setelah submit, tanpa tindakan penyelenggara |
| Template baru murah dibuat | Menambah template hanya perlu satu entri katalog, tanpa mengubah komponen mana pun |

**Di luar cakupan v1:** kolaborasi multi-editor; pembayaran di dalam form; pengiriman email otomatis; aplikasi mobile native; penilaian esai berbasis kunci jawaban.

---

## 03 · Pengguna & User Story

| Persona | Kebutuhan utama | User story |
| --- | --- | --- |
| **Pembuat form** — guru, panitia, HR | Menyusun form cepat dan melihat hasil yang sudah terolah | Sebagai pembuat form, saya ingin memilih template agar pertanyaan dan bentuk laporannya langsung sesuai kebutuhan saya. |
| **Pendaftar acara** — peserta webinar | Mendaftar sekali, langsung pegang bukti dan link acara | Sebagai pendaftar, saya ingin menerima link Google Meet segera setelah submit, agar tidak perlu menunggu email panitia. |
| **Pengisi survei** — pelanggan | Menyampaikan masukan sekali tanpa membuat akun | Sebagai pelanggan, saya ingin mengisi survei lewat tautan dan tahu jawabannya langsung terpakai, tanpa perlu mendaftar. |

---

## 04 · Kebutuhan Fungsional

> Prioritas: **P0** wajib · **P1** penting · **P2** nanti

| ID | Kebutuhan | Kriteria penerimaan | Prio | Status |
| --- | --- | --- | --- | --- |
| F-01 | Membuat form dari template | Memilih template mengisi judul, deskripsi, dan seluruh pertanyaan; semuanya masih bisa diubah. Template masih bisa diganti berkali-kali di builder, dan `?template=` di URL mengikuti pilihan terakhir | P0 | Selesai |
| F-02 | Menyusun pertanyaan manual | 13 tipe field tersedia; urutan bisa digeser; field pilihan wajib punya minimal 2 opsi | P0 | Selesai |
| F-03 | Mengisi form lewat tautan publik | Form terbuka tanpa login; field wajib divalidasi di klien dan server | P0 | Selesai |
| F-04 | Satu nilai template menentukan tampilan | Field `view` bernilai `scoring`, `survey`, atau `event`; halaman isi, layar setelah kirim, dan dashboard hasil diturunkan dari nilai itu | P0 | Selesai |
| F-07 | Durasi pengerjaan | Dihitung sejak soal tampil sampai submit, tersimpan per jawaban, tampil di tiap baris hasil | P0 | Selesai |
| F-08 | Dashboard hasil per template | `scoring` menampilkan skor dan peringkat; `event` menampilkan daftar orang; `survey` menampilkan ringkasan | P0 | Selesai |
| F-09 | Ekspor CSV | Tepat tiga kolom: Nama, Nilai, Waktu Pengerjaan; seluruh data diekspor, bukan halaman aktif | P1 | Selesai |
| F-10 | Banner form | Pembuat form mengunggah gambar maks. 4 MB ke Supabase Storage; banner tampil utuh mengikuti rasio aslinya; dipakai template acara | P1 | Selesai |
| F-11 | Halaman acara setelah mendaftar | Menampilkan tiket atas nama pendaftar, sesi, lokasi, jumlah terdaftar, dan link Google Meet. Baris tanggal baru muncul setelah F-25 — form pendaftaran tidak lagi menanyakannya ke pendaftar | P1 | Selesai |
| F-12 | Link acara ditahan sampai mendaftar | Link Google Meet tidak tampil di halaman pendaftaran, hanya setelah submit berhasil | P1 | Selesai |
| F-13 | Filter riwayat form per template | Tombol **See** di tiap kartu template menyaring daftar riwayat form ke template itu; klik ulang atau tombol Hapus Filter mengembalikannya | P1 | Selesai |
| F-21 | Identitas seperlunya, tidak kembar | Halaman isi menyediakan kolom identitas bawaan yang mengisi `respondentName`/`respondentEmail`, dan template dilarang menambahkannya lagi. Nama dan email ditanyakan sekali di halaman isi, lalu dipakai tiket dan dashboard | P0 | Selesai |
| F-25 | Detail acara oleh penyelenggara | Tanggal, jam mulai, jam selesai, dan nama penyelenggara diisi di builder. Tiket saat ini tampil tanpa tanggal karena data itu memang milik penyelenggara, bukan jawaban pendaftar | P1 | Belum |
| F-26 | Akun dan kepemilikan form | Masuk dengan username-kata sandi atau akun Google. Halaman `/forms`, `/forms/create`, dan `/forms/[id]/result` dikunci guard; tiap form menyimpan `userId` pemiliknya sehingga daftar form, jawaban peserta, dan analisis AI hanya terbuka bagi pemiliknya. Penolakan dilakukan di API, bukan hanya di tampilan — request tanpa token dibalas 401 dan milik akun lain dibalas 403. Halaman depan tetap menampilkan katalog form yang sudah dipublikasikan tanpa menuntut akun | P0 | Selesai |
| F-28 | Analisis AI atas jawaban | Peringkat dan rekomendasi naratif berdasarkan tujuan form; kode sudah ada, disembunyikan di balik saklar tampilan | P2 | Ditunda |
| F-29 | Landing page publik | Halaman depan berdiri sendiri di luar rangka aplikasi: navbar, hero berikut ringkasan kategori, statistik, pita berjalan, penyaring kategori berbentuk baris tombol beserta daftar acaranya, dan footer — memakai palet dan tipografi yang sama dengan aplikasinya | P1 | Selesai |
| F-30 | Satu penangan tampilan data | Seluruh permukaan yang menampilkan data memakai `LoadData` untuk keadaan memuat, gagal, dan kosong — tidak ada halaman yang menyisakan layar kosong. Aksi lanjutan (Retry, Buat Form) diletakkan di bawah placeholder karena `LoadData` tidak punya slot aksi | P1 | Selesai |
| F-31 | Identitas visual | Lambang Blayer dipakai sebagai logo di navbar halaman depan, bilah atas aplikasi, dan footer, sekaligus sebagai favicon dan ikon layar utama | P2 | Selesai |
| F-32 | Tampilan ponsel di seluruh halaman | Halaman depan sampai dalam aplikasi tidak menghasilkan geseran samping pada 320 px, 390 px, dan 768 px; navigasi halaman depan berubah jadi tombol menu di bawah 640 px | P1 | Selesai |
| F-33 | Halaman kesalahan sendiri | Alamat yang tidak dikenal menampilkan halaman 404 bergaya sistem desain sendiri lengkap dengan jalan keluarnya, bukan halaman bawaan Next; kegagalan server memakai halaman 500 yang setara | P1 | Selesai |
| F-34 | Judul form hidup di bilah atas | Bilah atas builder mengikuti isi kolom Form Title seketika, termasuk saat template menimpanya; kosong kembali ke label UNTITLED FORM | P2 | Selesai |
| F-36 | Halaman kategori | Tombol Eksplor Kategori di halaman depan membuka halaman kategori sendiri, bukan daftar yang terbuka di tempat. Bentuk sajiannya mengikuti `view` template: acara sebagai poster bersampul, form berskor dan survei sebagai daftar berurutan. Seluruh naskahnya ditulis untuk pengunjung yang datang untuk ikut — judul menyebut yang bisa dilakukan ("Acara Yang Bisa Kamu Ikuti"), satuannya sesuai konteks, dan tidak ada ajakan membuat form di permukaan ini | P1 | Selesai |
| F-39 | Menyunting dan menghapus form | Pemilik bisa mengubah judul, pengaturan, dan pertanyaan form yang sudah dibuat lewat builder yang sama, serta menghapusnya beserta seluruh jawaban dan analisisnya setelah konfirmasi yang menyebut jumlah jawaban yang ikut hilang. Field lama mempertahankan id-nya saat disunting supaya jawaban yang sudah masuk tidak kehilangan pertanyaannya; kepemilikan diperiksa di server (401 tanpa sesi, 403 untuk milik akun lain), bukan hanya disembunyikan di browser | P1 | Selesai |
| F-40 | Kerahasiaan detail form | Detail form boleh dibaca tanpa akun karena pengisi datang lewat tautan, tapi isinya disaring per pembaca: `purpose` (perintah untuk AI) tidak pernah keluar ke pengisi, link acara baru dikirim lewat balasan pengiriman jawaban, dan form yang masih draf dibalas 404 untuk siapa pun selain pemiliknya | P1 | Selesai |
| F-41 | Batas laju dan kebersihan jawaban | Endpoint yang terbuka tanpa sesi dibatasi per IP — pengiriman jawaban per form, pendaftaran akun, unggahan banner, dan penjalanan analisis berbayar — dengan balasan 429 yang menyebut sisa waktu tunggu. Jawaban yang tersimpan hanya berisi kunci field milik form itu dan dipotong pada batas panjang wajar, sehingga kiriman asing tidak menumpang ke prompt analisis | P1 | Selesai |
| F-42 | Ketahanan saat gagal | Kegagalan tak tertangkap di API tetap dibalas sebagai JSON berisi kode penelusuran, bukan halaman HTML yang membuat pemanggil `fetch` melihat "Unexpected token '<'", dan tercatat sebagai satu baris log JSON berisi requestId, rute, serta pesan aslinya. Payload form divalidasi di satu tempat sebelum menyentuh database, dan kegagalan render di browser diganti layar pemulihan, bukan halaman putih | P1 | Selesai |

---

## 05 · Alur Utama

**Pembuat form**

1. Pilih template di beranda — atau klik **See** dulu untuk melihat form apa saja yang pernah dibuat dari template itu
2. Sunting judul, pertanyaan, dan detail tambahan bila ada (banner, link Meet)
3. Simpan & bagikan tautan
4. Pantau dashboard hasil, ekspor bila perlu

**Pendaftar acara**

1. Buka tautan, lihat banner acara
2. Isi nama, email, dan pilih sesi
3. Terima halaman acara berisi tiket dan link Meet

---

## 06 · Kebutuhan Non-Fungsional

| Aspek | Ketentuan |
| --- | --- |
| Keamanan | Secret key Supabase hanya dibaca di API route, tidak pernah dikirim ke browser. Unggahan divalidasi tipe dan ukurannya di klien maupun server. |
| Pesan kesalahan | Setiap kegagalan menyebut penyebab dan langkah perbaikannya. Pesan mentah dari layanan pihak ketiga diterjemahkan lebih dulu. |
| Kompatibilitas data | Kolom baru bersifat nullable. Jawaban lama tanpa catatan durasi ditandai `—`, bukan `00:00`. Nilai enum yang tidak lagi dipakai ditinggal di basis data, jadi jawaban lama tetap terbaca. |
| Responsif | Seluruh halaman terpakai dari lebar 320 px ke atas tanpa geseran samping. Tabel, kartu template, dan konten lebar menggulir di wadahnya sendiri. Sasaran sentuh minimal 32 px, kecuali kotak centang yang dibantu labelnya. |
| Aksesibilitas | Kontras teks memadai di terang dan gelap; kontrol punya status fokus yang terlihat; gambar punya teks alternatif. |

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
| Kategori acara | Satu template per kategori (`event-tech`, `event-sport`, `event-music`, `event-business`), semuanya ber-`view: event` | Kategori yang diselenggarakan — teknologi, olahraga, musik, bisnis — adalah cara pengunjung memilih, jadi harus bisa disaring, dibagikan lewat alamatnya sendiri, dan disaring di riwayat form. Ketiganya sudah diturunkan dari `templateId`, jadi menambah kategori cukup satu entri katalog tanpa kolom basis data baru maupun migrasi |
| Penyaring kategori di halaman depan | Baris tombol yang menyaring satu daftar acara, bukan satu section per kategori | Kategori yang dipajang bertumpuk memaksa pengunjung menggulir melewati kategori yang tidak dia minati sebelum sampai ke yang dia cari. Satu daftar dengan penyaring di atasnya memperlihatkan seluruh acara sekaligus, dan mempersempitnya hanya kalau diminta |
| Bentuk sajian kategori | Diturunkan dari `view` template, bukan dari cabang per kategori | `view` sudah menentukan halaman isi, layar setelah kirim, dan dashboard hasil. Memakai nilai yang sama untuk halaman kategori membuat template baru tidak menuntut komponen baru — cukup memilih salah satu bentuk yang ada |
| Naskah halaman kategori | Ditulis per `view` dari sisi pengunjung, bisa ditimpa per template lewat `copy` | Nama dan tagline template menjelaskan apa yang didapat *pembuat* form — "Banner, link Google Meet, dan daftar peserta" hanya berarti bagi yang sedang menyusun acara. Pengunjung datang mencari sesuatu untuk didaftari atau dipakai, jadi permukaan itu tidak memakai bahasa builder dan tidak menawarkan template |
| Pemasangan poster | `object-contain` di bingkai tetap, sisa ruang diisi latar bergaris | Banner acara kerap jauh lebih lebar dari bingkainya dan memuat tanggal serta tempat di tepi. `object-cover` memotong tepat di bagian itu, jadi informasinya hilang justru saat kartunya dipersempit jadi tiga kolom |
| Alamat kategori | `/kategori/[id]` diprerender dari daftar template | Daftar template adalah konstanta di kode, jadi seluruh alamatnya sudah pasti saat build. Halaman ini dibuat untuk dibagikan, jadi judul dan deskripsinya harus benar sejak balasan pertama, dan kategori yang tidak ada dibalas 404 sungguhan alih-alih halaman kosong berstatus 200 |
| Penyimpanan berkas | Supabase Storage, bucket publik | Banner form harus permanen dan bisa dibuka tanpa login |
| Unggahan | Base64 lewat API route | Secret key tetap di server, tanpa parser multipart tambahan |
| Rangka halaman | `PageShell` untuk aplikasi, `LandingShell` untuk halaman depan | Halaman kerja butuh rail samping dan kolom sempit agar form terbaca; halaman depan butuh lebar penuh dan navigasi biasa. Memaksakan satu rangka membuat salah satunya terasa keliru |
| Penangan tampilan data | `LoadData` di `src/shared/components` | Memuat, gagal, dan kosong ditangani satu komponen yang membaca bentuk `data` dari konvensi kode, jadi tiap permukaan tidak menyusun ulang keadaan yang sama |
| Identitas pengisi | Kolom nama dan email bawaan di halaman isi | Keduanya mengisi `respondentName`/`respondentEmail` yang dipakai tiket dan dashboard. Template yang menambahkannya lagi hanya melahirkan pertanyaan kembar |

---

## 08 · Risiko & Pertanyaan Terbuka

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Skor belum mengukur kebenaran jawaban | Tinggi | Skor dihitung dari field terukur (rating, skala, kotak centang), bukan dari kunci jawaban, sehingga peringkatnya perlu dibaca sebagai perbandingan kasar. |
| Ketergantungan pada Supabase Storage | Sedang | Bila env belum terisi, unggahan menolak dengan pesan jelas dan sisa aplikasi tetap berjalan. |

**Pertanyaan terbuka**

- Apakah satu form boleh punya lebih dari satu sesi acara dengan kuota terpisah?
- Analisis AI dilanjutkan, atau dilepas dari lingkup produk?

---

## 09 · Rencana Rilis

| Tahap | Cakupan | Syarat lulus |
| --- | --- | --- |
| M1 — Fondasi | F-01 s/d F-09 | Form bisa dibuat, diisi, dan hasilnya terbaca tanpa spreadsheet |
| M2 — Acara | F-10 s/d F-12 | Pendaftar menerima tiket dan link Meet tanpa campur tangan panitia |
| M3 — Katalog | F-13, F-36 | Pengunjung menemukan form yang sedang terbuka lewat halaman kategori |
| M4 — Acara lengkap | F-25 | Tiket memuat tanggal dan penyelenggara yang diisi di builder |
| M6 — Siap publik | F-26 ✅ | Hasil form hanya terbuka bagi pemiliknya |

---

*BLAYER® Studio · Dokumen internal · Status: butuh review*
