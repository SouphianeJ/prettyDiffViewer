import { useState } from 'react'

interface AIPrompterProps {
  inputText: string
  onResponse: (response: string) => void
}

export default function AIPrompter({ inputText, onResponse }: AIPrompterProps) {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Veuillez entrer des instructions')
      return
    }

    if (!inputText.trim()) {
      setError('Veuillez d\'abord entrer du texte dans l\'Input 1')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, inputText }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la requête')
      }

      onResponse(data.result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-prompter">
      <div className="ai-prompter-header">
        <label htmlFor="ai-prompt">Instructions pour l&apos;IA</label>
      </div>
      <textarea
        id="ai-prompt"
        className="ai-prompt-input"
        placeholder="Entrez vos instructions pour l'IA (ex: Corrige les fautes d'orthographe, Améliore le style, Résume le texte...)"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={loading}
        rows={3}
      />
      <button
        className="ai-submit-btn"
        onClick={handleSubmit}
        disabled={loading || !prompt.trim()}
      >
        {loading ? 'Traitement en cours...' : 'Envoyer à l\'IA'}
      </button>
      {error && <div className="ai-error">{error}</div>}
    </div>
  )
}
