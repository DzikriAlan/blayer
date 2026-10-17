const { createMDX } = require('fumadocs-mdx/next')

const getContentSecurityPolicy = () => {
  const supabase = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ''
  ).trim()

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://images.unsplash.com ${supabase}`.trim(),
    "font-src 'self' data:",
    `connect-src 'self' https://api.github.com ${supabase}`.trim(),
    'upgrade-insecure-requests',
  ].join('; ')
}

const securityHeaders = [
  { key: 'Content-Security-Policy', value: getContentSecurityPolicy() },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

// Halaman dokumentasi dibangun App Router, yang menyisipkan data render sebagai
// script sebaris. CSP ketat aplikasi tidak mengizinkannya, jadi pelonggarannya
// dibatasi pada /docs saja — isinya MDX yang ditulis di repositori ini, tanpa
// masukan dari pengguna.
const docsHeaders = securityHeaders.map((header) =>
  header.key === 'Content-Security-Policy'
    ? {
        key: header.key,
        value: header.value.replace(
          "script-src 'self'",
          "script-src 'self' 'unsafe-inline'"
        ),
      }
    : header
)

const nextConfig = {
  // Image Docker memakai keluaran standalone supaya runtime-nya tidak perlu
  // seluruh node_modules. Platform lain tetap memakai keluaran biasa.
  ...(process.env.BLAYER_STANDALONE ? { output: 'standalone' } : {}),
  distDir: process.env.NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    // Urutannya penting: aturan yang belakangan menimpa yang sebelumnya untuk
    // kunci header yang sama, jadi pelonggaran /docs ditaruh paling akhir.
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/docs', headers: docsHeaders },
      { source: '/docs/:path*', headers: docsHeaders },
    ]
  },
}

const withMDX = createMDX()

module.exports = withMDX(nextConfig)
