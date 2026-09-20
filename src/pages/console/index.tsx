import type { NextPage } from 'next'
import Head from 'next/head'

import ConsoleShell from '@/components/console-shell'
import ConsoleGate from '@/features/console/components/consoleGate'
import ProjectsList from '@/features/projects/components/projectsList'

const ConsolePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Console — BLAYER</title>
        <meta name="robots" content="noindex" />
      </Head>
      <ConsoleShell breadcrumb={[{ label: 'Semua project' }]}>
        <ConsoleGate>
          <ProjectsList />
        </ConsoleGate>
      </ConsoleShell>
    </>
  )
}

export default ConsolePage
