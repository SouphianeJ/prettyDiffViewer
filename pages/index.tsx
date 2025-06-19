import { useState } from 'react'
import DiffViewer from '../components/DiffViewer'

export default function Home() {
  const [oldText, setOldText] = useState('')
  const [newText, setNewText] = useState('')

  return (
    <div>
      <h1>Pretty Diff Viewer</h1>
      <div>
        <textarea
          placeholder="Code original"
          value={oldText}
          onChange={(e) => setOldText(e.target.value)}
        />
      </div>
      <div>
        <textarea
          placeholder="Code modifié"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
      </div>
      <DiffViewer oldText={oldText} newText={newText} />
    </div>
  )
}
