import { ChangeEvent, useState, useId } from 'react'
import mammoth from 'mammoth'

interface FileUploaderProps {
  onFileContent: (content: string) => void
  label: string
}

// Simple HTML to Markdown converter
function htmlToMarkdown(html: string): string {
  let markdown = html
  
  // Handle headings
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
  
  // Handle bold and italic
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
  
  // Handle paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
  
  // Handle line breaks
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n')
  
  // Handle lists
  markdown = markdown.replace(/<ul[^>]*>/gi, '')
  markdown = markdown.replace(/<\/ul>/gi, '\n')
  markdown = markdown.replace(/<ol[^>]*>/gi, '')
  markdown = markdown.replace(/<\/ol>/gi, '\n')
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
  
  // Handle links
  markdown = markdown.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
  
  // Remove remaining HTML tags - use a loop to handle nested/malformed tags
  let previousMarkdown
  do {
    previousMarkdown = markdown
    markdown = markdown.replace(/<[^>]*>/g, '')
  } while (markdown !== previousMarkdown)
  
  // Decode HTML entities - decode &amp; first to prevent double-unescaping
  // Then decode other entities in proper order
  markdown = markdown.replace(/&amp;/g, '\u0000AMP\u0000')  // Temporary placeholder
  markdown = markdown.replace(/&nbsp;/g, ' ')
  markdown = markdown.replace(/&lt;/g, '<')
  markdown = markdown.replace(/&gt;/g, '>')
  markdown = markdown.replace(/&quot;/g, '"')
  markdown = markdown.replace(/\u0000AMP\u0000/g, '&')  // Restore ampersand last
  
  // Clean up extra whitespace
  markdown = markdown.replace(/\n{3,}/g, '\n\n')
  markdown = markdown.trim()
  
  return markdown
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
          // Convert to HTML first, then to simple markdown
          const result = await mammoth.convertToHtml({ arrayBuffer })
          const markdown = htmlToMarkdown(result.value)
          onFileContent(markdown)
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
