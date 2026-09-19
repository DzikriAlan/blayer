import Image from 'next/image'

/* Tech icons — devicons CDN for well-supported techs, inline SVG for newer ones */

const NextIcon = () => (
  <Image
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg"
    width={18} height={18} alt="Next.js"
    className="dark:invert"
  />
)

const TSIcon = () => (
  <Image
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg"
    width={18} height={18} alt="TypeScript"
  />
)

const TailwindIcon = () => (
  <Image
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg"
    width={18} height={18} alt="Tailwind CSS"
  />
)

const PrismaIcon = () => (
  <Image
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/prisma/prisma-original.svg"
    width={18} height={18} alt="Prisma"
    className="dark:invert"
  />
)

const ReactIcon = () => (
  <Image
    src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg"
    width={18} height={18} alt="React"
  />
)

/* Shadcn/UI — overlapping circles logo */
const ShadcnIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect width="18" height="18" rx="4" fill="#18181B" />
    <circle cx="6.5" cy="9" r="3" fill="none" stroke="white" strokeWidth="1.4" />
    <circle cx="11.5" cy="9" r="3" fill="none" stroke="white" strokeWidth="1.4" />
  </svg>
)

/* TanStack Query — circular refresh arrows */
const TanStackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="9" fill="#FF4154" />
    <path d="M5.5 9a3.5 3.5 0 0 1 3.5-3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 5.5l1.5 1.5-1.5 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12.5 9a3.5 3.5 0 0 1-3.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 12.5l-1.5-1.5 1.5-1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* Zustand — simplified bear face */
const ZustandIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="9" fill="#B45309" />
    <circle cx="5.5" cy="5.5" r="2" fill="#92400E" />
    <circle cx="12.5" cy="5.5" r="2" fill="#92400E" />
    <ellipse cx="9" cy="10.5" rx="4" ry="3.5" fill="#92400E" />
    <circle cx="7.5" cy="10" r="0.8" fill="#B45309" />
    <circle cx="10.5" cy="10" r="0.8" fill="#B45309" />
    <path d="M7.5 12 Q9 13 10.5 12" stroke="#B45309" strokeWidth="0.8" strokeLinecap="round" />
  </svg>
)

export const GoogleIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)

export interface TechEntry {
  label: string
  desc: string
  icon: React.ReactNode
}

export const techStack: TechEntry[] = [
  { label: 'Next.js 14',      desc: 'App framework',  icon: <NextIcon /> },
  { label: 'TypeScript',      desc: 'Type safety',    icon: <TSIcon /> },
  { label: 'Tailwind CSS',    desc: 'Styling',        icon: <TailwindIcon /> },
  { label: 'Shadcn/UI',       desc: 'Components',     icon: <ShadcnIcon /> },
  { label: 'TanStack Query',  desc: 'Server state',   icon: <TanStackIcon /> },
  { label: 'Zustand',         desc: 'Client state',   icon: <ZustandIcon /> },
  { label: 'Prisma',          desc: 'ORM',            icon: <PrismaIcon /> },
  { label: 'React Hook Form', desc: 'Forms',          icon: <ReactIcon /> },
]
