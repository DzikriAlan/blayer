import type { NextPage } from 'next'
import Head from 'next/head'

import PageShell from '@/components/page-shell'
import FormsList from '@/features/forms/components/formsList'

const Forms: NextPage = () => {
  return (
    <>
      <Head>
        <title>BLAYER — Form Builder dengan Dashboard Hasil</title>
        <meta
          name="description"
          content="Buat form seperti Google Form, lalu lihat peringkat dan detail jawaban peserta di dashboard hasil."
        />
      </Head>
      <PageShell
        backHref="/"
        barTitle="ALL FORMS"
        railWord="FORMS"
        railEyebrow={'BRUTAL\nFORM.'}
        railIndex="00"
        railNote="SCORING"
      >
        <FormsList />
      </PageShell>
    </>
  )
}

export default Forms
