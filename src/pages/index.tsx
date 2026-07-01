import fs from 'node:fs'
import path from 'node:path'
import type { GetStaticProps } from 'next'
import LandingHero from '@/features/landing/components/LandingHero'

interface HomeProps {
  readonly codeSnippets: Record<string, string>
}

export default function Home({ codeSnippets }: HomeProps) {
  return (
    <div className="min-h-screen bg-background">
      <LandingHero codeSnippets={codeSnippets} />
    </div>
  )
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const codesDir = path.join(process.cwd(), 'src/shared/codes')
  const files = fs.readdirSync(codesDir)

  const codeSnippets: Record<string, string> = {}
  for (const file of files) {
    const key = path.basename(file, '.md')
    codeSnippets[key] = fs.readFileSync(path.join(codesDir, file), 'utf-8')
  }

  return { props: { codeSnippets } }
}
