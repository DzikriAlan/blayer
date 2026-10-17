'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star } from 'lucide-react'

const REPO = 'DzikriAlan/blayer-skills'
const REPO_URL = `https://github.com/${REPO}`

function formatStars(count: number) {
  if (count < 1000) return `${count}`
  return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k+`
}

export default function LandingGithubButton() {
  const [stars, setStars] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(`https://api.github.com/repos/${REPO}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && typeof data?.stargazers_count === 'number') {
          setStars(data.stargazers_count)
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Link
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-neutral-700"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5 shrink-0 fill-white"
      >
        <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 5.02 3.26 9.27 7.77 10.77.57.1.78-.25.78-.55 0-.27-.01-1.17-.02-2.12-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.73 2.65 1.23 3.3.94.1-.73.4-1.23.72-1.51-2.52-.29-5.17-1.26-5.17-5.62 0-1.24.44-2.26 1.17-3.05-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.14 1.16.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.18-1.47 3.14-1.16 3.14-1.16.62 1.57.23 2.73.11 3.02.73.79 1.17 1.81 1.17 3.05 0 4.37-2.65 5.33-5.18 5.61.41.35.77 1.04.77 2.1 0 1.52-.01 2.74-.01 3.11 0 .3.2.66.79.55 4.5-1.5 7.76-5.75 7.76-10.77C23.25 5.48 18.27.5 12 .5Z" />
      </svg>
      {stars !== null ? formatStars(stars) : 'Star'}
      <Star className="h-3 w-3 shrink-0 fill-white text-white" />
    </Link>
  )
}
