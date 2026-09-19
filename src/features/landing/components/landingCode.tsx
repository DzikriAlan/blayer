export type CodeToken = ['key' | 'str' | 'com' | 'fn' | 'num' | 'txt', string]

interface Props {
  title?: string
  lines: CodeToken[][]
  className?: string
}

const CLASS_BY_TOKEN: Record<CodeToken[0], string> = {
  key: 'tok-key',
  str: 'tok-str',
  com: 'tok-com',
  fn: 'tok-fn',
  num: 'tok-num',
  txt: '',
}

export default function LandingCode({ title, lines, className }: Props) {
  return (
    <div className={className}>
      {title ? (
        <div className="mb-3 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary/60" />
          <span className="font-mono text-xs text-muted-foreground">{title}</span>
        </div>
      ) : null}

      <pre className="code">
        <code>
          {lines.map((line, index) => (
            <span key={index} className="block whitespace-pre">
              {line.length
                ? line.map((token, tokenIndex) => (
                    <span key={tokenIndex} className={CLASS_BY_TOKEN[token[0]]}>
                      {token[1]}
                    </span>
                  ))
                : ' '}
            </span>
          ))}
        </code>
      </pre>
    </div>
  )
}
