import type { NextPage } from 'next'
import Head from 'next/head'
import Layout from '@/shared/components/Layout'
import AgentList from '@/features/agent/components/AgentList'

const AgentsPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Agents — Blayer</title>
      </Head>
      <Layout noPadding>
        <div className="flex h-full flex-col overflow-auto px-3 py-5 sm:px-4 sm:py-6">
          <AgentList />
        </div>
      </Layout>
    </>
  )
}

export default AgentsPage
