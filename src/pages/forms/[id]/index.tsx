import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import PageShell from '@/components/page-shell'
import { LoadData } from '@/shared/components/load-data'
import ResponsesSubmit from '@/features/responses/components/responsesSubmit'

const FormsFillPage: NextPage = () => {
  const router = useRouter()
  const formId = typeof router.query.id === 'string' ? router.query.id : ''

  return (
    <>
      <Head>
        <title>Isi Form — BLAYER</title>
        <meta name="description" content="Isi form dan kirim jawabanmu." />
      </Head>
      <PageShell
        barTitle="RESPONDING"
        railWord="FORM"
        railEyebrow={'BRUTAL\nFORM.'}
        railIndex="01"
        railNote="REQUIRED"
      >
        {formId ? (
          <ResponsesSubmit formId={formId} />
        ) : (
          <LoadData response={{ isLoading: true }} minHeight="60vh" />
        )}
      </PageShell>
    </>
  )
}

export default FormsFillPage
