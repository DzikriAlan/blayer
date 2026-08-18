import type { NextPage } from 'next'
import Head from 'next/head'

import PageShell from '@/components/page-shell'
import { Button } from '@/components/ui/button'
import FormsCreate, {
  FORMS_CREATE_FORM_ID,
} from '@/features/forms/components/formsCreate'

const FormsCreatePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Buat Form Baru — BLAYER</title>
        <meta
          name="description"
          content="Susun pertanyaan form, lalu bagikan untuk mulai mengumpulkan jawaban."
        />
      </Head>
      <PageShell
        barTitle="UNTITLED FORM"
        railWord="BLAYER"
        railEyebrow={'FORM\nBUILDER.'}
        railIndex="02"
        railNote="DRAFTING"
        action={
          <Button
            type="submit"
            form={FORMS_CREATE_FORM_ID}
            variant="primary"
            size="sm"
          >
            Save
          </Button>
        }
      >
        <FormsCreate />
      </PageShell>
    </>
  )
}

export default FormsCreatePage
