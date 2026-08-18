import { useCallback, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'

import PageShell from '@/components/page-shell'
import { Button } from '@/components/ui/button'
import FormsCreate, {
  FORMS_CREATE_FORM_ID,
} from '@/features/forms/components/formsCreate'

const FormsCreatePage: NextPage = () => {
  const [filters, setFilters] = useState({ title: '' })

  // Bilah atas mengikuti judul yang sedang diketik; kosong kembali ke label
  // bawaan supaya bilahnya tidak pernah tampil melompong.
  const editFormsTitle = useCallback((title: string) => {
    setFilters((prev) => ({ ...prev, title }))
  }, [])

  const barTitle = filters.title.trim() || 'UNTITLED FORM'

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
        barTitle={barTitle}
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
        <FormsCreate onEditFormsTitle={editFormsTitle} />
      </PageShell>
    </>
  )
}

export default FormsCreatePage
