import { useEffect } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import ConsoleShell from '@/components/console-shell'
import ConsoleGate from '@/features/console/components/consoleGate'
import IntegrationsDetail from '@/features/integrations/components/integrationsDetail'
import { useIntegrationsStates } from '@/features/integrations/states/integrationsStates'
import { useIntegrationsControllers } from '@/features/integrations/controllers/integrationsControllers'

const IntegrationDetailPage: NextPage = () => {
  const router = useRouter()
  const integrationId =
    typeof router.query.integrationId === 'string' ? router.query.integrationId : ''

  const { integrationsDetail, setGetIntegrationsDetail } = useIntegrationsStates()

  useIntegrationsControllers()

  useEffect(() => {
    if (integrationId) setGetIntegrationsDetail({ id: integrationId })
  }, [integrationId, setGetIntegrationsDetail])

  const projectId = integrationsDetail.data?.projectId

  return (
    <>
      <Head>
        <title>Integration — BLAYER Console</title>
        <meta name="robots" content="noindex" />
      </Head>
      <ConsoleShell
        backHref={projectId ? `/console/projects/${projectId}` : '/console'}
        backLabel="Project"
      >
        <ConsoleGate>
          <IntegrationsDetail />
        </ConsoleGate>
      </ConsoleShell>
    </>
  )
}

export default IntegrationDetailPage
