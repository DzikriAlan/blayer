import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

const config = [
  {
    ignores: [
      '.next/**',
      '.next-verify/**',
      'node_modules/**',
      'next-env.d.ts',
      // Dibangkitkan fumadocs-mdx dari content/docs; bukan kode yang ditulis
      // tangan, dan isinya memang memakai @ts-nocheck.
      '.source/**',
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    // next.config.js memang berkas CommonJS; Next membacanya sebelum ada
    // transpilasi, jadi require() di sana bukan pilihan gaya.
    files: ['next.config.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    // Stylesheet Fumadocs adalah keluaran Tailwind v4 yang sudah jadi, dan
    // mengimpornya lewat JavaScript membuat PostCSS Tailwind v3 di sini gagal.
    // Karena itu dipasang sebagai <link> ke berkas di public/vendor.
    files: ['src/app/layout.tsx'],
    rules: { '@next/next/no-css-tags': 'off' },
  },
]

export default config
