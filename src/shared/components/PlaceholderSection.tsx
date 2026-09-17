import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface Props {
  title: string
  subtitle?: string
  image?: ReactNode
  colorTitle?: string
  className?: string
}

export default function PlaceholderSection({
  title,
  subtitle,
  image,
  colorTitle,
  className,
}: Readonly<Props>) {
  const titleStyle: CSSProperties = colorTitle ? { color: colorTitle } : {}

  return (
    <div className={cn('section-placeholder', className)}>
      <div className="placeholder-content">
        {image && <div className="mb-4 flex justify-center">{image}</div>}
        <h3 style={titleStyle}>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  )
}
