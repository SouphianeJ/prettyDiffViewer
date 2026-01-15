import { ChangeEvent, useState, useId } from 'react'
import mammoth from 'mammoth'

interface FileUploaderProps {
  onFileContent: (content: string) => void
  label: string
}

export default function FileUploader({ onFileContent, label }: FileUploaderProps) {
  const [convertToMarkdown, setConvertToMarkdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputId = useId()
  const toggleId = useId()

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError(null)

    try {
      const extension = file.name.split('.').pop()?.toLowerCase()

      if (extension === 'txt') {
        const text = await file.text()
        onFileContent(text)
      } else if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer()
        
        if (convertToMarkdown) {
          // Convert to simple markdown-like format
          const result = await mammoth.extractRawText({ arrayBuffer })
          onFileContent(result.value)
        } else {
          // Extract raw text directly
          const result = await mammoth.extractRawText({ arrayBuffer })
          onFileContent(result.value)
        }
      } else {
        setError('Format non supporté. Utilisez .txt ou .docx')
      }
    } catch (err) {
      setError(`Erreur lors de la lecture du fichier: ${err instanceof Error ? err.message : 'Erreur inconnue'}`)
    } finally {
      setLoading(false)
      // Reset input to allow re-uploading same file
      e.target.value = ''
    }
  }

  return (
    <div className="file-uploader">
      <div className="file-uploader-row">
        <label htmlFor={inputId} className="file-label">
          {label}
        </label>
        <input
          id={inputId}
          type="file"
          accept=".txt,.docx"
          onChange={handleFileChange}
          disabled={loading}
          className="file-input"
        />
      </div>
      <div className="file-uploader-row">
        <label htmlFor={toggleId} className="toggle-label">
          <input
            id={toggleId}
            type="checkbox"
            checked={convertToMarkdown}
            onChange={(e) => setConvertToMarkdown(e.target.checked)}
            disabled={loading}
          />
          Convertir en Markdown
        </label>
      </div>
      {loading && <span className="file-loading">Chargement...</span>}
      {error && <span className="file-error">{error}</span>}
    </div>
  )
}
