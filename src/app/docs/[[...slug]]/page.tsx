import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/page'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import { Card, Cards } from 'fumadocs-ui/components/card'
import { Callout } from 'fumadocs-ui/components/callout'

import { docsSource } from '@/shared/lib/docsSource'

interface Props {
  params: Promise<{ slug?: string[] }>
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const page = docsSource.getPage(slug)

  if (!page) notFound()

  const MDX = page.data.body

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents, Callout, Card, Cards }} />
      </DocsBody>
    </DocsPage>
  )
}

export function generateStaticParams() {
  return docsSource.generateParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = docsSource.getPage(slug)

  if (!page) return {}

  return {
    title: `${page.data.title} — Dokumentasi Blayer`,
    description: page.data.description,
  }
}
