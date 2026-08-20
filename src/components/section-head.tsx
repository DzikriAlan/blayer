import { cn } from '@/shared/lib/utils'

interface Props {
  tag: string
  title: string
  description?: string
  /**
   * `display` untuk kalimat tetap yang memang ditulis besar dan sudah
   * dipatahkan sendiri per baris, mis. "Build it.\nRank it".
   *
   * `content` untuk judul yang datang dari pengguna. Panjangnya tidak bisa
   * ditebak, dan pada ukuran display satu judul form bisa memakan seluruh
   * layar sebelum isinya sempat terlihat.
   */
  size?: 'display' | 'content'
  className?: string
}

export default function SectionHead({
  tag,
  title,
  description,
  size = 'display',
  className,
}: Props) {
  return (
    <div className={cn('border-b-2 border-foreground pb-7', className)}>
      <div className="flex items-stretch gap-0">
        <span className="brutal-eyebrow bg-primary px-3 py-2 text-primary-foreground">
          {tag}
        </span>
        <span aria-hidden className="brutal-hatch mx-3 flex-1" />
        <span aria-hidden className="w-16 self-center border-t-[5px] border-foreground" />
      </div>

      <h1
        className={cn(
          'mt-6 hyphens-auto whitespace-pre-line break-words font-display font-black uppercase tracking-[-0.03em]',
          size === 'display'
            ? 'text-[clamp(1.9rem,8vw,4.75rem)] leading-[0.86]'
            : 'text-[clamp(1.6rem,4vw,2.75rem)] leading-[0.95]'
        )}
      >
        {title}
        <span className="text-primary">.</span>
      </h1>

      {description ? (
        <p className="mt-5 max-w-xl whitespace-pre-line font-mono text-sm leading-relaxed text-foreground/80">
          {description}
        </p>
      ) : null}
    </div>
  )
}
