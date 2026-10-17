import type { NextPage } from 'next'
import Head from 'next/head'

import LandingShell from '@/components/landing-shell'
import LandingContent from '@/features/landing/components/landingContent'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Blayer — Dari client brief sampai commit</title>
        <meta
          name="description"
          content="Blayer adalah kumpulan portable SKILL.md yang memandu alur kerja perangkat lunak dari permintaan klien sampai commit. Dipakai seperti slash command di Claude Code."
        />
      </Head>
      <LandingShell>
        <LandingContent />
      </LandingShell>
    </>
  )
}

export default Home
