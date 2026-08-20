// Sumber yang boleh dimuat halaman. Supabase masuk karena banner tersimpan di
// Storage dan sesi diverifikasi lewat REST-nya; 'unsafe-inline' pada skrip masih
// dibutuhkan Next untuk data hidrasi di Pages Router.
const getContentSecurityPolicy = () => {
  const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://images.unsplash.com ${supabase}`.trim(),
    "font-src 'self' data:",
    `connect-src 'self' ${supabase}`.trim(),
    'upgrade-insecure-requests',
  ].join('; ')
}

const securityHeaders = [
  { key: 'Content-Security-Policy', value: getContentSecurityPolicy() },
  // frame-ancestors sudah melarang pembingkaian, tapi header lama ini masih
  // dibaca peramban yang belum mendukungnya.
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

const nextConfig = {
  // Direktori build bisa dipisah lewat env supaya server verifikasi tidak
  // menimpa .next milik dev server yang sedang berjalan. Dua proses Next yang
  // berbagi direktori ini saling merusak manifest dan menghasilkan 404 palsu.
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
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

module.exports = nextConfig
