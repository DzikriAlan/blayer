interface Props {
  total: number
  seed: string
  label: string
}

const FACE_COLORS = [
  '#FF3B1F',
  '#FFC300',
  '#3D8BFF',
  '#22C55E',
  '#A855F7',
  '#FF7AC8',
]

const MAX_FACE = 4

export default function LandingFacepile({ total, seed, label }: Props) {
  const getSeedNumber = (index: number) => {
    const text = `${seed}-${index}`
    let sum = 0

    for (let position = 0; position < text.length; position += 1) {
      sum = (sum + text.charCodeAt(position) * (position + 1)) % 997
    }

    return sum
  }

  const faces = Array.from(
    { length: Math.min(total, MAX_FACE) },
    (_, index) => {
      const seedNumber = getSeedNumber(index)

      return {
        key: `${seed}-${index}`,
        color:
          FACE_COLORS[(getSeedNumber(0) + index) % FACE_COLORS.length],
        isWinking: seedNumber % 3 === 0,
        mouthWidth: 3 + (seedNumber % 3),
      }
    }
  )

  const restTotal = total - faces.length

  return (
    <div className="flex items-center gap-2.5">
      {faces.length ? (
        <div className="flex items-center">
          {faces.map((face) => (
            <svg
              key={face.key}
              viewBox="0 0 32 32"
              aria-hidden
              data-facepile-face
              className="-ml-4 h-7 w-7 shrink-0 rounded-full border-2 border-foreground bg-paper first:ml-0"
            >
              <circle cx="16" cy="16" r="16" fill={face.color} />
              <circle cx="11" cy="14" r="1.8" fill="hsl(var(--foreground))" />
              {face.isWinking ? (
                <rect
                  x="19"
                  y="13.4"
                  width="3.6"
                  height="1.4"
                  rx="0.7"
                  fill="hsl(var(--foreground))"
                />
              ) : (
                <circle cx="21" cy="14" r="1.8" fill="hsl(var(--foreground))" />
              )}
              <rect
                x={16 - face.mouthWidth}
                y="20"
                width={face.mouthWidth * 2}
                height="2.4"
                rx="1.2"
                fill="hsl(var(--foreground))"
              />
            </svg>
          ))}

          {restTotal > 0 ? (
            <span className="brutal-eyebrow -ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-foreground text-[9px] tracking-normal text-background">
              +{restTotal > 99 ? '99' : restTotal}
            </span>
          ) : null}
        </div>
      ) : null}

      <span className="brutal-eyebrow text-muted-foreground">
        {String(total).padStart(2, '0')} {label}
      </span>
    </div>
  )
}
