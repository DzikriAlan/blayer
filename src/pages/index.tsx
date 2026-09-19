import type { NextPage } from 'next'
import Head from 'next/head'

import LandingShell from '@/components/landing-shell'
import LandingContent from '@/features/landing/components/landingContent'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>BLAYER — Take exactly what you need</title>
        <meta
          name="description"
          content="Blayer adalah platform berbasis form untuk membangun berbagai pengalaman interaktif sesuai kebutuhan dan hasil yang ingin dicapai."
        />
      </Head>
      <LandingShell>
        <LandingContent />
      </LandingShell>
    </>
  )
}

export default Home
