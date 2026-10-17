export type LandingLocale = 'id' | 'en'

export interface LandingOverviewColumn {
  id: string
  title: string
  items: string[]
}

export interface LandingCopy {
  eyebrow: string
  headlinePrefix: string
  headlineHighlight: string
  headlineSuffix: string
  overview: LandingOverviewColumn[]
}

// Teks hero + grid ringkasan, dalam dua bahasa. Strukturnya sama persis;
// hanya isinya yang diterjemahkan. Headline-nya menegaskan AI cuma bantu
// menerjemahkan brief — keputusan dan kontrol tetap di tangan engineer,
// bukan diserahkan penuh ke AI.
export const LANDING_COPY: Record<LandingLocale, LandingCopy> = {
  id: {
    eyebrow: 'Membantu Software Engineer',
    headlinePrefix: 'Miliki langkah kerja yang terstruktur, dengan',
    headlineHighlight: 'kendali dan keputusan tetap di tanganmu',
    headlineSuffix: '.',
    overview: [
      {
        id: 'masalah',
        title: 'Masalah',
        items: [
          'Brief dari klien sering kurang lengkap dan berubah di tengah jalan.',
          'Data tercecer di banyak spreadsheet yang tidak saling terhubung.',
          'Laporan hasil kerja masih dibuat manual dan telat dikirim.',
        ],
      },
      {
        id: 'keuntungan',
        title: 'Keuntungan',
        items: [
          'Langkah lebih konsisten, lebih sedikit kerja berulang.',
          'Instruksi kerja lebih terstruktur dan mudah diikuti.',
          'Konteks brief tersimpan lewat tautan Google Sheets di .blayer/brief.md.',
        ],
      },
      {
        id: 'target-pengguna',
        title: 'Target pengguna',
        items: [
          'Developer yang memakai Claude Code dan coding agent lain.',
          'Tech lead yang ingin menjaga kualitas dan konsistensi.',
          'Tim produk dan tim engineering yang bekerja dari brief klien.',
        ],
      },
    ],
  },
  en: {
    eyebrow: 'Helping Software Engineer',
    headlinePrefix: 'Have a structured workflow, with',
    headlineHighlight: 'control and decisions staying in your hands',
    headlineSuffix: '.',
    overview: [
      {
        id: 'masalah',
        title: 'Problem',
        items: [
          'Client briefs are often incomplete and keep changing midway.',
          'Data is scattered across spreadsheets that don’t connect to each other.',
          'Work reports are still put together manually and sent late.',
        ],
      },
      {
        id: 'keuntungan',
        title: 'Benefits',
        items: [
          'More consistent steps, less repeated work.',
          'Work instructions are more structured and easier to follow.',
          'Brief context is kept via the Google Sheets link in .blayer/brief.md.',
        ],
      },
      {
        id: 'target-pengguna',
        title: 'Who it is for',
        items: [
          'Developers who use Claude Code and other coding agents.',
          'Tech leads who want to maintain quality and consistency.',
          'Product and engineering teams working from client briefs.',
        ],
      },
    ],
  },
}
