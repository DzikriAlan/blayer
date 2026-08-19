import { useCallback, useState } from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import PageShell from '@/components/page-shell'
import { Button } from '@/components/ui/button'
import FormsCreate, {
  FORMS_CREATE_FORM_ID,
} from '@/features/forms/components/formsCreate'

/**
 * Menyunting form yang sudah dipublikasikan.
 *
 * Builder-nya sama persis dengan halaman buat; yang membedakan hanya `formId`
 * yang membuatnya menarik isian dari form tersimpan lalu mengirim PUT. Halaman
 * ini tidak ada di daftar rute publik, jadi penjaga sesi menutupnya sendiri —
 * dan servernya tetap memeriksa kepemilikan, bukan hanya penjaga di browser.
 */
const FormsEditPage: NextPage = () => {
  const router = useRouter()
  const [filters, setFilters] = useState({ title: '' })

  const formId = typeof router.query.id === 'string' ? router.query.id : ''

  const editFormsTitle = useCallback((title: string) => {
    setFilters((prev) => ({ ...prev, title }))
  }, [])

  const barTitle = filters.title.trim() || 'UNTITLED FORM'

  return (
    <>
      <Head>
        <title>Sunting Form — BLAYER</title>
        <meta
          name="description"
          content="Perbarui pertanyaan dan pengaturan form yang sudah dibuat."
        />
      </Head>
      <PageShell
        barTitle={barTitle}
        railWord="BLAYER"
        railEyebrow={'FORM\nEDITOR.'}
        railIndex="02"
        railNote="EDITING"
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
        {/* Router baru siap setelah hidrasi; sebelum itu id masih kosong dan
            builder tidak boleh dirender sebagai mode buat baru. */}
        {formId ? (
          <FormsCreate formId={formId} onEditFormsTitle={editFormsTitle} />
        ) : null}
      </PageShell>
    </>
  )
}

export default FormsEditPage
