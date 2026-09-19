import type { NextPage } from 'next'
import Head from 'next/head'

import LandingShell from '@/components/landing-shell'
import ErrorView from '@/components/error-view'

const NOT_FOUND_LINKS = [
  {
    href: '/console',
    label: 'Console',
    description: 'Kelola project, agent, dan API key dari satu tempat.',
  },
  {
    href: '/#fitur',
    label: 'Fitur platform',
    description: 'Lihat apa saja yang sudah bisa dipakai hari ini.',
  },
]

const NotFoundPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Halaman Tidak Ditemukan — BLAYER</title>
        <meta name="robots" content="noindex" />
      </Head>
      <LandingShell>
        <ErrorView
          code="404"
          title={'Halaman ini\ntidak ada'}
          subtitle="Alamatnya mungkin salah ketik, atau halamannya memang belum ada. Halaman depan tetap bisa dibuka."
          links={NOT_FOUND_LINKS}
        />
      </LandingShell>
    </>
  )
}

export default NotFoundPage
