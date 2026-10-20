import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import AppShell from '@/components/app-shell'
import HomeWatch from '@/features/home/components/homeWatch'

const WatchPage: NextPage = () => {
  const router = useRouter()
  const videoId = typeof router.query.videoId === 'string' ? router.query.videoId : ''

  return (
    <>
      <Head>
        <title>Menonton — Blayer</title>
      </Head>
      <AppShell>
        <HomeWatch videoId={videoId} />
      </AppShell>
    </>
  )
}

export default WatchPage
