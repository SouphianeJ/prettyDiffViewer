import { useState } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface AIPrompterProps {
  inputText: string
  onResponse: (response: string) => void
  apiKey: string
}

export default function AIPrompter({ inputText, onResponse, apiKey }: AIPrompterProps) {
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

    if (!apiKey.trim()) {
      setError('Veuillez configurer votre clé API Gemini')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

      const systemPrompt = `Voici des instructions, tu es un agent qui relit et améliore des textes en suivant les instructions sans prendre de liberté.

INSTRUCTIONS À SUIVRE EXACTEMENT:
${prompt}

TEXTE À MODIFIER:
${inputText}

RÈGLES STRICTES:
- INTERDIT: Pas de phrases d'introduction ou de conclusion
- Renvoie UNIQUEMENT le texte modifié
- Suis les instructions exactement sans prendre de liberté`

      const result = await model.generateContent(systemPrompt)
      const response = await result.response
      const text = response.text()

      onResponse(text)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(`Erreur API: ${errorMessage}`)
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
