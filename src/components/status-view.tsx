import Image from 'next/image'

import { cn } from '@/shared/lib/utils'

interface Props {
  title: string
  subtitle: string
  image?: string
  className?: string
  children?: React.ReactNode
}

export default function StatusView({
  title,
  subtitle,
  image,
  className,
  children,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 border-2 border-foreground bg-paper px-6 py-14 text-center',
        className
      )}
    >
      {image ? (
        <Image src={image} alt="" width={150} height={120} priority={false} />
      ) : null}
      <p className="font-display text-2xl font-black uppercase leading-none tracking-tight">
        {title}
      </p>
      <p className="max-w-md font-mono text-sm leading-relaxed text-muted-foreground">
        {subtitle}
      </p>
      {children}
    </div>
  )
}
