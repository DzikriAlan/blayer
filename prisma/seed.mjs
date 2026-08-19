import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

// Form demo harus punya pemilik seperti form biasa, kalau tidak seed gagal di
// kolom userId yang sekarang wajib. Pemiliknya akun admin, jadi data demo ikut
// terlihat saat masuk sebagai admin.
const SEED_OWNER_EMAIL = 'blayeradmin@blayer.id'
let ownerId = ''

const getOwnerId = async () => {
  // Jalan pintas untuk lingkungan tanpa akses Supabase, mis. CI.
  const explicit = process.env.SEED_OWNER_ID?.trim()
  if (explicit) return explicit

  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ''
  ).trim()

  if (!url || !key) {
    throw new Error(
      'Seed butuh pemilik form. Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env, atau set SEED_OWNER_ID dengan id pengguna Supabase.'
    )
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const { data, error } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (error) throw error

  const owner = data?.users?.find((user) => user.email === SEED_OWNER_EMAIL)

  if (!owner) {
    throw new Error(
      `Akun ${SEED_OWNER_EMAIL} belum ada di Supabase Auth. Daftarkan lebih dulu lewat /register, atau set SEED_OWNER_ID.`
    )
  }

  return owner.id
}

/**
 * Satu template = beberapa form demo.
 *
 * Setiap kali seed dijalankan, form lama dengan templateId yang sama dihapus
 * dulu, jadi riwayat di beranda tidak pernah menumpuk. Templat yang sudah
 * tidak dipakai ikut dibersihkan lewat OBSOLETE_TEMPLATE_IDS.
 */
const OBSOLETE_TEMPLATE_IDS = ['csat', 'recruitment', 'blank']

// Nama dan email tidak pernah jadi field: halaman isi sudah punya dua kolom
// identitas bawaan yang mengisi respondentName dan respondentEmail.
const EXAM_FIELDS = [
  {
    label: 'Kelas',
    type: 'SELECT',
    isRequired: true,
    options: ['XI IPA 1', 'XI IPA 2', 'XI IPA 3', 'XI IPS 1', 'XI IPS 2'],
  },
  { label: 'Nomor Absen', type: 'NUMBER', isRequired: true },
  {
    label: 'Siapa tokoh yang membacakan teks Proklamasi Kemerdekaan Indonesia?',
    type: 'RADIO',
    isRequired: true,
    options: [
      'Soekarno dan Mohammad Hatta',
      'Jenderal Sudirman dan Tan Malaka',
      'Sutan Syahrir dan Amir Syarifuddin',
      'Pangeran Diponegoro dan Imam Bonjol',
    ],
  },
  {
    label:
      'Sebutkan dan jelaskan tiga faktor yang melatarbelakangi lahirnya pergerakan nasional.',
    type: 'LONG_TEXT',
    isRequired: true,
  },
  {
    label:
      'Jelaskan dampak Politik Etis terhadap munculnya kaum terpelajar pribumi.',
    type: 'LONG_TEXT',
    isRequired: true,
  },
  {
    label: 'Seberapa yakin kamu dengan jawabanmu secara keseluruhan?',
    type: 'SCALE',
  },
]

// answers diurutkan sama persis dengan EXAM_FIELDS di atas; nama dan email
// tidak ikut karena keduanya mengisi respondentName dan respondentEmail.
const STUDENTS = [
  {
    name: 'Rani Puspita',
    email: 'rani.puspita@sekolah.sch.id',
    durationSeconds: 2735,
    answers: [
      'XI IPA 1',
      '24',
      'Soekarno dan Mohammad Hatta',
      'Pertama, Politik Etis membuka sekolah bagi pribumi sehingga lahir golongan terpelajar yang sadar akan nasib bangsanya, terlihat dari berdirinya Budi Utomo 1908. Kedua, penderitaan akibat tanam paksa dan kerja rodi menumbuhkan kesadaran bahwa perlawanan daerah selalu gagal karena tidak terorganisasi. Ketiga, kemenangan Jepang atas Rusia 1905 membuktikan bangsa Asia sanggup mengalahkan bangsa Eropa, dan ini membakar semangat kaum pergerakan.',
      'Politik Etis lewat program edukasi melahirkan sekolah seperti STOVIA dan OSVIA yang awalnya disiapkan untuk mencetak pegawai murah bagi Belanda. Yang terjadi justru sebaliknya: para lulusannya membaca gagasan nasionalisme dan demokrasi dari Eropa, lalu memakainya untuk mengkritik penjajahan. Dari sekolah-sekolah inilah muncul Soetomo, Tjipto Mangoenkoesoemo, dan Ki Hajar Dewantara.',
      '9',
    ],
  },
  {
    name: 'Bagas Aditya',
    email: 'bagas.aditya@sekolah.sch.id',
    durationSeconds: 3120,
    answers: [
      'XI IPA 1',
      '05',
      'Soekarno dan Mohammad Hatta',
      'Faktor pertama adalah pendidikan dari Politik Etis yang memunculkan kaum terpelajar. Faktor kedua penderitaan rakyat akibat penjajahan yang berlangsung lama. Faktor ketiga pengaruh dari luar seperti kemenangan Jepang atas Rusia dan gerakan nasionalisme di India dan Filipina yang jadi contoh.',
      'Dampaknya muncul sekolah-sekolah untuk pribumi sehingga ada kaum terpelajar. Mereka inilah yang kemudian mendirikan organisasi pergerakan seperti Budi Utomo dan Indische Partij karena sudah paham cara berorganisasi modern.',
      '8',
    ],
  },
  {
    name: 'Intan Maharani',
    email: 'intan.maharani@sekolah.sch.id',
    durationSeconds: 2410,
    answers: [
      'XI IPA 2',
      '12',
      'Soekarno dan Mohammad Hatta',
      'Karena rakyat menderita akibat penjajahan, karena ada pendidikan untuk pribumi, dan karena terpengaruh pergerakan di negara lain. Ketiganya membuat rakyat ingin merdeka dan mulai membentuk organisasi.',
      'Politik Etis membuat rakyat pribumi bisa sekolah. Setelah sekolah mereka jadi pintar dan mengerti bahwa penjajahan itu merugikan, lalu ikut berjuang lewat organisasi.',
      '7',
    ],
  },
  {
    name: 'Yoga Pratama',
    email: 'yoga.pratama@sekolah.sch.id',
    durationSeconds: 1580,
    answers: [
      'XI IPS 1',
      '31',
      'Sutan Syahrir dan Amir Syarifuddin',
      'Faktor internal karena rakyat menderita. Faktor eksternal karena pengaruh negara lain. Faktor ketiga karena adanya pendidikan.',
      'Banyak pribumi yang bisa sekolah sehingga muncul orang pintar yang memimpin pergerakan.',
      '5',
    ],
  },
  {
    name: 'Dimas Saputra',
    email: 'dimas.saputra@sekolah.sch.id',
    durationSeconds: 954,
    answers: [
      'XI IPS 2',
      '08',
      'Jenderal Sudirman dan Tan Malaka',
      'Karena rakyat ingin merdeka dan tidak mau dijajah lagi.',
      'Rakyat jadi bisa sekolah.',
      '3',
    ],
  },
  {
    name: 'Melati Anggraini',
    email: 'melati.anggraini@sekolah.sch.id',
    durationSeconds: 3540,
    answers: [
      'XI IPA 3',
      '19',
      'Soekarno dan Mohammad Hatta',
      'Faktor pertama adalah lahirnya golongan terpelajar hasil Politik Etis yang mampu berpikir dalam skala kebangsaan, bukan lagi kedaerahan. Faktor kedua adalah kegagalan perlawanan bersenjata di daerah seperti Perang Diponegoro dan Perang Aceh yang mengajarkan bahwa perjuangan harus terorganisasi. Faktor ketiga adalah pengaruh gerakan nasionalisme Asia, terutama kemenangan Jepang atas Rusia tahun 1905 dan pergerakan di India.',
      'Program edukasi Politik Etis membuka akses sekolah bagi anak pribumi, khususnya kalangan priyayi. Lulusan STOVIA dan sekolah guru inilah yang pertama menyadari ketimpangan sistem kolonial karena mereka membacanya lewat kacamata ilmu pengetahuan Barat. Ironisnya, kebijakan yang dimaksudkan menenangkan rakyat justru melahirkan kelompok yang paling kritis terhadap Belanda.',
      '10',
    ],
  },
]

// Urutannya sama persis dengan template psikotes di katalog, karena jawaban
// demo di bawah dipetakan ke field berdasarkan posisi.
const PSYCHOMETRIC_POSITIONS = [
  'Frontend Engineer',
  'Backend Engineer',
  'Product Designer',
  'Data Analyst',
  'Project Manager',
]

const PSYCHOMETRIC_FIELDS = [
  {
    label: 'Posisi yang Dilamar',
    type: 'SELECT',
    isRequired: true,
    options: PSYCHOMETRIC_POSITIONS,
  },
  { label: 'Lama Pengalaman Kerja (tahun)', type: 'NUMBER', isRequired: true },
  { label: 'Tautan CV atau LinkedIn', type: 'URL', isRequired: true },
  {
    label:
      'Ceritakan satu proyek tersulit yang pernah kamu tangani dan bagaimana kamu menyelesaikannya.',
    type: 'LONG_TEXT',
    isRequired: true,
  },
  {
    label:
      'Deadline tinggal dua hari, lalu ditemukan bug besar di fitur utama. Apa yang kamu lakukan pertama kali?',
    type: 'LONG_TEXT',
    isRequired: true,
  },
  {
    label: 'Saya nyaman menerima kritik atas hasil kerja saya.',
    type: 'SCALE',
    isRequired: true,
  },
  {
    label: 'Saya paling produktif ketika bekerja...',
    type: 'RADIO',
    isRequired: true,
    options: [
      'Sendiri dengan fokus penuh',
      'Berpasangan (pair programming)',
      'Dalam tim besar',
      'Fleksibel, tergantung situasi',
    ],
  },
  { label: 'Kapan Bisa Mulai Bekerja', type: 'DATE', isRequired: true },
  {
    label: 'Bidang apa yang ingin kamu dalami setahun ke depan?',
    type: 'CHECKBOX',
    options: [
      'Performance',
      'Accessibility',
      'Design System',
      'Testing',
      'DevOps',
    ],
  },
]

// answers diurutkan sama dengan PSYCHOMETRIC_FIELDS; nama dan email tidak ikut
// karena keduanya mengisi respondentName dan respondentEmail.
const APPLICANTS = [
  {
    name: 'Alya Rahmadani',
    email: 'alya.rahmadani@mail.com',
    durationSeconds: 1840,
    answers: [
      'Frontend Engineer',
      '4',
      'https://linkedin.com/in/alya-rahmadani',
      'Migrasi dashboard internal dari Angular lama ke React tanpa membekukan rilis fitur. Saya pecah per modul, jalankan dua kerangka berdampingan di balik satu shell, lalu pindahkan satu layar tiap sprint sambil menahan agar bundle tidak membengkak. Enam bulan selesai, waktu muat halaman awal turun dari 5,2 detik ke 1,8 detik.',
      'Saya kumpulkan buktinya dulu — reproduksi, cakupan pengguna yang kena, dan sejak rilis mana muncul. Baru setelah itu saya bawa ke PM dengan dua pilihan: tunda fitur kecil di rilis ini, atau kirim perbaikan sementara yang aman. Yang tidak saya lakukan adalah menambal buru-buru tanpa tahu akarnya.',
      '9',
      'Berpasangan (pair programming)',
      '2026-09-15',
      ['Performance', 'Accessibility', 'Design System'],
    ],
  },
  {
    name: 'Reza Fadhilah',
    email: 'reza.fadhilah@mail.com',
    durationSeconds: 2210,
    answers: [
      'Frontend Engineer',
      '3',
      'https://github.com/rezafadhilah',
      'Membangun ulang alur pembayaran e-commerce yang tingkat gagalnya 12%. Saya lacak lewat log dan ternyata sebagian besar gagal karena timeout di perangkat lambat. Saya potong tiga panggilan API jadi satu, tambah retry dengan backoff, dan siapkan status pembayaran yang bisa dipulihkan. Tingkat gagal turun ke 3%.',
      'Cek dampaknya ke pengguna dulu: berapa banyak yang kena dan seberapa parah. Kalau bisa dimatikan lewat feature flag, saya matikan dulu supaya tidak terus merugikan, baru perbaiki dengan kepala dingin.',
      '8',
      'Fleksibel, tergantung situasi',
      '2026-10-01',
      ['Performance', 'Testing'],
    ],
  },
  {
    name: 'Nabila Kusuma',
    email: 'nabila.kusuma@mail.com',
    durationSeconds: 1520,
    answers: [
      'Frontend Engineer',
      '2',
      'https://linkedin.com/in/nabilakusuma',
      'Saya menangani halaman katalog yang lambat karena semua gambar dimuat sekaligus. Saya pakai lazy loading dan ukuran gambar responsif, lalu hasilnya halaman jadi jauh lebih ringan di ponsel.',
      'Saya laporkan ke lead dulu supaya keputusannya tidak diambil sendirian, sambil mulai menelusuri penyebabnya.',
      '7',
      'Dalam tim besar',
      '2026-09-01',
      ['Accessibility', 'Design System'],
    ],
  },
  {
    name: 'Damar Prasetyo',
    email: 'damar.prasetyo@mail.com',
    durationSeconds: 980,
    answers: [
      'Frontend Engineer',
      '1',
      'https://github.com/damarpras',
      'Saya pernah membuat landing page perusahaan sendirian. Sulit karena desainnya banyak berubah, tapi akhirnya selesai tepat waktu.',
      'Langsung diperbaiki secepatnya supaya tidak menghambat rilis.',
      '6',
      'Sendiri dengan fokus penuh',
      '2026-08-25',
      ['Testing'],
    ],
  },
  {
    name: 'Sekar Ayu Pratiwi',
    email: 'sekar.pratiwi@mail.com',
    durationSeconds: 2680,
    answers: [
      'Product Designer',
      '5',
      'https://dribbble.com/sekarayu',
      'Menyatukan tiga produk yang antarmukanya berbeda-beda ke dalam satu design system. Tantangannya bukan komponen, tapi meyakinkan tiga tim dengan prioritas berbeda. Saya mulai dari komponen yang paling sering dipakai, ukur berapa layar yang bisa dipangkas, lalu pakai angka itu untuk mengajak tim berikutnya.',
      'Saya duduk bareng engineer untuk tahu opsi teknisnya dulu, lalu saya siapkan versi desain yang lebih sederhana yang tetap menyelesaikan masalah pengguna kalau memang waktunya mepet.',
      '10',
      'Berpasangan (pair programming)',
      '2026-09-20',
      ['Design System', 'Accessibility'],
    ],
  },
  {
    name: 'Gilang Ramadhan',
    email: 'gilang.ramadhan@mail.com',
    durationSeconds: 1330,
    answers: [
      'Data Analyst',
      '3',
      'https://linkedin.com/in/gilangramadhan',
      'Membereskan laporan penjualan yang angkanya selalu beda antara tim finance dan tim produk. Ternyata keduanya memakai definisi transaksi yang berbeda. Saya susun satu kamus metrik dan satu tabel sumber, lalu semua laporan diarahkan ke sana.',
      'Saya cari dulu seberapa besar datanya terpengaruh, karena bug di data biasanya diam-diam sudah mengotori laporan sebelumnya.',
      '8',
      'Fleksibel, tergantung situasi',
      '2026-10-05',
      ['Performance', 'Testing'],
    ],
  },
]

const EVENT_FIELDS = [
  { label: 'Asal Instansi atau Perusahaan', type: 'SHORT_TEXT' },
  {
    label: 'Pilih Sesi',
    type: 'SELECT',
    isRequired: true,
    options: [
      'Sesi Pagi (09.00 - 12.00)',
      'Sesi Siang (13.00 - 16.00)',
      'Sesi Malam (19.00 - 21.00)',
    ],
  },
]

// [nama, instansi, sesi]
const ATTENDEE_ROWS = [
  ['Sinta Larasati', 'Tokopedia', 'Sesi Malam (19.00 - 21.00)'],
  ['Arif Nugroho', 'Freelance', 'Sesi Pagi (09.00 - 12.00)'],
  ['Dewi Kartika', 'Bank Mandiri', 'Sesi Malam (19.00 - 21.00)'],
  ['Rizky Ramadhan', 'Universitas Indonesia', 'Sesi Siang (13.00 - 16.00)'],
  ['Putri Ayu', 'Gojek', 'Sesi Malam (19.00 - 21.00)'],
  ['Bayu Setiawan', 'Startup sendiri', 'Sesi Pagi (09.00 - 12.00)'],
  ['Nadia Safitri', 'Telkom Indonesia', 'Sesi Malam (19.00 - 21.00)'],
  ['Fajar Hidayat', 'Binus University', 'Sesi Siang (13.00 - 16.00)'],
  ['Ayu Lestari', 'Traveloka', 'Sesi Malam (19.00 - 21.00)'],
  ['Gilang Permana', 'Freelance', 'Sesi Pagi (09.00 - 12.00)'],
]

const MENU_OPTIONS = [
  'Nasi Goreng Kampung|28000|/menu-nasi-goreng.svg',
  'Ayam Bakar Madu|35000|/menu-ayam-bakar.svg',
  'Sate Ayam Bumbu Kacang|32000|/menu-sate-ayam.svg',
  'Mie Goreng Seafood|30000|/menu-mie-goreng.svg',
  'Es Teh Manis|8000|/menu-es-teh.svg',
  'Es Jeruk Peras|12000|/menu-es-jeruk.svg',
]

const RESTAURANT_PAYMENT_OPTIONS = [
  'QRIS|Pindai kode di layar pakai aplikasi bank atau e-wallet apa pun',
  'Transfer Bank|Transfer ke rekening kasir, tunjukkan bukti ke pelayan',
  'Kartu Debit/Kredit|Bayar di kasir memakai mesin EDC',
  'Tunai|Bayar langsung di kasir setelah makan',
]

const RESTAURANT_FIELDS = [
  {
    label: 'Nomor Meja',
    type: 'SELECT',
    isRequired: true,
    options: [
      'Meja 01',
      'Meja 02',
      'Meja 03',
      'Meja 04',
      'Meja 05',
      'Meja 06',
      'Meja 07',
      'Meja 08',
    ],
  },
  { label: 'Pilih Menu', type: 'MENU', isRequired: true, options: MENU_OPTIONS },
  {
    label: 'Cara Penyajian',
    type: 'RADIO',
    isRequired: true,
    options: ['Makan di tempat', 'Bungkus dibawa pulang'],
  },
  { label: 'Catatan untuk Dapur', type: 'LONG_TEXT' },
  {
    label: 'Metode Pembayaran',
    type: 'PAYMENT',
    isRequired: true,
    options: RESTAURANT_PAYMENT_OPTIONS,
  },
]

// [nama, meja, item pesanan, penyajian, catatan, metode, total]
// Nama hanya mengisi respondentName, bukan jawaban field.
const ORDER_ROWS = [
  [
    'Bagas Wicaksono',
    'Meja 03',
    ['Nasi Goreng Kampung x2', 'Es Teh Manis x2'],
    'Makan di tempat',
    'Nasi gorengnya pedas sedang.',
    'QRIS',
    72000,
  ],
  [
    'Intan Permata',
    'Meja 01',
    ['Ayam Bakar Madu', 'Es Jeruk Peras'],
    'Makan di tempat',
    '',
    'QRIS',
    47000,
  ],
  [
    'Reza Maulana',
    'Meja 06',
    ['Sate Ayam Bumbu Kacang x3', 'Es Teh Manis'],
    'Bungkus dibawa pulang',
    'Bumbu kacang dipisah.',
    'Transfer Bank',
    104000,
  ],
  [
    'Salsabila Putri',
    'Meja 02',
    ['Mie Goreng Seafood', 'Es Jeruk Peras x2'],
    'Makan di tempat',
    'Tanpa bawang.',
    'Tunai',
    54000,
  ],
  [
    'Hendra Gunawan',
    'Meja 08',
    ['Nasi Goreng Kampung', 'Ayam Bakar Madu', 'Es Teh Manis x2'],
    'Makan di tempat',
    '',
    'Kartu Debit/Kredit',
    79000,
  ],
]

// Kelasnya satu, jadi harganya melekat pada form — bukan dipilih ulang peserta.
const COURSE_PRICE = 350000

const COURSE_PAYMENT_OPTIONS = [
  'QRIS|Pindai kode di layar pakai aplikasi bank atau e-wallet apa pun',
  'Transfer Bank|Transfer ke rekening yang tertera, simpan buktinya',
  'Virtual Account|Bayar lewat VA di aplikasi bankmu',
]

const COURSE_FIELDS = [
  { label: 'Nomor WhatsApp', type: 'PHONE', isRequired: true },
  {
    label: 'Level Pengalamanmu',
    type: 'RADIO',
    isRequired: true,
    options: [
      'Belum pernah sama sekali',
      'Sudah pernah belajar mandiri',
      'Sudah bekerja di bidang ini',
    ],
  },
  { label: 'Apa yang ingin kamu capai setelah kelas ini?', type: 'LONG_TEXT' },
  {
    label: 'Metode Pembayaran',
    type: 'PAYMENT',
    isRequired: true,
    options: COURSE_PAYMENT_OPTIONS,
  },
]

// [nama, level, tujuan, metode]
const STUDENT_ROWS = [
  [
    'Nabila Az-Zahra',
    'Sudah pernah belajar mandiri',
    'Ingin bisa membangun aplikasi sendiri dari nol sampai rilis.',
    'QRIS',
  ],
  [
    'Aditya Wijaya',
    'Belum pernah sama sekali',
    'Mau coba pindah karier ke bidang teknologi.',
    'Transfer Bank',
  ],
  [
    'Kirana Maheswari',
    'Sudah bekerja di bidang ini',
    'Butuh mentor untuk mereview arsitektur proyek kantor.',
    'Virtual Account',
  ],
  [
    'Yusuf Ramadhan',
    'Belum pernah sama sekali',
    'Ingin punya portofolio pertama sebelum melamar kerja.',
    'QRIS',
  ],
]

/**
 * Penanda data contoh.
 *
 * Judul form sudah memakainya sejak awal; nama responden ikut ditandai supaya
 * tidak ada satu pun baris di dashboard hasil yang terbaca seperti orang
 * sungguhan. Emailnya tetap diturunkan dari nama aslinya agar tetap wajar.
 */
const getDemoName = (name) => `[DEMO] ${name}`

const getSlug = (name) =>
  name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('.')

const getAnswers = (fields, values) => {
  const answers = {}
  fields.forEach((field, index) => {
    answers[field.id] = values[index]
  })
  return answers
}

const getCreatedFields = (list) =>
  list.map((field, index) => ({
    label: field.label,
    type: field.type,
    isRequired: field.isRequired ?? false,
    options: field.options ?? undefined,
    order: index,
  }))

/**
 * Tiap template punya beberapa form demo, bukan satu, supaya tombol
 * "Eksplor Kategori" di landing page selalu menemukan isi. Entri pertama
 * adalah demo utama yang dipakai contoh di README dan output seed.
 */
const EXAM_FORMS = [
  {
    title: '[DEMO] Ujian Tengah Semester — Sejarah Kelas XI',
    description:
      'Kerjakan seluruh soal dalam satu kali duduk. Halaman ini terkunci: pindah tab atau keluar layar penuh akan tercatat sebagai pelanggaran.',
    students: STUDENTS,
  },
  {
    title: '[DEMO] Ujian Akhir Semester — Sejarah Kelas XI',
    description:
      'Penilaian penutup satu semester. Soal esai dinilai dari ketepatan argumen dan bukti peristiwa yang kamu sebutkan.',
    students: STUDENTS.slice(0, 3),
  },
  {
    title: '[DEMO] Remedial Sejarah — Pergerakan Nasional',
    description:
      'Kesempatan kedua untuk siswa yang nilainya belum tuntas. Fokus soal ada pada latar belakang lahirnya pergerakan nasional.',
    students: STUDENTS.slice(3),
  },
]

const PSYCHOMETRIC_FORMS = [
  {
    title: '[DEMO] Frontend Engineer — PT Nusantara Digital',
    description:
      'Jakarta Selatan · Hybrid · Penuh Waktu · S1 Teknik Informatika · 2-4 tahun pengalaman. Kerjakan psikotesnya sekarang, hasilnya langsung dinilai. Jawab sejujurnya berdasarkan pengalaman nyata — tidak ada jawaban benar atau salah.',
    bannerUrl: '/job-logo-nusantara.svg',
    applicants: APPLICANTS,
  },
  {
    title: '[DEMO] Product Designer — Arunika Labs',
    description:
      'Bandung · Kerja Jarak Jauh · Penuh Waktu · S1 Desain Komunikasi Visual · 3-5 tahun pengalaman. Psikotes berisi soal situasional seputar kerja lintas tim dan cara mengambil keputusan desain saat waktunya sempit.',
    bannerUrl: '/job-logo-arunika.svg',
    applicants: APPLICANTS.slice(0, 3),
  },
  {
    title: '[DEMO] Data Analyst — Sentra Data Group',
    description:
      'Surabaya · Kerja di Kantor · Kontrak 12 Bulan · D3/S1 Statistika · Terbuka untuk lulusan baru. Psikotes menakar ketelitian, cara membaca angka yang janggal, dan ketahanan mengerjakan hal berulang.',
    bannerUrl: '/job-logo-sentra.svg',
    applicants: APPLICANTS.slice(3),
  },
]

const EVENT_FORMS = [
  {
    title: '[DEMO] Meetup Frontend Jakarta #7',
    description:
      'Ngobrol santai soal performa web dan design system. Link Google Meet dikirim setelah kamu berhasil mendaftar.',
    bannerUrl: '/event-banner-demo.svg',
    meetingUrl: 'https://meet.google.com/xyz-demo-blayer',
    attendees: ATTENDEE_ROWS,
  },
  {
    title: '[DEMO] Workshop Design System untuk Tim Produk',
    description:
      'Praktik menyusun token, komponen, dan dokumentasi yang dipakai lintas tim. Peserta dibatasi 30 orang per sesi.',
    bannerUrl: '/event-banner-demo.svg',
    meetingUrl: 'https://meet.google.com/dsw-demo-blayer',
    attendees: ATTENDEE_ROWS.slice(0, 6),
  },
  {
    title: '[DEMO] Webinar Karier di Industri Teknologi',
    description:
      'Sesi tanya jawab bareng praktisi soal jalur karier, portofolio, dan proses rekrutmen. Gratis untuk umum.',
    bannerUrl: '/event-banner-demo.svg',
    meetingUrl: 'https://meet.google.com/kar-demo-blayer',
    attendees: ATTENDEE_ROWS.slice(4),
  },
]

const RESTAURANT_FORMS = [
  {
    title: '[DEMO] Pesan Menu — Warung Blayer',
    description:
      'Pilih makanan dan minumanmu, lalu bayar lewat QRIS atau metode lain. Pesanan langsung masuk ke dapur setelah pembayaran dikonfirmasi.',
    orders: ORDER_ROWS,
  },
  {
    title: '[DEMO] Pesan Menu — Warung Blayer Cabang Kemang',
    description:
      'Menu sama, dapur berbeda. Pesanan dari meja mana pun langsung tercatat untuk kasir cabang Kemang.',
    orders: ORDER_ROWS.slice(0, 3),
  },
  {
    title: '[DEMO] Pesan Menu — Blayer Kopi & Dapur Bandung',
    description:
      'Pesan dari meja tanpa antre di kasir. Cocok dipakai saat jam makan siang ramai.',
    orders: ORDER_ROWS.slice(2),
  },
]

const COURSE_FORMS = [
  {
    title: '[DEMO] Kelas Online — Dasar Membangun Web',
    description:
      'Lengkapi data diri, lalu selesaikan pembayaran. Video materi langsung terbuka begitu formulir terkirim.',
    bannerUrl: '/class-intensive.svg',
    videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
    students: STUDENT_ROWS,
  },
  {
    title: '[DEMO] Kelas Online — Bikin API dengan Node.js',
    description:
      'Belajar merancang endpoint, autentikasi, dan basis data dari nol. Rekaman bisa diulang kapan saja setelah mendaftar.',
    bannerUrl: '/class-basic.svg',
    videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
    students: STUDENT_ROWS.slice(0, 2),
  },
  {
    title: '[DEMO] Kelas Online — UI Design untuk Developer',
    description:
      'Dasar tipografi, spasi, dan warna supaya antarmuka buatanmu rapi tanpa perlu menunggu desainer.',
    bannerUrl: '/class-mentoring.svg',
    videoUrl: 'https://www.youtube.com/watch?v=YiLUYf4HDh4',
    students: STUDENT_ROWS.slice(1),
  },
]

const seedExam = async () => {
  const ids = []

  for (const demo of EXAM_FORMS) {
    const form = await prisma.form.create({
      data: {
        userId: ownerId,
        title: demo.title,
        description: demo.description,
        purpose: null,
        templateId: 'exam',
        isPublished: true,
        fields: { create: getCreatedFields(EXAM_FIELDS) },
      },
      include: { fields: { orderBy: { order: 'asc' } } },
    })

    for (const student of demo.students) {
      await prisma.formResponse.create({
        data: {
          formId: form.id,
          respondentName: getDemoName(student.name),
          respondentEmail: student.email,
          answers: getAnswers(form.fields, student.answers),
          durationSeconds: student.durationSeconds,
        },
      })
    }

    ids.push(form.id)
  }

  console.log(`• ${EXAM_FORMS.length} form ujian dibuat`)
  return ids[0]
}

const seedPsychometric = async () => {
  const ids = []

  for (const demo of PSYCHOMETRIC_FORMS) {
    const form = await prisma.form.create({
      data: {
        userId: ownerId,
        title: demo.title,
        description: demo.description,
        purpose: null,
        templateId: 'psychometric',
        // Banner lowongan dipakai sebagai logo perusahaan di papan lowongan.
        bannerUrl: demo.bannerUrl,
        isPublished: true,
        fields: { create: getCreatedFields(PSYCHOMETRIC_FIELDS) },
      },
      include: { fields: { orderBy: { order: 'asc' } } },
    })

    for (const applicant of demo.applicants) {
      await prisma.formResponse.create({
        data: {
          formId: form.id,
          respondentName: getDemoName(applicant.name),
          respondentEmail: applicant.email,
          answers: getAnswers(form.fields, applicant.answers),
          durationSeconds: applicant.durationSeconds,
        },
      })
    }

    ids.push(form.id)
  }

  console.log(`• ${PSYCHOMETRIC_FORMS.length} form psikotes dibuat`)
  return ids[0]
}

const seedEvent = async () => {
  const ids = []

  for (const demo of EVENT_FORMS) {
    const form = await prisma.form.create({
      data: {
        userId: ownerId,
        title: demo.title,
        description: demo.description,
        purpose: null,
        templateId: 'event',
        bannerUrl: demo.bannerUrl,
        meetingUrl: demo.meetingUrl,
        isPublished: true,
        fields: { create: getCreatedFields(EVENT_FIELDS) },
      },
      include: { fields: { orderBy: { order: 'asc' } } },
    })

    for (const [name, instansi, sesi] of demo.attendees) {
      const email = `${getSlug(name)}@mail.com`
      await prisma.formResponse.create({
        data: {
          formId: form.id,
          respondentName: getDemoName(name),
          respondentEmail: email,
          answers: getAnswers(form.fields, [instansi, sesi]),
          // Pendaftaran diisi cepat, beda jauh dengan pengerjaan ujian.
          durationSeconds: 90 + demo.attendees.length * 7,
        },
      })
    }

    ids.push(form.id)
  }

  console.log(`• ${EVENT_FORMS.length} form acara dibuat`)
  return ids[0]
}

const seedRestaurant = async () => {
  const ids = []

  for (const demo of RESTAURANT_FORMS) {
    const form = await prisma.form.create({
      data: {
        userId: ownerId,
        title: demo.title,
        description: demo.description,
        purpose: null,
        templateId: 'restaurant',
        bannerUrl: '/menu-nasi-goreng.svg',
        qrisUrl: '/menu-es-teh.svg',
        isPublished: true,
        fields: { create: getCreatedFields(RESTAURANT_FIELDS) },
      },
      include: { fields: { orderBy: { order: 'asc' } } },
    })

    for (const [
      name,
      table,
      orderItems,
      serving,
      note,
      method,
      amount,
    ] of demo.orders) {
      await prisma.formResponse.create({
        data: {
          formId: form.id,
          respondentName: getDemoName(name),
          // Form pesanan tidak menanyakan email, jadi tidak ada yang disimpan.
          respondentEmail: null,
          answers: getAnswers(form.fields, [
            table,
            orderItems,
            serving,
            note,
            // Metode pembayaran disimpan bersama nominalnya, sama seperti
            // yang dilakukan halaman pengisian saat form dikirim.
            `${method} — Rp${amount.toLocaleString('id-ID')}`,
          ]),
          durationSeconds: 120 + orderItems.length * 25,
        },
      })
    }

    ids.push(form.id)
  }

  console.log(`• ${RESTAURANT_FORMS.length} form restoran dibuat`)
  return ids[0]
}

const seedCourse = async () => {
  const ids = []

  for (const demo of COURSE_FORMS) {
    const form = await prisma.form.create({
      data: {
        userId: ownerId,
        title: demo.title,
        description: demo.description,
        purpose: null,
        templateId: 'course',
        bannerUrl: demo.bannerUrl,
        qrisUrl: '/menu-es-teh.svg',
        videoUrl: demo.videoUrl,
        priceAmount: COURSE_PRICE,
        isPublished: true,
        fields: { create: getCreatedFields(COURSE_FIELDS) },
      },
      include: { fields: { orderBy: { order: 'asc' } } },
    })

    for (const [name, level, goal, method] of demo.students) {
      await prisma.formResponse.create({
        data: {
          formId: form.id,
          respondentName: getDemoName(name),
          respondentEmail: `${getSlug(name)}@mail.com`,
          answers: getAnswers(form.fields, [
            '08123456789',
            level,
            goal,
            // Metode pembayaran disimpan bersama nominalnya, sama seperti
            // yang dilakukan halaman pengisian saat form dikirim.
            `${method} — Rp${COURSE_PRICE.toLocaleString('id-ID')}`,
          ]),
          durationSeconds: 180 + goal.length,
        },
      })
    }

    ids.push(form.id)
  }

  console.log(`• ${COURSE_FORMS.length} form kursus dibuat`)
  return ids[0]
}

const main = async () => {
  ownerId = await getOwnerId()
  console.log(`• pemilik form demo: ${SEED_OWNER_EMAIL} (${ownerId})`)

  // Relasi pakai onDelete: Cascade, jadi field/jawaban/analisis ikut terhapus.
  const removed = await prisma.form.deleteMany({
    where: {
      templateId: {
        in: [
          'exam',
          'psychometric',
          'event',
          'restaurant',
          'course',
          ...OBSOLETE_TEMPLATE_IDS,
        ],
      },
    },
  })

  if (removed.count) console.log(`• ${removed.count} form demo lama dihapus`)

  const examId = await seedExam()
  const psychometricId = await seedPsychometric()
  const eventId = await seedEvent()
  const restaurantId = await seedRestaurant()
  const courseId = await seedCourse()

  console.log('\nSelesai. Buka:')
  console.log(`  ujian    : /forms/${examId}  →  /forms/${examId}/result`)
  console.log(
    `  psikotes : /forms/${psychometricId}  →  /forms/${psychometricId}/result`
  )
  console.log(`  acara    : /forms/${eventId}  →  /forms/${eventId}/result`)
  console.log(
    `  restoran : /forms/${restaurantId}  →  /forms/${restaurantId}/result`
  )
  console.log(`  kursus   : /forms/${courseId}  →  /forms/${courseId}/result`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
