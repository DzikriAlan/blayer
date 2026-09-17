interface Props {
  active?: boolean
  size?: 'sm' | 'md' | 'lg'
  inline?: boolean
}

export default function Loader({ active = true, size = 'md', inline = false }: Readonly<Props>) {
  if (!active) return null

  const sizeMap = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }
  const spinner = (
    <span
      className={`${sizeMap[size]} animate-spin rounded-full border-4 border-muted border-t-primary`}
    />
  )

  if (inline) return spinner

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  )
}
