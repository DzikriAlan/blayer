import type { NextPage } from 'next'
import Head from 'next/head'

import LandingShell from '@/components/landing-shell'
import LandingContent from '@/features/landing/components/landingContent'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>BLAYER — Satu tempat atur semua agent</title>
        <meta
          name="description"
          content="Blayer adalah AI Agent Platform yang bisa kamu jalankan sendiri: rancang agent, uji di Playground, publikasikan versinya, lalu panggil lewat satu API."
        />
      </Head>
      <LandingShell>
        <LandingContent />
      </LandingShell>
    </>
  )
}

export default Home
