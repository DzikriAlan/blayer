import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Satu template = satu form demo.
 *
 * Setiap kali seed dijalankan, form lama dengan templateId yang sama dihapus
 * dulu, jadi riwayat di beranda tidak pernah menumpuk. Templat yang sudah
 * tidak dipakai ikut dibersihkan lewat OBSOLETE_TEMPLATE_IDS.
 */
const OBSOLETE_TEMPLATE_IDS = ['psychometric', 'csat', 'recruitment', 'blank']

const EXAM_FIELDS = [
  { label: 'Nama Lengkap', type: 'SHORT_TEXT', isRequired: true },
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

// answers diurutkan sama persis dengan EXAM_FIELDS di atas.
const STUDENTS = [
  {
    name: 'Rani Puspita',
    email: 'rani.puspita@sekolah.sch.id',
    durationSeconds: 2735,
    answers: [
      'Rani Puspita',
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
      'Bagas Aditya',
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
      'Intan Maharani',
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
      'Yoga Pratama',
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
      'Dimas Saputra',
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
      'Melati Anggraini',
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
  { label: 'Nama Lengkap', type: 'SHORT_TEXT', isRequired: true },
  { label: 'Email', type: 'EMAIL', isRequired: true },
  { label: 'Nomor WhatsApp', type: 'PHONE', isRequired: true },
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
  { label: 'Tanggal Kehadiran', type: 'DATE', isRequired: true },
  {
    label: 'Kebutuhan khusus (makanan, aksesibilitas, dll)',
    type: 'LONG_TEXT',
  },
]

const ATTENDEE_ROWS = [
  ['Sinta Larasati', 'Tokopedia', 'Sesi Malam (19.00 - 21.00)', 'Tidak ada.'],
  ['Arif Nugroho', 'Freelance', 'Sesi Pagi (09.00 - 12.00)', 'Vegetarian.'],
  ['Dewi Kartika', 'Bank Mandiri', 'Sesi Malam (19.00 - 21.00)', ''],
  ['Rizky Ramadhan', 'Universitas Indonesia', 'Sesi Siang (13.00 - 16.00)', ''],
  [
    'Putri Ayu',
    'Gojek',
    'Sesi Malam (19.00 - 21.00)',
    'Butuh transkrip karena saya tuli sebagian.',
  ],
  ['Bayu Setiawan', 'Startup sendiri', 'Sesi Pagi (09.00 - 12.00)', ''],
  ['Nadia Safitri', 'Telkom Indonesia', 'Sesi Malam (19.00 - 21.00)', ''],
  ['Fajar Hidayat', 'Binus University', 'Sesi Siang (13.00 - 16.00)', 'Halal.'],
  ['Ayu Lestari', 'Traveloka', 'Sesi Malam (19.00 - 21.00)', ''],
  ['Gilang Permana', 'Freelance', 'Sesi Pagi (09.00 - 12.00)', ''],
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

const seedExam = async () => {
  const form = await prisma.form.create({
    data: {
      title: '[DEMO] Ujian Tengah Semester — Sejarah Kelas XI',
      description:
        'Kerjakan seluruh soal dalam satu kali duduk. Halaman ini terkunci: pindah tab atau keluar layar penuh akan tercatat sebagai pelanggaran.',
      purpose: null,
      templateId: 'exam',
      isPublished: true,
      fields: { create: getCreatedFields(EXAM_FIELDS) },
    },
    include: { fields: { orderBy: { order: 'asc' } } },
  })

  for (const student of STUDENTS) {
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

  console.log(`• form ujian dibuat (${STUDENTS.length} siswa)`)
  return form.id
}

const seedEvent = async () => {
  const form = await prisma.form.create({
    data: {
      title: '[DEMO] Meetup Frontend Jakarta #7',
      description:
        'Ngobrol santai soal performa web dan design system. Link Google Meet dikirim setelah kamu berhasil mendaftar.',
      purpose: null,
      templateId: 'event',
      bannerUrl: '/event-banner-demo.svg',
      meetingUrl: 'https://meet.google.com/xyz-demo-blayer',
      isPublished: true,
      fields: { create: getCreatedFields(EVENT_FIELDS) },
    },
    include: { fields: { orderBy: { order: 'asc' } } },
  })

  for (const [name, instansi, sesi, kebutuhan] of ATTENDEE_ROWS) {
    const email = `${getSlug(name)}@mail.com`
    await prisma.formResponse.create({
      data: {
        formId: form.id,
        respondentName: name,
        respondentEmail: email,
        answers: getAnswers(form.fields, [
          name,
          email,
          '08123456789',
          instansi,
          sesi,
          '2026-08-24',
          kebutuhan,
        ]),
        // Pendaftaran diisi cepat, beda jauh dengan pengerjaan ujian.
        durationSeconds: 90 + ATTENDEE_ROWS.length * 7,
      },
    })
  }

  console.log(`• form acara dibuat (${ATTENDEE_ROWS.length} pendaftar)`)
  return form.id
}

const main = async () => {
  // Relasi pakai onDelete: Cascade, jadi field/jawaban/analisis ikut terhapus.
  const removed = await prisma.form.deleteMany({
    where: { templateId: { in: ['exam', 'event', ...OBSOLETE_TEMPLATE_IDS] } },
  })

  if (removed.count) console.log(`• ${removed.count} form demo lama dihapus`)

  const examId = await seedExam()
  const eventId = await seedEvent()

  console.log('\nSelesai. Buka:')
  console.log(`  ujian : /forms/${examId}  →  /forms/${examId}/result`)
  console.log(`  acara : /forms/${eventId}  →  /forms/${eventId}/result`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
