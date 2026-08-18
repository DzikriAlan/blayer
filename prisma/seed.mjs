import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEMO_TITLE = '[DEMO] Psikotes Kandidat — Frontend Engineer'

const FIELDS = [
  { label: 'Nama Lengkap', type: 'SHORT_TEXT', isRequired: true },
  { label: 'Email Aktif', type: 'EMAIL', isRequired: true },
  { label: 'Lama Pengalaman Kerja (tahun)', type: 'NUMBER', isRequired: true },
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
]

// answers diurutkan sama persis dengan FIELDS di atas.
const CANDIDATES = [
  {
    name: 'Rani Puspita',
    email: 'rani.puspita@mail.com',
    answers: [
      'Rani Puspita',
      'rani.puspita@mail.com',
      '5',
      'Memecah monolith React 200k baris jadi micro-frontend tanpa downtime. Saya mulai dengan memetakan dependency antar modul, bikin strangler pattern lewat module federation, lalu migrasi bertahap per rute sambil menjaga bundle size tetap turun 38%. Yang paling sulit justru koordinasi rilis dengan tiga tim lain, jadi saya bikin kontrak versi antar modul supaya rilis bisa independen.',
      'Reproduksi dulu sampai saya paham radius kerusakannya, lalu ukur berapa user yang kena. Kalau dampaknya besar saya rollback atau matikan lewat feature flag dulu supaya user aman, baru cari akar masalahnya dengan kepala dingin. Setelah itu saya kabari PM soal trade-off: fitur mana yang bisa digeser supaya perbaikan tidak dikerjakan terburu-buru.',
      '9',
      'Berpasangan (pair programming)',
    ],
    rank: 1,
    score: 92,
    verdict: 'Sangat Direkomendasikan',
    strengths: [
      'Jawaban proyek konkret dan terukur (bundle size turun 38%, zero downtime)',
      'Menunjukkan pemikiran sistemik lewat kontrak versi antar modul',
      'Prioritas saat krisis benar: amankan user dulu, baru cari akar masalah',
      'Skor keterbukaan terhadap kritik tertinggi (9) dan konsisten dengan preferensi pair programming',
    ],
    concerns: [
      'Belum ada bukti pengalaman memimpin atau mentoring secara langsung',
    ],
    reasoning:
      'Satu-satunya kandidat yang menyertakan angka dampak nyata dan menjelaskan trade-off rilis lintas tim. Cara menangani insiden menunjukkan kematangan: mitigasi dulu lewat feature flag, komunikasi ke PM, baru perbaikan. Sangat cocok dengan budaya kerja kolaboratif yang dicari.',
  },
  {
    name: 'Bagas Aditya',
    email: 'bagas.aditya@mail.com',
    answers: [
      'Bagas Aditya',
      'bagas.aditya@mail.com',
      '4',
      'Optimasi dashboard analitik yang render 50 ribu baris dan bikin browser hang. Saya pakai virtualisasi list plus memoisasi selector, waktu render turun dari 8 detik ke bawah 1 detik. Sempat salah arah karena awalnya saya kira masalahnya di query API, ternyata di re-render komponen.',
      'Cek dulu error tracking buat tahu seberapa sering bug-nya kena user. Kalau kritis saya perbaiki duluan dan minta QA bantu regression test. Saya juga akan bilang ke tim kalau deadline mungkin geser, daripada rilis sesuatu yang rusak.',
      '8',
      'Fleksibel, tergantung situasi',
    ],
    rank: 2,
    score: 84,
    verdict: 'Direkomendasikan',
    strengths: [
      'Contoh optimasi performa dengan angka sebelum-sesudah yang jelas',
      'Jujur mengakui sempat salah mendiagnosis akar masalah',
      'Berani menyampaikan risiko geser deadline daripada rilis yang rusak',
    ],
    concerns: [
      'Cakupan proyeknya lebih sempit dibanding kandidat peringkat satu',
      'Belum menyinggung pencegahan agar masalah serupa tidak terulang',
    ],
    reasoning:
      'Kemampuan teknis solid dengan bukti terukur, dan kejujuran soal salah diagnosis justru menandakan refleksi yang sehat. Skala pengalamannya masih di bawah Rani, tapi pola pikir menghadapi tekanan sudah tepat.',
  },
  {
    name: 'Intan Maharani',
    email: 'intan.maharani@mail.com',
    answers: [
      'Intan Maharani',
      'intan.maharani@mail.com',
      '3',
      'Membangun ulang design system perusahaan dari nol supaya konsisten di lima produk. Tantangannya meyakinkan tim desain dan engineering pakai token yang sama. Hasilnya waktu bikin halaman baru berkurang cukup banyak.',
      'Saya akan fokus benerin bug-nya dulu sampai kelar, lembur kalau perlu. Setelah itu baru lapor ke atasan hasilnya bagaimana.',
      '7',
      'Dalam tim besar',
    ],
    rank: 3,
    score: 71,
    verdict: 'Dipertimbangkan',
    strengths: [
      'Pengalaman design system yang relevan dan lintas tim',
      'Terbiasa menjembatani desain dan engineering',
    ],
    concerns: [
      'Klaim hasil tidak disertai angka ("berkurang cukup banyak")',
      'Respons saat krisis langsung lembur tanpa menilai dampak ke user lebih dulu',
      'Komunikasi ke atasan ditaruh setelah pekerjaan selesai, bukan saat risiko muncul',
    ],
    reasoning:
      'Latar belakang design system-nya berharga dan relevan, tapi cara menghadapi tekanan masih reaktif: mengandalkan lembur alih-alih mengukur dampak dan mengelola ekspektasi lebih awal. Layak lanjut kalau posisi yang dicari condong ke design system.',
  },
  {
    name: 'Yoga Pratama',
    email: 'yoga.pratama@mail.com',
    answers: [
      'Yoga Pratama',
      'yoga.pratama@mail.com',
      '2',
      'Bikin fitur checkout multi-step. Susahnya di validasi tiap langkah dan state yang harus tetap tersimpan kalau user mundur. Saya selesaikan pakai state machine sederhana.',
      'Langsung cari tahu penyebabnya di kode, biasanya saya cek commit terakhir yang mengubah bagian itu.',
      '6',
      'Sendiri dengan fokus penuh',
    ],
    rank: 4,
    score: 58,
    verdict: 'Cadangan',
    strengths: [
      'Pemilihan state machine untuk alur checkout menunjukkan dasar yang benar',
      'Punya kebiasaan menelusuri commit terakhir saat debugging',
    ],
    concerns: [
      'Jawaban sangat singkat, minim konteks dampak maupun kolaborasi',
      'Tidak menyinggung komunikasi ke tim sama sekali saat kondisi mendesak',
      'Preferensi kerja sendiri berpotensi kurang pas dengan budaya kolaboratif yang dicari',
    ],
    reasoning:
      'Dasar teknisnya masuk akal untuk pengalaman dua tahun, tapi seluruh jawabannya berhenti di level teknis tanpa menyentuh dampak ke pengguna atau koordinasi tim. Data yang tersedia belum cukup untuk menilai kesiapannya di lingkungan kolaboratif.',
  },
  {
    name: 'Dimas Saputra',
    email: 'dimas.saputra@mail.com',
    answers: [
      'Dimas Saputra',
      'dimas.saputra@mail.com',
      '1',
      'Pernah bikin landing page pakai React dan Tailwind. Lumayan menantang karena banyak animasi.',
      'Tanya senior dulu enaknya gimana.',
      '5',
      'Sendiri dengan fokus penuh',
    ],
    rank: 5,
    score: 39,
    verdict: 'Belum Sesuai',
    strengths: [
      'Sadar diri untuk bertanya ke senior ketika menghadapi masalah besar',
    ],
    concerns: [
      'Pengalaman satu tahun dengan cakupan proyek paling ringan di antara pelamar',
      'Jawaban situasional hanya satu kalimat, tanpa langkah konkret apa pun',
      'Tidak ada bukti menangani masalah kompleks maupun bekerja di bawah tekanan',
    ],
    reasoning:
      'Jawaban terlalu ringkas untuk dinilai secara adil. Kesediaan bertanya ke senior itu positif, tapi tidak ada satu pun contoh penanganan masalah kompleks. Berdasarkan data yang ada, belum memenuhi kebutuhan posisi ini.',
  },
]

const main = async () => {
  const existing = await prisma.form.findFirst({
    where: { title: DEMO_TITLE },
    select: { id: true },
  })

  if (existing) {
    // Relasi pakai onDelete: Cascade, jadi field/jawaban/analisis ikut terhapus.
    await prisma.form.delete({ where: { id: existing.id } })
    console.log('• data demo lama dihapus')
  }

  const purpose =
    'Menyeleksi kandidat untuk posisi Frontend Engineer. Nilai kemampuan problem solving, ketahanan menghadapi tekanan, kemauan belajar, dan kecocokan dengan budaya kerja kolaboratif. Beri peringkat kandidat dan tentukan siapa yang paling layak dilanjutkan ke tahap interview beserta alasannya.'

  const form = await prisma.form.create({
    data: {
      title: DEMO_TITLE,
      description:
        'Jawab sejujurnya berdasarkan pengalaman nyata. Tidak ada jawaban benar atau salah.',
      purpose,
      templateId: 'psychometric',
      isPublished: true,
      fields: {
        create: FIELDS.map((field, index) => ({
          label: field.label,
          type: field.type,
          isRequired: field.isRequired ?? false,
          options: field.options ?? undefined,
          order: index,
        })),
      },
    },
    include: { fields: { orderBy: { order: 'asc' } } },
  })

  console.log(`• form dibuat (${form.fields.length} field)`)

  const ranking = []

  for (const candidate of CANDIDATES) {
    const answers = {}
    form.fields.forEach((field, index) => {
      answers[field.id] = candidate.answers[index]
    })

    const response = await prisma.formResponse.create({
      data: {
        formId: form.id,
        respondentName: candidate.name,
        respondentEmail: candidate.email,
        answers,
      },
      select: { id: true },
    })

    ranking.push({
      responseId: response.id,
      respondentName: candidate.name,
      rank: candidate.rank,
      score: candidate.score,
      verdict: candidate.verdict,
      strengths: candidate.strengths,
      concerns: candidate.concerns,
      reasoning: candidate.reasoning,
    })
  }

  console.log(`• ${ranking.length} jawaban kandidat dibuat`)

  await prisma.formAnalysis.create({
    data: {
      formId: form.id,
      purpose,
      summary:
        'Lima kandidat masuk dengan rentang pengalaman satu sampai lima tahun dan kualitas jawaban yang cukup jauh jaraknya. Dua kandidat teratas sama-sama menyertakan angka dampak yang bisa diverifikasi dan menunjukkan cara berpikir yang terstruktur saat menghadapi insiden. Tiga sisanya berhenti di level teknis tanpa menyentuh dampak ke pengguna maupun koordinasi tim, dan satu kandidat menjawab terlalu singkat untuk dinilai secara adil. Pola yang paling membedakan bukan lama pengalaman, melainkan apakah kandidat mengukur dampak pekerjaannya dan mengelola komunikasi saat berada di bawah tekanan.',
      recommendation:
        'Lanjutkan Rani Puspita ke tahap interview sebagai prioritas utama. Ia satu-satunya yang menggabungkan bukti dampak terukur, penanganan insiden yang mengutamakan keamanan pengguna, dan preferensi kerja kolaboratif yang paling cocok dengan tim. Bagas Aditya layak diinterview sebagai kandidat kedua, dengan penggalian lebih dalam soal pencegahan masalah berulang. Intan Maharani dijadikan cadangan dan baru relevan bila kebutuhan bergeser ke design system. Yoga Pratama dan Dimas Saputra belum disarankan untuk tahap ini.',
      ranking,
    },
  })

  console.log('• hasil analisis AI dummy dibuat')

  const surveyId = await seedSurvey()

  console.log('\nSelesai. Buka:')
  console.log(`  scoring : /forms/${form.id}/result`)
  console.log(`  summary : /forms/${surveyId}/result`)
}

// Template kedua (kind: summary) untuk membandingkan bentuk dashboard.
const SURVEY_TITLE = '[DEMO] Survei Kepuasan Pelanggan'

const SURVEY_FIELDS = [
  { label: 'Nama', type: 'SHORT_TEXT' },
  { label: 'Bagaimana penilaianmu secara keseluruhan?', type: 'RATING', isRequired: true },
  {
    label: 'Seberapa besar kemungkinan kamu merekomendasikan kami ke teman?',
    type: 'SCALE',
    isRequired: true,
  },
  {
    label: 'Layanan apa saja yang pernah kamu gunakan?',
    type: 'CHECKBOX',
    isRequired: true,
    options: [
      'Pembelian produk',
      'Layanan pelanggan',
      'Pengiriman',
      'Garansi dan retur',
      'Aplikasi mobile',
    ],
  },
  {
    label: 'Apa yang menurutmu paling perlu diperbaiki?',
    type: 'LONG_TEXT',
    isRequired: true,
  },
]

// Digenerate supaya jumlahnya banyak dan pagination dashboard kelihatan bekerja.
const SURVEY_NAMES = [
  'Sinta Larasati', 'Arif Nugroho', 'Melati Anggraini', 'Dewi Kartika',
  'Rizky Ramadhan', 'Putri Ayu', 'Bayu Setiawan', 'Nadia Safitri',
  'Fajar Hidayat', 'Ayu Lestari', 'Gilang Permana', 'Rina Wulandari',
  'Hendra Gunawan', 'Citra Maharani', 'Doni Prasetyo', 'Lina Marlina',
  'Agus Salim', 'Fitri Handayani', 'Reza Mahendra', 'Wulan Sari',
  'Andi Kurniawan', 'Maya Puspitasari', 'Eko Wibowo', 'Tari Oktaviani',
  'Bagus Santoso', 'Nurul Aini', 'Ilham Maulana', 'Kartika Dewi',
  'Surya Adiputra', 'Vina Rahmawati', 'Teguh Prakoso', 'Hesti Ningrum',
  'Dimas Anggara', 'Salsabila Putri', 'Yudha Pratama', 'Ratna Kusuma',
  'Bimo Aryo', 'Indah Permatasari', 'Galih Saputra', 'Anisa Rahma',
]

const SURVEY_LAYANAN = [
  'Pembelian produk', 'Layanan pelanggan', 'Pengiriman',
  'Garansi dan retur', 'Aplikasi mobile',
]

const SURVEY_MASUKAN = [
  'Notifikasi pengiriman sering telat masuk, padahal barangnya sudah sampai.',
  'Respons CS cepat, tapi jawabannya masih template. Butuh solusi yang lebih spesifik.',
  'Proses retur terlalu panjang, harus mengulang data yang sama di tiga form berbeda.',
  'Sudah bagus. Kalau bisa tambahkan riwayat pesanan yang lebih mudah dicari.',
  'Ongkos kirim ke luar Jawa masih mahal dibanding kompetitor.',
  'Aplikasi kadang force close saat membuka halaman checkout.',
  'Stok di aplikasi tidak sinkron dengan gudang, sudah dua kali pesanan saya dibatalkan.',
  'Fitur pencarian kurang pintar, salah ketik sedikit langsung nihil hasilnya.',
  'Pengemasan rapi dan aman, tidak ada keluhan sama sekali dari saya.',
  'Metode pembayaran perlu ditambah, belum ada opsi cicilan tanpa kartu kredit.',
  'Halaman detail produk lambat dimuat kalau fotonya banyak.',
  'Kurir sering tidak menghubungi dulu sebelum sampai di alamat.',
]

// Distribusi sengaja dibikin timpang supaya peringkatnya terlihat bervariasi.
const SURVEY_RESPONSES = SURVEY_NAMES.map((name, index) => {
  const rating = [5, 4, 2, 5, 3, 4, 1, 5, 3, 4, 2, 5][index % 12]
  const scale = [9, 8, 4, 10, 6, 7, 2, 9, 5, 8, 3, 10][index % 12]
  const layanan = SURVEY_LAYANAN.slice(0, (index % 5) + 1)
  return [name, String(rating), String(scale), layanan, SURVEY_MASUKAN[index % SURVEY_MASUKAN.length]]
})

const seedSurvey = async () => {
  const existing = await prisma.form.findFirst({
    where: { title: SURVEY_TITLE },
    select: { id: true },
  })
  if (existing) await prisma.form.delete({ where: { id: existing.id } })

  const survey = await prisma.form.create({
    data: {
      title: SURVEY_TITLE,
      description:
        'Masukanmu membantu kami memperbaiki layanan. Pengisian hanya butuh dua menit.',
      purpose: null,
      templateId: 'csat',
      isPublished: true,
      fields: {
        create: SURVEY_FIELDS.map((field, index) => ({
          label: field.label,
          type: field.type,
          isRequired: field.isRequired ?? false,
          options: field.options ?? undefined,
          order: index,
        })),
      },
    },
    include: { fields: { orderBy: { order: 'asc' } } },
  })

  for (const row of SURVEY_RESPONSES) {
    const answers = {}
    survey.fields.forEach((field, index) => {
      answers[field.id] = row[index]
    })
    await prisma.formResponse.create({
      data: {
        formId: survey.id,
        respondentName: row[0],
        respondentEmail: '',
        answers,
      },
    })
  }

  console.log(`• form survei dibuat (${SURVEY_RESPONSES.length} jawaban)`)
  return survey.id
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
