import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Satu template = beberapa form demo.
 *
 * Setiap kali seed dijalankan, form lama dengan templateId yang sama dihapus
 * dulu, jadi riwayat di beranda tidak pernah menumpuk. Templat yang sudah
 * tidak dipakai ikut dibersihkan lewat OBSOLETE_TEMPLATE_IDS.
 */
const OBSOLETE_TEMPLATE_IDS = ['psychometric', 'csat', 'recruitment', 'blank']

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
          respondentName: student.name,
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

const seedEvent = async () => {
  const ids = []

  for (const demo of EVENT_FORMS) {
    const form = await prisma.form.create({
      data: {
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
          respondentName: name,
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
          respondentName: name,
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
          respondentName: name,
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
  // Relasi pakai onDelete: Cascade, jadi field/jawaban/analisis ikut terhapus.
  const removed = await prisma.form.deleteMany({
    where: {
      templateId: {
        in: ['exam', 'event', 'restaurant', 'course', ...OBSOLETE_TEMPLATE_IDS],
      },
    },
  })

  if (removed.count) console.log(`• ${removed.count} form demo lama dihapus`)

  const examId = await seedExam()
  const eventId = await seedEvent()
  const restaurantId = await seedRestaurant()
  const courseId = await seedCourse()

  console.log('\nSelesai. Buka:')
  console.log(`  ujian    : /forms/${examId}  →  /forms/${examId}/result`)
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
