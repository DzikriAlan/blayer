import type { NextPage } from 'next'
import Head from 'next/head'
import Layout from '@/shared/components/Layout'
import AgentList from '@/features/agent/components/AgentList'

const AgentsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Agents — Chaplin</title>
      </Head>
      <Layout noPadding>
        <div className="h-full overflow-auto px-4 py-6 flex flex-col">
          <AgentList />
        </div>
      </Layout>
    </>
  )
}

export default AgentsPage
