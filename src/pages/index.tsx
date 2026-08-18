import type { NextPage } from 'next'
import Head from 'next/head'

import LandingShell from '@/components/landing-shell'
import FormsLanding from '@/features/forms/components/formsLanding'

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
        <FormsLanding />
      </LandingShell>
    </>
  )
}

export default Home
