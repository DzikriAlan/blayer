import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import PageShell from '@/components/page-shell'
import LoadingView from '@/components/loading-view'
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
          <LoadingView title="Memuat Hasil" subtitle="Membuka dashboard hasil dari tautan yang kamu pakai. Sebentar lagi selesai." />
        )}
      </PageShell>
    </>
  )
}

export default FormsResultPage
