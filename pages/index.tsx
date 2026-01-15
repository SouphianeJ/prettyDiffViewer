import { useState } from 'react'
import DiffViewer from '../components/DiffViewer'
import FileUploader from '../components/FileUploader'
import AIPrompter from '../components/AIPrompter'
import { downloadAsDocx } from '../utils/downloadDocx'

export default function Home() {
  const [oldText, setOldText] = useState('')
  const [newText, setNewText] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)

  const handleDownloadDocx = () => {
    if (newText.trim()) {
      downloadAsDocx(newText, 'texte-modifie.docx')
    }
  }

  const handleAIResponse = (response: string) => {
    setNewText(response)
  }

  return (
    <div className="container">
      <h1>Pretty Diff Viewer</h1>
      
      {/* API Key Configuration */}
      <div className="api-key-section">
        <button 
          className="toggle-api-key-btn"
          onClick={() => setShowApiKeyInput(!showApiKeyInput)}
        >
          {showApiKeyInput ? 'Masquer' : 'Configurer'} Clé API Gemini
        </button>
        {showApiKeyInput && (
          <input
            type="password"
            className="api-key-input"
            placeholder="Entrez votre clé API Gemini"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        )}
      </div>

      <div className="inputs-container">
        {/* Input 1 Section */}
        <div className="input-section">
          <h2>Texte Original (Input 1)</h2>
          <FileUploader 
            onFileContent={setOldText} 
            label="Importer un fichier" 
          />
          <textarea
            placeholder="Collez votre texte original ici ou importez un fichier ci-dessus"
            value={oldText}
            onChange={(e) => setOldText(e.target.value)}
          />
        </div>

        {/* Input 2 Section */}
        <div className="input-section">
          <h2>Texte Modifié (Input 2)</h2>
          <FileUploader 
            onFileContent={setNewText} 
            label="Importer un fichier" 
          />
          <textarea
            placeholder="Collez votre texte modifié ici, importez un fichier, ou utilisez l'IA"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
          />
          <button 
            className="download-btn"
            onClick={handleDownloadDocx}
            disabled={!newText.trim()}
          >
            Télécharger en .docx
          </button>
        </div>
      </div>

      {/* AI Prompter Section */}
      <div className="ai-section">
        <h2>Améliorer avec l&apos;IA</h2>
        <p className="ai-description">
          Utilisez l&apos;IA pour modifier le texte de l&apos;Input 1. Le résultat sera affiché dans l&apos;Input 2.
        </p>
        <AIPrompter 
          inputText={oldText}
          onResponse={handleAIResponse}
          apiKey={apiKey}
        />
      </div>

      {/* Diff Viewer */}
      <div className="diff-section">
        <h2>Comparaison des différences</h2>
        <DiffViewer oldText={oldText} newText={newText} />
      </div>
    </div>
  )
}
