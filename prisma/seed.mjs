import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()

const SEED_OWNER_EMAIL = 'adminblayerganteng@blayer.id'
let ownerId = ''

const getOwnerId = async () => {
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

const OBSOLETE_TEMPLATE_IDS = [
  'csat',
  'recruitment',
  'blank',
  'psychometric',
  'freelance',
  'course',
  'exam',
  'restaurant',
  'event',
]

const getEventFields = (sessions) => [
  { label: 'Asal Instansi atau Komunitas', type: 'SHORT_TEXT' },
  { label: 'Pilih Sesi', type: 'SELECT', isRequired: true, options: sessions },
]

const TECH_SESSIONS = [
  'Sesi Pagi (09.00 - 12.00)',
  'Sesi Siang (13.00 - 16.00)',
  'Sesi Malam (19.00 - 21.00)',
]

const SPORT_SESSIONS = ['Sesi Pagi (07.00 - 10.00)', 'Sesi Sore (15.00 - 18.00)']

const MUSIC_SESSIONS = [
  'Sesi Sore (16.00 - 18.00)',
  'Sesi Malam (19.30 - 22.00)',
]

const BUSINESS_SESSIONS = [
  'Sesi Siang (13.00 - 15.00)',
  'Sesi Malam (19.00 - 21.00)',
]

const ATTENDEE_NAMES = [
  ['Sinta Larasati', 'Tokopedia'],
  ['Arif Nugroho', 'Pekerja Mandiri'],
  ['Dewi Kartika', 'Bank Mandiri'],
  ['Rizky Ramadhan', 'Universitas Indonesia'],
  ['Putri Ayu', 'Gojek'],
  ['Bayu Setiawan', 'Startup sendiri'],
  ['Nadia Safitri', 'Telkom Indonesia'],
  ['Fajar Hidayat', 'Binus University'],
  ['Ayu Lestari', 'Traveloka'],
  ['Gilang Permana', 'Komunitas Lari Senayan'],
]

const getAttendees = (sessions, total) =>
  ATTENDEE_NAMES.slice(0, total).map(([name, instansi], index) => [
    name,
    instansi,
    sessions[index % sessions.length],
  ])

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

const EVENT_FORMS = [
  {
    templateId: 'event-tech',
    sessions: TECH_SESSIONS,
    title: '[DEMO] Meetup Frontend Jakarta #7',
    description:
      'Ngobrol santai soal performa web dan design system. Link Google Meet dikirim setelah kamu berhasil mendaftar.',
    meetingUrl: 'https://meet.google.com/xyz-demo-blayer',
    totalAttendee: 10,
  },
  {
    templateId: 'event-tech',
    sessions: TECH_SESSIONS,
    title: '[DEMO] Workshop Design System untuk Tim Produk',
    description:
      'Praktik menyusun token, komponen, dan dokumentasi yang dipakai lintas tim. Peserta dibatasi 30 orang per sesi.',
    meetingUrl: 'https://meet.google.com/dsw-demo-blayer',
    totalAttendee: 6,
  },
  {
    templateId: 'event-sport',
    sessions: SPORT_SESSIONS,
    title: '[DEMO] Turnamen Futsal Antar Komunitas',
    description:
      'Terbuka untuk tim campuran. Setiap tim mengirim satu pendaftar sebagai perwakilan.',
    meetingUrl: null,
    totalAttendee: 8,
  },
  {
    templateId: 'event-sport',
    sessions: SPORT_SESSIONS,
    title: '[DEMO] Fun Run 5K Akhir Pekan',
    description:
      'Lari santai menyusuri kota bersama komunitas. Nomor dada diambil sehari sebelum acara.',
    meetingUrl: null,
    totalAttendee: 10,
  },
  {
    templateId: 'event-music',
    sessions: MUSIC_SESSIONS,
    title: '[DEMO] Pentas Musik Akustik',
    description:
      'Panggung terbuka untuk musisi lokal. Tempat duduk terbatas, datang lebih awal.',
    meetingUrl: null,
    totalAttendee: 7,
  },
  {
    templateId: 'event-business',
    sessions: BUSINESS_SESSIONS,
    title: '[DEMO] Webinar Karier di Industri Teknologi',
    description:
      'Sesi tanya jawab bareng praktisi soal jalur karier, portofolio, dan proses rekrutmen. Gratis untuk umum.',
    meetingUrl: 'https://meet.google.com/kar-demo-blayer',
    totalAttendee: 9,
  },
]

const seedEvent = async () => {
  const ids = []

  for (const demo of EVENT_FORMS) {
    const form = await prisma.form.create({
      data: {
        userId: ownerId,
        title: demo.title,
        description: demo.description,
        purpose: null,
        templateId: demo.templateId,
        bannerUrl: '/event-banner-demo.svg',
        meetingUrl: demo.meetingUrl,
        isPublished: true,
        fields: { create: getCreatedFields(getEventFields(demo.sessions)) },
      },
      include: { fields: { orderBy: { order: 'asc' } } },
    })

    const attendees = getAttendees(demo.sessions, demo.totalAttendee)

    for (const [name, instansi, sesi] of attendees) {
      const email = `${getSlug(name)}@mail.com`
      await prisma.formResponse.create({
        data: {
          formId: form.id,
          respondentName: getDemoName(name),
          respondentEmail: email,
          answers: getAnswers(form.fields, [instansi, sesi]),
          durationSeconds: 90 + attendees.length * 7,
        },
      })
    }

    ids.push(form.id)
  }

  console.log(`• ${EVENT_FORMS.length} form acara dibuat`)
  return ids[0]
}

const main = async () => {
  ownerId = await getOwnerId()
  console.log(`• pemilik form demo: ${SEED_OWNER_EMAIL} (${ownerId})`)

  const removed = await prisma.form.deleteMany({
    where: {
      templateId: {
        in: [
          'event-tech',
          'event-sport',
          'event-music',
          'event-business',
          ...OBSOLETE_TEMPLATE_IDS,
        ],
      },
    },
  })

  if (removed.count) console.log(`• ${removed.count} form demo lama dihapus`)

  const eventId = await seedEvent()

  console.log('\nSelesai. Buka:')
  console.log(`  acara : /forms/${eventId}  →  /forms/${eventId}/result`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
