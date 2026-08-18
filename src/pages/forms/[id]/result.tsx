import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import PageShell from '@/components/page-shell'
import { LoadData } from '@/shared/components/load-data'
import AnalysisResult from '@/features/analysis/components/analysisResult'

const FormsResultPage: NextPage = () => {
  const router = useRouter()
  const formId = typeof router.query.id === 'string' ? router.query.id : ''

  return (
    <>
      <Head>
        <title>Dashboard Hasil — BLAYER</title>
        <meta
          name="description"
          content="Lihat peringkat peserta dan detail jawaban yang masuk."
        />
      </Head>
      <PageShell
        barTitle="DASHBOARD HASIL"
        railWord="SCORE"
        railEyebrow={'HASIL\nFORM.'}
        railIndex="03"
        railNote="RANKED"
      >
        {formId ? (
          <AnalysisResult formId={formId} />
        ) : (
          <LoadData response={{ isLoading: true }} minHeight="60vh" />
        )}
      </PageShell>
    </>
  )
}

export default FormsResultPage
