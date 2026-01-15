import type { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from '@google/generative-ai'

interface GenerateRequest {
  prompt: string
  inputText: string
}

interface GenerateResponse {
  result?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' })
  }

  const { prompt, inputText } = req.body as GenerateRequest

  if (!prompt?.trim()) {
    return res.status(400).json({ error: 'Veuillez entrer des instructions' })
  }

  if (!inputText?.trim()) {
    return res.status(400).json({ error: 'Veuillez d\'abord entrer du texte dans l\'Input 1' })
  }

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

    return res.status(200).json({ result: text })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
    return res.status(500).json({ error: `Erreur API: ${errorMessage}` })
  }
}
