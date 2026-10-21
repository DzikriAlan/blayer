import type { NextPage } from 'next'
import Head from 'next/head'

import AppShell from '@/components/app-shell'
import HomeFooter from '@/features/home/components/homeFooter'
import HomeList from '@/features/home/components/homeList'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Blayer — Indonesia Hari Ini</title>
        <meta
          name="description"
          content="Video politik, ekonomi, dan kriminal untuk memahami Indonesia lebih dalam."
        />
      </Head>
      <AppShell hideHeader footer={<HomeFooter />}>
        <HomeList />
      </AppShell>
    </>
  )
}

export default Home
