import {
  Boxes,
  GitBranch,
  KeyRound,
  LineChart,
  PlayCircle,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react'

export interface LandingStep {
  id: string
  title: string
  description: string
  icon: LucideIcon
}

export interface LandingFeature {
  id: string
  title: string
  description: string
  icon: LucideIcon
  isReady: boolean
  // Lebar kartu di kisi bento: 1, 2, atau 3 kolom.
  span: 1 | 2 | 3
}

export interface LandingStat {
  key: string
  label: string
  value: string
  icon: LucideIcon
}

// Empat langkah dari agent kosong sampai dipanggil aplikasi lain. Urutannya
// sama dengan alur di Console, jadi yang dibaca di halaman depan persis yang
// ditemui setelah masuk.
export const LANDING_STEPS: LandingStep[] = [
  {
    id: 'build',
    title: 'Rancang agentnya',
    description: 'Instruksi, model, dan batas tokennya di satu tempat.',
    icon: SlidersHorizontal,
  },
  {
    id: 'test',
    title: 'Uji di Playground',
    description: 'Jawaban, token, biaya, dan lamanya langsung terlihat.',
    icon: PlayCircle,
  },
  {
    id: 'publish',
    title: 'Publikasikan versinya',
    description: 'Versi lama diarsipkan, bukan ditimpa — rollback sekali klik.',
    icon: GitBranch,
  },
  {
    id: 'call',
    title: 'Panggil lewat API',
    description: 'Satu endpoint, satu API key, per project dan environment.',
    icon: KeyRound,
  },
]

export const LANDING_STATS: LandingStat[] = [
  { key: 'provider', label: 'PROVIDER', value: '02', icon: Boxes },
  { key: 'environment', label: 'ENVIRONMENT', value: '03', icon: Server },
  { key: 'license', label: 'LISENSI', value: 'MIT', icon: ShieldCheck },
]

// Yang sudah jalan dan yang belum dibedakan terang-terangan. Halaman depan
// tidak menjanjikan apa yang belum ada di dalam.
export const LANDING_FEATURES: LandingFeature[] = [
  {
    id: 'builder',
    title: 'Agent Builder',
    description:
      'Instruksi, pilihan model, effort, dan batas token tersimpan sebagai konfigurasi — bukan prompt mentah yang tercecer di kode tiap project.',
    icon: SlidersHorizontal,
    isReady: true,
    span: 2,
  },
  {
    id: 'versioning',
    title: 'Versioning',
    description:
      'Tiap perubahan lahir sebagai draf. Versi yang melayani production tidak pernah berubah diam-diam, dan kembali ke versi sebelumnya cukup satu langkah.',
    icon: GitBranch,
    isReady: true,
    span: 1,
  },
  {
    id: 'playground',
    title: 'Playground',
    description:
      'Coba agent sebelum dipakai orang lain. Jawaban, pemakaian token, biaya, dan lamanya tercatat di eksekusi yang sama.',
    icon: PlayCircle,
    isReady: true,
    span: 1,
  },
  {
    id: 'observability',
    title: 'Observability',
    description:
      'Tiap eksekusi tercatat — termasuk yang gagal. Success rate, rata-rata latency, token, dan biaya terbaca per agent.',
    icon: LineChart,
    isReady: true,
    span: 1,
  },
  {
    id: 'keys',
    title: 'Kunci terpisah',
    description:
      'Kredensial provider tersimpan terenkripsi di instance-mu sendiri, dipisah per project dan per environment. Tidak ada server pusat yang menerimanya.',
    icon: KeyRound,
    isReady: true,
    span: 1,
  },
  {
    id: 'tools',
    title: 'Tool & Knowledge',
    description:
      'Blayer menyimpan kontrak toolnya; yang menjalankan tetap endpoint milik projectmu. Bagian ini sedang dibangun.',
    icon: Boxes,
    isReady: false,
    span: 3,
  },
]

export const LANDING_MARQUEE = [
  'AGENT BUILDER',
  'VERSIONING',
  'PLAYGROUND',
  'OBSERVABILITY',
  'SELF-HOSTED',
]
