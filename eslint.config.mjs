import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

/**
 * Konfigurasi ESLint bentuk flat.
 *
 * Next 16 menghapus perintah `next lint`, dan eslint-config-next 16 sudah
 * berbentuk flat sehingga diimpor langsung — FlatCompat justru gagal di sini
 * karena mencoba menormalkan konfigurasi yang memang bukan bentuk lama.
 */
const config = [
  {
    ignores: [
      '.next/**',
      '.next-verify/**',
      'node_modules/**',
      'next-env.d.ts',
    ],
  },
  ...coreWebVitals,
  ...typescript,
]

export default config
