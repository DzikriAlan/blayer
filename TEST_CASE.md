# TEST CASE — Blayer

Dokumen uji untuk [PRD.md](PRD.md). Setiap kasus uji menunjuk ke satu kebutuhan
fungsional (F-xx) dan menyebut apakah pemeriksaannya berjalan otomatis atau
harus dilakukan tangan.

| | |
| --- | --- |
| **Versi PRD yang diuji** | 1.9 |
| **Terakhir diperbarui** | 18 Agustus 2026 |
| **Kasus otomatis** | 82 |
| **Berkas uji** | 11 |

---

## Menjalankan pengujian

```bash
npm test          # sekali jalan
npm run test:watch  # mode tunggu perubahan
```

Perkakas: **Vitest** + **Testing Library** di lingkungan **jsdom**. Konfigurasi
ada di `vitest.config.mts`, persiapan bersama di `test/setup.tsx`.

### Struktur folder

Folder uji mengikuti arsitektur `src/features` supaya letak berkas ujinya bisa
ditebak dari letak kode yang diuji:

```txt
test/
├── setup.tsx                                  # persiapan global + mock next/image
├── features/
│   ├── forms/
│   │   ├── formsTemplate.test.ts              # katalog template (data murni)
│   │   ├── formsCreate.test.tsx               # builder: judul, template
│   │   ├── formsFieldEditor.test.tsx          # editor field di builder
│   │   └── formsList.test.tsx                 # riwayat form + filter template
│   ├── responses/
│   │   ├── responsesField.test.tsx            # field menu, pembayaran, QRIS
│   │   ├── responsesSubmit.test.tsx           # halaman isi form + pengiriman
│   │   ├── responsesOrder.test.tsx            # struk pesanan
│   │   └── responsesCourse.test.tsx           # halaman akses kelas
│   └── uploads/
│       └── uploadsBanner.test.tsx             # unggah banner dan kode QRIS
├── pages/
│   └── errorPages.test.tsx                    # halaman 404 dan 500
└── shared/
    └── loadData.test.tsx                      # penangan memuat, gagal, kosong
```

State, controller, dan router di-mock per berkas uji, jadi seluruh pengujian
berjalan tanpa basis data, tanpa jaringan, dan tanpa server yang hidup.

---

## 1 · Katalog template & builder

| ID | Kebutuhan | Skenario | Hasil yang diharapkan | Jenis | Berkas |
| --- | --- | --- | --- | --- | --- |
| TC-01a | F-01 | Membuka katalog template | Setiap template yang tampil punya judul dan minimal satu field | Otomatis | `formsTemplate.test.ts` |
| TC-01b | F-01 | Menekan **Use** pada kartu template | Diarahkan ke `/forms/create?template=<id>` | Otomatis | `formsList.test.tsx` |
| TC-01c | F-01 | Riwayat form masih kosong | Muncul ajakan membuat form pertama beserta tautan ke builder | Otomatis | `formsList.test.tsx` |
| TC-02a | F-02 | Membuka pilihan tipe jawaban | Tersedia 15 tipe, termasuk `MENU` dan `PAYMENT`, tanpa duplikat | Otomatis | `formsFieldEditor.test.tsx` |
| TC-02b | F-02 | Memilih tipe field pilihan | Kolom opsi muncul dengan panduan bawaan "Options — one per line" | Otomatis | `formsFieldEditor.test.tsx` |
| TC-02c | F-02 | Memilih tipe tanpa opsi (mis. jawaban singkat) | Kolom opsi tidak dirender sama sekali | Otomatis | `formsFieldEditor.test.tsx` |
| TC-02d | F-02 | Memeriksa seluruh template | Setiap field pilihan membawa minimal dua opsi | Otomatis | `formsTemplate.test.ts` |
| TC-02e | F-02 | Menggeser urutan field dengan panah atas/bawah | Urutan pertanyaan berubah dan tersimpan sesuai tampilan | Manual | — |
| TC-34a | F-34 | Mengetik di kolom Form Title | Bilah atas ikut berubah seketika mengikuti judulnya | Otomatis | `formsCreate.test.tsx` |
| TC-34b | F-34 | Mengosongkan kembali kolom judul | Bilah atas kembali ke label bawaan UNTITLED FORM | Otomatis | `formsCreate.test.tsx` |
| TC-34c | F-34 | Memakai template dari builder | Judul dari template ikut mengubah bilah atas | Otomatis | `formsCreate.test.tsx` |
| TC-35a | F-01 | Datang lewat `?template=` lalu memilih template lain | Isian berpindah ke template baru dan tidak ditarik kembali ke yang lama | Otomatis | `formsCreate.test.tsx` |
| TC-35b | F-01 | Memilih template di builder | `?template=` di URL ikut berubah mengikuti pilihan terakhir | Otomatis | `formsCreate.test.tsx` |
| TC-04 | F-04 | Memeriksa nilai `view` seluruh template | Hanya bernilai `scoring`, `exam`, `survey`, `event`, `order`, atau `course` | Otomatis | `formsTemplate.test.ts` |
| TC-13a | F-13 | Menekan **See** pada kartu template | Riwayat form hanya menampilkan form dari template itu, dan baris filter aktif muncul | Otomatis | `formsList.test.tsx` |
| TC-13b | F-13 | Menekan **Shown** (klik kedua) | Filter terlepas, seluruh riwayat kembali tampil | Otomatis | `formsList.test.tsx` |
| TC-13c | F-13 | Menekan **Hapus Filter** | Filter terlepas, seluruh riwayat kembali tampil | Otomatis | `formsList.test.tsx` |
| TC-13d | F-13 | Memfilter template yang belum punya form | Muncul keterangan yang menyebut nama templatenya dan cara membuat yang pertama | Otomatis | `formsList.test.tsx` |
| TC-13e | F-13 | Mengetik kata kunci di kolom pencarian | Hanya form yang judulnya cocok yang tersisa | Otomatis | `formsList.test.tsx` |

---

## 2 · Pengisian form

| ID | Kebutuhan | Skenario | Hasil yang diharapkan | Jenis | Berkas |
| --- | --- | --- | --- | --- | --- |
| TC-03a | F-03 | Menekan Submit dengan field wajib kosong | Pengiriman ditahan dan tiap field wajib diberi pesan kesalahan | Otomatis | `responsesSubmit.test.tsx` |
| TC-03b | F-03 | Membuka tautan form yang sudah dihapus | Muncul "Form Not Found" beserta tombol **Coba Lagi** yang memuat ulang | Otomatis | `responsesSubmit.test.tsx` |
| TC-03c | F-03 | Mengirim jawaban tanpa field wajib langsung ke API | Server menolak dengan pesan yang menyebut label fieldnya | Manual | — |
| TC-21a | F-21 | Membuka form pesanan (`view: order`) | Hanya kolom **Full Name** yang tampil; kolom email tidak dirender | Otomatis | `responsesSubmit.test.tsx` |
| TC-21b | F-21 | Membuka form acara (`view: event`) | Kolom **Full Name** dan **Email Address** dua-duanya tampil | Otomatis | `responsesSubmit.test.tsx` |
| TC-21c | F-21 | Memeriksa penomoran pertanyaan pada form pesanan | Pertanyaan pertama bernomor 02, menyambung dari satu kolom identitas | Otomatis | `responsesSubmit.test.tsx` |
| TC-21d | F-21 | Memeriksa seluruh template yang tampil | Tidak ada satu pun field bernama nama/email atau bertipe `EMAIL` | Otomatis | `formsTemplate.test.ts` |
| TC-07a | F-07 | Mengirim jawaban | Payload memuat `durationSeconds` bernilai tidak negatif | Otomatis | `responsesSubmit.test.tsx` |
| TC-07b | F-07 | Melihat baris hasil di dashboard | Durasi tampil `MM:SS`; jawaban lama tanpa durasi ditandai `—` | Manual | — |
| TC-05a | F-05 | Membuka form ujian (`view: exam`) | Formulir memakai penanda anti-seleksi teks | Otomatis | `responsesSubmit.test.tsx` |
| TC-05b | F-05 | Menekan klik kanan, Ctrl+C, Ctrl+P, F12 di halaman ujian | Semua pintasan diabaikan | Manual | — |
| TC-06 | F-06 | Berpindah tab lalu kembali ke halaman ujian | Hitungan pelanggaran bertambah dan terlihat oleh peserta | Manual | — |

---

## 3 · Menu bergambar & pembayaran

| ID | Kebutuhan | Skenario | Hasil yang diharapkan | Jenis | Berkas |
| --- | --- | --- | --- | --- | --- |
| TC-14a | F-14 | Membuka field menu | Tiap item menampilkan nama, harga rupiah, dan gambarnya | Otomatis | `responsesField.test.tsx` |
| TC-14b | F-14 | Menekan tombol tambah pada item yang sudah dipilih | Jumlah porsi naik dan tersimpan sebagai `Nama x2` | Otomatis | `responsesField.test.tsx` |
| TC-14c | F-14 | Menekan tombol kurang pada porsi terakhir | Item dikeluarkan dari daftar pesanan | Otomatis | `responsesField.test.tsx` |
| TC-14d | F-14 | Memilih dua item dengan jumlah berbeda | Subtotal sama dengan jumlah harga × porsi | Otomatis | `responsesField.test.tsx` |
| TC-14e | F-14 | Memeriksa opsi menu bawaan template restoran | Setiap baris punya nama, harga berupa angka > 0, dan URL gambar | Otomatis | `formsTemplate.test.ts` |
| TC-14f | F-14 | Menyimpan form dengan baris menu tanpa harga | Builder menolak simpan dan menyebut nomor fieldnya | Manual | — |
| TC-15a | F-15 | Membuka field pembayaran | Total tagihan tampil sesuai isi field menu | Otomatis | `responsesField.test.tsx` |
| TC-15b | F-15 | Memilih salah satu metode | Nama metode dikirim ke pemanggilnya | Otomatis | `responsesField.test.tsx` |
| TC-15c | F-15 | Mengirim form berisi menu dan pembayaran | Jawaban pembayaran tersimpan sebagai `QRIS — Rp28.000` | Otomatis | `responsesSubmit.test.tsx` |
| TC-15d | F-15 | Memeriksa panduan field pembayaran di builder | Disebutkan tagihan datang dari field menu atau harga form | Otomatis | `formsFieldEditor.test.tsx` |
| TC-16a | F-16 | Memilih metode QRIS pada form yang punya kode QRIS | Gambar QRIS milik pembuat form ditampilkan | Otomatis | `responsesField.test.tsx` |
| TC-16b | F-16 | Memilih metode QRIS tanpa kode terunggah | Tidak ada gambar; pengisi diberi tahu harus menanyakan kodenya | Otomatis | `responsesField.test.tsx` |
| TC-16c | F-16 | Membuka unggahan QRIS di builder | Tombol unggah berlabel "UNGGAH QRIS", bukan "UNGGAH BANNER" | Otomatis | `uploadsBanner.test.tsx` |
| TC-20a | F-20 | Membuka form kursus berharga tetap | Total tagihan memakai `priceAmount` milik form | Otomatis | `responsesSubmit.test.tsx` |
| TC-20b | F-20 | Memeriksa harga bawaan template kursus | Nilainya angka lebih dari 0 | Otomatis | `formsTemplate.test.ts` |
| TC-20c | F-20 | Mengisi harga dengan huruf atau angka negatif di builder | Simpan ditolak dengan pesan "Harga harus berupa angka lebih dari 0" | Manual | — |
| TC-23a | F-23 | Memilih metode pembayaran apa pun | Halaman menyatakan pembayaran belum diverifikasi otomatis | Otomatis | `responsesField.test.tsx` |
| TC-23b | F-23 | Membuka struk setelah kirim | Status tertulis menunggu konfirmasi petugas | Otomatis | `responsesOrder.test.tsx` |

---

## 4 · Layar setelah kirim

| ID | Kebutuhan | Skenario | Hasil yang diharapkan | Jenis | Berkas |
| --- | --- | --- | --- | --- | --- |
| TC-17a | F-17 | Mengirim pesanan restoran | Struk memuat nama pemesan dan judul formnya | Otomatis | `responsesOrder.test.tsx` |
| TC-17b | F-17 | Memeriksa rincian struk | Tiap item tampil dengan jumlah dan subtotalnya | Otomatis | `responsesOrder.test.tsx` |
| TC-17c | F-17 | Memeriksa penutup struk | Total tagihan dan metode pembayaran tercetak | Otomatis | `responsesOrder.test.tsx` |
| TC-17d | F-17 | Mengirim pesanan tanpa item | Struk tetap terbaca dengan keterangan "Tidak Ada Item" | Otomatis | `responsesOrder.test.tsx` |
| TC-22a | F-22 | Mengirim pendaftaran kelas dengan tautan YouTube | Video disematkan sebagai `youtube.com/embed/<id>` | Otomatis | `responsesCourse.test.tsx` |
| TC-22b | F-22 | Memakai tautan pendek `youtu.be` | Tetap dikenali dan disematkan | Otomatis | `responsesCourse.test.tsx` |
| TC-22c | F-22 | Memakai penyedia video lain | Disajikan sebagai tautan, bukan iframe | Otomatis | `responsesCourse.test.tsx` |
| TC-22d | F-22 | Pengajar belum mengisi tautan video | Peserta diberi tahu pendaftarannya tetap tercatat | Otomatis | `responsesCourse.test.tsx` |
| TC-22e | F-22 | Membuka halaman pendaftaran kelas sebelum submit | Tautan video tidak muncul di mana pun di halaman | Manual | — |
| TC-11 | F-11 | Mendaftar acara lalu melihat tiket | Tiket memuat nama, sesi, lokasi, jumlah terdaftar, dan link Meet | Manual | — |
| TC-12 | F-12 | Membuka halaman pendaftaran acara | Link Google Meet tidak tampil sebelum submit berhasil | Manual | — |

---

## 5 · Unggahan berkas

| ID | Kebutuhan | Skenario | Hasil yang diharapkan | Jenis | Berkas |
| --- | --- | --- | --- | --- | --- |
| TC-10a | F-10 | Membuka pengunggah saat masih kosong | Disebutkan format yang diterima dan batas 4 MB | Otomatis | `uploadsBanner.test.tsx` |
| TC-10b | F-10 | Memilih berkas bukan gambar | Ditolak di klien, tidak dikirim ke server | Otomatis | `uploadsBanner.test.tsx` |
| TC-10c | F-10 | Memilih gambar lebih dari 4 MB | Ditolak di klien dengan pesan batas ukuran | Otomatis | `uploadsBanner.test.tsx` |
| TC-10d | F-10 | Gambar sudah terunggah | Pratinjau tampil beserta tombol ganti dan hapus | Otomatis | `uploadsBanner.test.tsx` |
| TC-10e | F-10 | Server menolak unggahan | Alasan dari server disampaikan apa adanya ke pengguna | Otomatis | `uploadsBanner.test.tsx` |
| TC-10f | F-10 | Mengunggah banner sungguhan ke Supabase Storage | Berkas tersimpan di bucket dan URL publiknya bisa dibuka | Manual | — |
| TC-10g | F-10 | Menjalankan aplikasi tanpa env Supabase | Unggahan menolak dengan pesan penyiapan, sisa aplikasi tetap jalan | Manual | — |

---

## 6 · Hasil & ekspor

| ID | Kebutuhan | Skenario | Hasil yang diharapkan | Jenis | Berkas |
| --- | --- | --- | --- | --- | --- |
| TC-08a | F-08 | Membuka hasil form ujian | Tampil skor dan peringkat responden | Manual | — |
| TC-08b | F-08 | Membuka hasil form acara, pesanan, atau kelas | Tampil daftar orang, bukan peringkat skor | Manual | — |
| TC-08c | F-08 | Membuka baris responden | Seluruh jawaban responden itu terbuka | Manual | — |
| TC-09a | F-09 | Menekan tombol CSV | Berkas berisi tepat tiga kolom: Nama, Nilai, Waktu Pengerjaan | Manual | — |
| TC-09b | F-09 | Mengekspor saat hasil terbagi beberapa halaman | Seluruh data ikut, bukan hanya halaman aktif | Manual | — |
| TC-25 | F-25 | Membuka tiket acara | Baris tanggal belum ada sampai penyelenggara bisa mengisinya di builder | Manual | — |

---

## 7 · Antarmuka umum

| ID | Kebutuhan | Skenario | Hasil yang diharapkan | Jenis | Berkas |
| --- | --- | --- | --- | --- | --- |
| TC-30a | F-30 | Memuat riwayat form | `LoadData` menampilkan ikon berputar; daftar form belum dirender | Otomatis | `formsList.test.tsx` |
| TC-30b | F-30 | Memuat halaman isi form | `LoadData` menampilkan ikon berputar, bukan layar kosong | Otomatis | `responsesSubmit.test.tsx` |
| TC-30c | F-30 | Keadaan memuat dibaca pembaca layar | Ikonnya `role="status"` berlabel Loading | Otomatis | `loadData.test.tsx` |
| TC-30d | F-30 | Keadaan kosong dan gagal | Judul serta alasannya tampil, isi aslinya tidak dirender | Otomatis | `loadData.test.tsx` |
| TC-30e | F-30 | Data sudah siap | Isi dirender dan tidak ada indikator memuat yang tersisa | Otomatis | `loadData.test.tsx` |
| TC-30f | F-30 | Membuka `/forms/[id]` sebelum router siap | Halaman menampilkan keadaan memuat, bukan layar kosong | Manual | — |
| TC-33a | F-33 | Membuka alamat yang tidak dikenal | Halaman 404 sendiri tampil dengan kode, judul, dan alasannya | Otomatis | `errorPages.test.tsx` |
| TC-33b | F-33 | Memeriksa halaman 404 | Ada jalan keluar ke beranda, daftar form, dan builder | Otomatis | `errorPages.test.tsx` |
| TC-33c | F-33 | Membuka halaman 500 | Dibedakan dari 404 dan tetap menyediakan jalan kembali | Otomatis | `errorPages.test.tsx` |
| TC-33d | F-33 | Membuka alamat tak dikenal di peramban | Server membalas status 404, bukan 200 | Manual | — |
| TC-26a | F-26 | Membuka halaman terkunci tanpa sesi | Dilempar ke `/login` dengan tujuan asal ikut di `?next=` | Otomatis | `authGuard.test.tsx` |
| TC-26b | F-26 | Sesi masih dibaca | Isi halaman belum dirender sama sekali; hanya indikator memuat | Otomatis | `authGuard.test.tsx` |
| TC-26c | F-26 | Membuka halaman terkunci dengan sesi | Isi halaman tampil dan tidak ada pengalihan | Otomatis | `authGuard.test.tsx` |
| TC-26d | F-26 | Membuka `/forms/[id]` tanpa login | Halaman isi form tetap terbuka — responden tidak dipaksa punya akun | Otomatis | `authGuard.test.tsx` |
| TC-26e | F-26 | Membuka halaman depan tanpa login | Halaman depan tetap terbuka | Otomatis | `authGuard.test.tsx` |
| TC-26f | F-26 | Login Google sampai kembali ke tujuan | Setelah izin diberikan, pengguna mendarat di halaman yang tadi dituju, bukan beranda | Manual | — |
| TC-26g | F-26 | Membatalkan izin di layar Google | Halaman callback menjelaskan login tidak selesai, tidak menggantung memuat | Manual | — |
| TC-26h | F-26 | Menekan tombol keluar | Sesi dihapus dan pengguna dikembalikan ke halaman depan | Manual | — |
| TC-26i | F-26 | Username diubah jadi alamat internal | Huruf besar dan spasi tersisa menghasilkan alamat yang sama; email Google tidak ikut dipotong | Otomatis | `authIdentity.test.ts` |
| TC-26j | F-26 | Username atau kata sandi tidak masuk akal | Ditolak dengan alasan yang menyebut batasannya | Otomatis | `authIdentity.test.ts` |
| TC-26k | F-26 | Membuka halaman masuk | Dua jalan tersedia: kolom username-kata sandi dan tombol Google | Otomatis | `authForm.test.tsx` |
| TC-26l | F-26 | Mengisi username dan kata sandi lalu menekan Masuk | Nilai yang diketik diteruskan ke jalur masuk, bukan jalur daftar | Otomatis | `authForm.test.tsx` |
| TC-26m | F-26 | Kata sandi kurang dari 8 karakter | Ditahan di klien; server tidak pernah dipanggil | Otomatis | `authForm.test.tsx` |
| TC-26n | F-26 | Menekan tombol Google dengan `?next=` terisi | Tujuan asal ikut dibawa ke alur OAuth | Otomatis | `authForm.test.tsx` |
| TC-26o | F-26 | `?next=` diisi alamat domain luar | Diabaikan dan diganti tujuan bawaan — halaman masuk tidak jadi alat pengalihan | Otomatis | `authForm.test.tsx` |
| TC-26p | F-26 | Membuka halaman daftar | Memakai jalur pendaftaran, tetap menawarkan Google, dan menyediakan tautan ke halaman masuk | Otomatis | `authForm.test.tsx` |
| TC-26q | F-26 | `GET /api/v1/forms` tanpa token | Dibalas 401; database tidak pernah disentuh | Otomatis | `formsOwnership.test.ts` |
| TC-26r | F-26 | `GET /api/v1/forms` dengan token | Penyaringan pemilik ada di query, jadi form akun lain tidak ikut terbaca | Otomatis | `formsOwnership.test.ts` |
| TC-26s | F-26 | `POST /api/v1/forms` tanpa token | Dibalas 401; tidak ada form yang tercipta | Otomatis | `formsOwnership.test.ts` |
| TC-26t | F-26 | `POST /api/v1/forms` membawa `userId` palsu di body | Pemilik diambil dari token; `userId` di body diabaikan | Otomatis | `formsOwnership.test.ts` |
| TC-26u | F-26 | Akun lain membuka jawaban atau analisis form yang bukan miliknya | Dibalas 403 dengan alasan yang jelas | Manual | — |
| TC-26v | F-26 | `POST /api/v1/uploads/banner` tanpa token | Dibalas 401 sebelum berkas diproses | Manual | — |
| TC-26w | F-26 | Token karangan sendiri dipasang di header | Dibalas 401 — tanda tangan token diverifikasi, bukan sekadar keberadaannya | Manual | — |
| TC-26x | F-26 | Mendaftar dengan username yang sudah dipakai | Dibalas 409 dengan ajakan memilih username lain | Manual | — |
| TC-26y | F-26 | Mengisi form lewat tautan publik setelah kepemilikan aktif | `GET /api/v1/forms/detail/[id]` dan pengiriman jawaban tetap jalan tanpa token | Manual | — |
| TC-26z | F-26 | Membuka halaman depan tanpa login | Katalog form terisi — `GET /api/v1/forms/public` tidak menyentuh penjaga sesi sama sekali | Otomatis | `formsPublic.test.ts` |
| TC-26aa | F-26 | Katalog publik dengan draf di database | Hanya form yang sudah dipublikasikan ikut terbaca; penyaringan ada di query | Otomatis | `formsPublic.test.ts` |
| TC-26ab | F-26 | Isi kolom yang dikirim katalog publik | `purpose`, `qrisUrl`, dan `userId` tidak ikut diminta dari database maupun dikirim | Otomatis | `formsPublic.test.ts` |
| TC-26ac | F-26 | Halaman depan dibuka pengunjung yang belum masuk | Tidak ada request ke endpoint terkunci — daftar form milik sendiri ditahan sampai ada sesi | Manual | — |
| TC-29a | F-29 | Membuka halaman depan | Urutan section: navbar, hero, statistik, pita, kategori, footer | Manual | — |
| TC-29b | F-29 | Membuka halaman depan di lebar ponsel | Navigasi berubah jadi tombol menu, isi tidak meluber ke samping | Manual | — |
| TC-29c | F-29 | Menekan "Jelajahi Kategori" | Halaman menggulir mulus ke bagian kategori | Manual | — |
| TC-29d | F-29 | Membaca ajakan di halaman depan | Tidak ada klaim bisa membuat form tanpa akun | Manual | — |
| TC-31a | F-31 | Membuka halaman depan dan halaman aplikasi | Lambang Blayer tampil di navbar dan di bilah atas, keduanya menautkan ke beranda | Manual | — |
| TC-31b | F-31 | Memeriksa tab peramban | Favicon memakai lambang Blayer, bukan ikon bawaan | Manual | — |
| TC-32a | F-32 | Membuka tiap halaman pada 320, 390, dan 768 px | `scrollWidth` sama dengan lebar viewport — tidak ada geseran samping | Manual | — |
| TC-32b | F-32 | Memeriksa elemen di lebar ponsel | Tidak ada elemen yang melewati tepi kecuali di dalam wadah yang memang menggulir | Manual | — |
| TC-32c | F-32 | Memeriksa tombol dan tautan di lebar ponsel | Semua sasaran sentuh minimal 32 px; kotak centang dibantu label yang bisa ditekan | Manual | — |
| TC-32d | F-32 | Membuka halaman depan di bawah 640 px | Navigasi berubah jadi tombol menu yang bisa dibuka dan ditutup | Manual | — |

---

## 8 · Belum diuji karena fiturnya belum ada

Kasus berikut sengaja belum ditulis. Kebutuhannya masih berstatus **Belum** di
PRD, jadi menuliskan ujinya sekarang hanya akan menghasilkan uji yang selalu
merah.

| Kebutuhan | Yang perlu diuji setelah fiturnya jadi |
| --- | --- |
| F-23 Verifikasi pembayaran otomatis | Status pembayaran berubah karena notifikasi gateway, bukan klaim pengisi |
| F-24 Penilaian ujian berbasis kunci jawaban | Skor dihitung dari ketepatan jawaban terhadap kunci |
| F-25 Detail acara oleh penyelenggara | Tanggal dan jam acara diambil dari builder, bukan jawaban pendaftar |
| F-27 Rekap pendapatan | Total pemasukan dan rinciannya per metode pembayaran |

---

## Catatan pemeliharaan

- Kasus **Otomatis** wajib hijau sebelum digabungkan; jalankan `npm test`.
- Kasus **Manual** dijalankan sebelum rilis, memakai data dari `npm run db:seed`.
- Pemeriksaan responsif (TC-32) dilakukan dengan emulasi perangkat, bukan sekadar
  mengecilkan jendela peramban — jendela desktop punya lebar minimum yang
  membuat hasil di bawah ±500 px menyesatkan.
- Setiap kebutuhan baru di PRD harus menambah baris di sini pada saat yang sama —
  ID kasus mengikuti nomor kebutuhannya (`F-14` → `TC-14a`, `TC-14b`, …).
