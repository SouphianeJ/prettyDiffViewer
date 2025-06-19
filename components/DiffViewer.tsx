import { diffWordsWithSpace } from 'diff'

interface DiffViewerProps {
  oldText: string
  newText: string
}

export default function DiffViewer({ oldText, newText }: DiffViewerProps) {
  const parts = diffWordsWithSpace(oldText, newText)

  return (
    <pre className="diff" style={{ whiteSpace: 'pre-wrap' }}>
      {parts.map((part, idx) => {
        const isWhitespace = part.value.trim() === ''
        const className = part.added
          ? isWhitespace
            ? 'whitespace'
            : 'added'
          : part.removed
          ? isWhitespace
            ? 'whitespace'
            : 'removed'
          : ''
        return (
          <span key={idx} className={className}>
            {part.value}
          </span>
        )
      })}
    </pre>
  )
}
