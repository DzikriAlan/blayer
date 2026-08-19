import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Head from 'next/head'

import LandingShell from '@/components/landing-shell'
import FormsExplore from '@/features/forms/components/formsExplore'
import { FORMS_TEMPLATES } from '@/features/forms/components/formsTemplate'

interface Props {
  templateId: string
  name: string
  tagline: string
}

const Kategori: NextPage<Props> = ({ templateId, name, tagline }) => {
  return (
    <>
      <Head>
        <title>{`${name} — BLAYER`}</title>
        <meta name="description" content={tagline} />
      </Head>
      <LandingShell>
        <FormsExplore templateId={templateId} />
      </LandingShell>
    </>
  )
}

/**
 * Daftar template adalah konstanta di kode, bukan data dari basis data, jadi
 * seluruh alamat kategori sudah bisa dipastikan saat build. Halaman ini dibuat
 * untuk dibagikan, jadi judul dan deskripsinya harus benar sejak balasan
 * pertama — bukan baru terisi setelah JavaScript jalan.
 *
 * `fallback: false` membuat kategori yang tidak ada dibalas 404 sungguhan,
 * bukan halaman kosong berstatus 200.
 */
export const getStaticPaths: GetStaticPaths = () => ({
  paths: FORMS_TEMPLATES.map((template) => ({ params: { id: template.id } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<Props> = ({ params }) => {
  const templateId = String(params?.id ?? '')
  const template = FORMS_TEMPLATES.find((item) => item.id === templateId)

  if (!template) return { notFound: true }

  return {
    props: {
      templateId,
      name: template.name,
      tagline: template.tagline,
    },
  }
}

export default Kategori
