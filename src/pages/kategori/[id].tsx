import type { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Head from 'next/head'

import LandingShell from '@/components/landing-shell'
import FormsExplore from '@/features/forms/components/formsExplore'
import {
  FORMS_TEMPLATES,
  FORMS_VIEW_COPY,
} from '@/features/forms/components/formsTemplate'

interface Props {
  templateId: string
  heading: string
  lead: string
}

const Kategori: NextPage<Props> = ({ templateId, heading, lead }) => {
  return (
    <>
      <Head>
        <title>{`${heading} — BLAYER`}</title>
        <meta name="description" content={lead} />
      </Head>
      <LandingShell>
        <FormsExplore templateId={templateId} />
      </LandingShell>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: FORMS_TEMPLATES.map((template) => ({ params: { id: template.id } })),
  fallback: false,
})

export const getStaticProps: GetStaticProps<Props> = ({ params }) => {
  const templateId = String(params?.id ?? '')
  const template = FORMS_TEMPLATES.find((item) => item.id === templateId)

  if (!template) return { notFound: true }

  const copy = FORMS_VIEW_COPY[template.view]

  return {
    props: {
      templateId,
      heading: copy.heading,
      lead: copy.lead,
    },
  }
}

export default Kategori
