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

const ATTENDEE_ROWS = [
  ['Sinta Larasati', 'Tokopedia', 'Sesi Malam (19.00 - 21.00)'],
  ['Arif Nugroho', 'Pekerja Mandiri', 'Sesi Pagi (09.00 - 12.00)'],
  ['Dewi Kartika', 'Bank Mandiri', 'Sesi Malam (19.00 - 21.00)'],
  ['Rizky Ramadhan', 'Universitas Indonesia', 'Sesi Siang (13.00 - 16.00)'],
  ['Putri Ayu', 'Gojek', 'Sesi Malam (19.00 - 21.00)'],
  ['Bayu Setiawan', 'Startup sendiri', 'Sesi Pagi (09.00 - 12.00)'],
  ['Nadia Safitri', 'Telkom Indonesia', 'Sesi Malam (19.00 - 21.00)'],
  ['Fajar Hidayat', 'Binus University', 'Sesi Siang (13.00 - 16.00)'],
  ['Ayu Lestari', 'Traveloka', 'Sesi Malam (19.00 - 21.00)'],
  ['Gilang Permana', 'Pekerja Mandiri', 'Sesi Pagi (09.00 - 12.00)'],
]

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
          durationSeconds: 90 + demo.attendees.length * 7,
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
      templateId: { in: ['event', ...OBSOLETE_TEMPLATE_IDS] },
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
