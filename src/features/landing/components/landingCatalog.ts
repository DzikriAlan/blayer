import {
  BookOpen,
  GitBranch,
  KeyRound,
  LineChart,
  PlayCircle,
  Plug,
  ShieldCheck,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react'

export interface LandingNavLink {
  href: string
  label: string
}

export interface LandingProduct {
  id: string
  title: string
  description: string
  icon: LucideIcon
  points: string[]
}

export interface LandingStep {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

export interface LandingBlueprint {
  id: string
  title: string
  description: string
  parts: string[]
  isWide: boolean
}

export interface LandingStatus {
  id: string
  title: string
  description: string
  state: 'jalan' | 'belum'
}

export interface LandingQuestion {
  id: string
  question: string
  answer: string
}

export interface LandingFooterColumn {
  title: string
  links: LandingNavLink[]
}

export const REPO_URL = 'https://github.com/DzikriAlan/blayer'

export const LANDING_NAV: LandingNavLink[] = [
  { href: '/#produk', label: 'Produk' },
  { href: '/#cara-kerja', label: 'Cara kerja' },
  { href: '/#sdk', label: 'SDK' },
  { href: '/#status', label: 'Status' },
  { href: `${REPO_URL}/blob/main/docs/AGENT_API.md`, label: 'Dokumentasi' },
]

// Tujuh bagian produk yang benar-benar ada di dalam Console dan API-nya.
export const LANDING_PRODUCTS: LandingProduct[] = [
  {
    id: 'agent',
    title: 'Agent & versi',
    description:
      'Instruksi, model, effort, dan batas token tersimpan sebagai konfigurasi bernomor — bukan prompt yang tercecer di kode tiap project.',
    icon: SlidersHorizontal,
    points: [
      'Tiap perubahan lahir sebagai draf',
      'Versi production tidak berubah diam-diam',
      'Rollback cukup menerbitkan versi lama',
      'Dua provider, tiga environment',
    ],
  },
  {
    id: 'playground',
    title: 'Playground & pratinjau',
    description:
      'Coba agent sebelum dipakai orang lain. Pratinjau bahkan berjalan sebelum agentnya disimpan.',
    icon: PlayCircle,
    points: [],
  },
  {
    id: 'tools',
    title: 'Tool lewat integration',
    description:
      'Blayer menyimpan kontraknya — nama, method, path, skema. Yang menjalankan tetap endpoint milik projectmu.',
    icon: Plug,
    points: [],
  },
  {
    id: 'knowledge',
    title: 'Knowledge',
    description:
      'Dokumen rujukan disimpan terpisah dari prompt, lalu dipasang per versi agent.',
    icon: BookOpen,
    points: [],
  },
  {
    id: 'guardrail',
    title: 'Konfirmasi tool tulis',
    description:
      'Agent boleh meminta, tapi tidak memutuskan. Eksekusi berhenti dan menunggu persetujuan sebelum data berubah.',
    icon: ShieldCheck,
    points: [],
  },
  {
    id: 'observability',
    title: 'Observability',
    description:
      'Tiap eksekusi tercatat — termasuk yang gagal. Success rate, latency, token, dan biayanya angka sebenarnya.',
    icon: LineChart,
    points: [],
  },
  {
    id: 'keys',
    title: 'Kunci & environment',
    description:
      'Kredensial provider terenkripsi di instance-mu, dipisah per project dan environment. API key project punya prefix dan bisa dicabut.',
    icon: KeyRound,
    points: [],
  },
]

// Yang dipakai membangun Blayer. Bukan daftar pelanggan — belum ada yang bisa
// disebut, dan halaman ini tidak mengarang satu pun.
export const LANDING_STACK = [
  'Next.js',
  'TypeScript',
  'Prisma',
  'PostgreSQL',
  'Tailwind CSS',
  'TanStack Query',
  'Zustand',
  'Zod',
  'Anthropic',
  'OpenAI',
  'Docker',
  'Vitest',
]

export const LANDING_STEPS: LandingStep[] = [
  {
    id: 'build',
    title: 'Rancang agentnya',
    description: 'Instruksi, model, dan batas tokennya di satu tempat.',
    icon: SlidersHorizontal,
  },
  {
    id: 'test',
    title: 'Coba jawabannya',
    description: 'Pratinjau jalan bahkan sebelum agentnya disimpan.',
    icon: PlayCircle,
  },
  {
    id: 'publish',
    title: 'Terbitkan versinya',
    description: 'Versi lama diarsipkan, bukan ditimpa.',
    icon: GitBranch,
  },
  {
    id: 'call',
    title: 'Panggil lewat API',
    description: 'Satu endpoint, satu API key, per project dan environment.',
    icon: KeyRound,
  },
]

// Pola yang bisa disusun sendiri di Console memakai bagian yang sudah ada.
// Bukan berkas siap unduh — tidak ada template yang dijanjikan di sini.
export const LANDING_BLUEPRINTS: LandingBlueprint[] = [
  {
    id: 'accounting',
    title: 'Asisten akuntansi',
    description:
      'Menjawab pertanyaan laporan dari API akuntansimu sendiri, tanpa menyalin datanya ke mana pun.',
    parts: ['Tool READ', 'Knowledge kebijakan', 'Environment terpisah'],
    isWide: true,
  },
  {
    id: 'support',
    title: 'Triase dukungan',
    description:
      'Membaca tiket masuk, merangkum, dan mengusulkan tindakan — yang mengubah status tetap menunggu persetujuan.',
    parts: ['Tool READ + WRITE', 'Konfirmasi manusia', 'Sesi percakapan'],
    isWide: true,
  },
  {
    id: 'invoice',
    title: 'Pembaca faktur',
    description: 'Menarik angka dari dokumen lalu mengembalikannya terstruktur.',
    parts: ['Knowledge', 'Batas token'],
    isWide: false,
  },
  {
    id: 'internal',
    title: 'Tanya jawab internal',
    description: 'Menjawab dari dokumen perusahaan, bukan dari ingatan model.',
    parts: ['Knowledge', 'Guardrail'],
    isWide: false,
  },
  {
    id: 'ops',
    title: 'Operasi harian',
    description: 'Memanggil beberapa tool berurutan dalam satu permintaan.',
    parts: ['Tool loop', 'Observability'],
    isWide: false,
  },
  {
    id: 'embed',
    title: 'Agent di produkmu',
    description: 'Dipanggil aplikasi lain lewat satu API key per environment.',
    parts: ['SDK TypeScript', 'API key'],
    isWide: false,
  },
]

// Terang-terangan: yang sudah jalan dan yang belum, tanpa dipoles.
export const LANDING_STATUS: LandingStatus[] = [
  {
    id: 'core',
    title: 'Agent, versi, dan eksekusi',
    description:
      'Project, API key, agent beserta versinya, eksekusi lewat API, Playground, dan riwayat eksekusi sudah jalan penuh.',
    state: 'jalan',
  },
  {
    id: 'tools',
    title: 'Tool, knowledge, dan memory',
    description:
      'Integration beserta kontrak toolnya, dokumen pengetahuan, sesi percakapan, dan konfirmasi tool tulis sudah jalan.',
    state: 'jalan',
  },
  {
    id: 'selfhost',
    title: 'Self-host',
    description:
      'Docker Compose, migrasi Prisma, rate limit lintas instance, dan kredensial terenkripsi AES-256-GCM.',
    state: 'jalan',
  },
  {
    id: 'multiuser',
    title: 'Banyak pengguna',
    description:
      'Console masih satu kredensial operator. Tim, peran, dan audit per pengguna belum dibangun.',
    state: 'belum',
  },
  {
    id: 'streaming',
    title: 'Jawaban mengalir',
    description:
      'Eksekusi menjawab sekali jadi. Streaming token per token belum ada.',
    state: 'belum',
  },
]

export const LANDING_QUESTIONS: LandingQuestion[] = [
  {
    id: 'data',
    question: 'Data bisnis saya ikut tersimpan di Blayer?',
    answer:
      'Tidak. Yang tersimpan adalah konfigurasi agent dan kontrak toolnya. Data bisnismu tetap di API milikmu, dan Blayer memanggilnya saat dibutuhkan.',
  },
  {
    id: 'key',
    question: 'Kunci provider saya disimpan di mana?',
    answer:
      'Di basis data instance-mu sendiri, terenkripsi AES-256-GCM dengan kunci yang hanya ada di environment-mu. Tidak ada server pusat yang menerimanya.',
  },
  {
    id: 'write',
    question: 'Bagaimana kalau agent salah mengubah data?',
    answer:
      'Tool yang mengubah data berhenti menunggu persetujuan. Tanpa konfirmasi, tidak ada yang berubah — termasuk di pratinjau, yang memang tidak menjalankannya sama sekali.',
  },
  {
    id: 'model',
    question: 'Model apa saja yang didukung?',
    answer:
      'Anthropic dan OpenAI, dengan katalog model beserta harga dan kemampuannya. Endpoint sebentuk Chat Completions lain bisa dipakai lewat OPENAI_BASE_URL.',
  },
  {
    id: 'cost',
    question: 'Biayanya dari mana?',
    answer:
      'Blayer tidak menagih apa pun. Yang berbiaya adalah pemakaian provider dengan kuncimu sendiri, dan angkanya terbaca per eksekusi.',
  },
  {
    id: 'license',
    question: 'Lisensinya apa?',
    answer:
      'MIT. Boleh dipakai, diubah, dan dijalankan di infrastruktur siapa pun tanpa izin tambahan.',
  },
]

export const LANDING_PROPERTIES = [
  'Kredensial terenkripsi AES-256-GCM',
  'API key project bisa dicabut',
  'Rate limit lintas instance',
  'Lisensi MIT',
]

export const LANDING_FOOTER: LandingFooterColumn[] = [
  {
    title: 'Produk',
    links: [
      { href: '/#produk', label: 'Bagian produk' },
      { href: '/#cara-kerja', label: 'Cara kerja' },
      { href: '/#sdk', label: 'SDK' },
      { href: '/#pola', label: 'Pola agent' },
      { href: '/#status', label: 'Status' },
    ],
  },
  {
    title: 'Dokumentasi',
    links: [
      { href: `${REPO_URL}/blob/main/docs/AGENT_API.md`, label: 'Agent API' },
      { href: `${REPO_URL}/blob/main/docs/API_RESPONSE.md`, label: 'Bentuk jawaban' },
      { href: `${REPO_URL}/blob/main/docs/SELF_HOSTING.md`, label: 'Self-hosting' },
      { href: `${REPO_URL}/blob/main/README.md`, label: 'Mulai dari nol' },
    ],
  },
  {
    title: 'Proyek',
    links: [
      { href: REPO_URL, label: 'Repositori' },
      { href: `${REPO_URL}/issues`, label: 'Laporkan masalah' },
      { href: `${REPO_URL}/blob/main/PRD.md`, label: 'Rencana produk' },
      { href: `${REPO_URL}/blob/main/LICENSE`, label: 'Lisensi MIT' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { href: '/console', label: 'Console' },
      { href: '/api/health', label: 'Status layanan' },
    ],
  },
]

export const LANDING_MARQUEE = [
  'AGENT BUILDER',
  'VERSIONING',
  'PLAYGROUND',
  'OBSERVABILITY',
  'SELF-HOSTED',
]
