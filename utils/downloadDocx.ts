import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

// Parse inline markdown formatting and return TextRun array
function parseInlineMarkdown(text: string): TextRun[] {
  const runs: TextRun[] = []
  
  // Regex to match **bold**, *italic*, and ***bold italic***
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*)/g
  
  let lastIndex = 0
  let match
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the match as plain text
    if (match.index > lastIndex) {
      runs.push(new TextRun(text.substring(lastIndex, match.index)))
    }
    
    if (match[2]) {
      // Bold italic (***text***)
      runs.push(new TextRun({ text: match[2], bold: true, italics: true }))
    } else if (match[3]) {
      // Bold (**text**)
      runs.push(new TextRun({ text: match[3], bold: true }))
    } else if (match[4]) {
      // Italic (*text*)
      runs.push(new TextRun({ text: match[4], italics: true }))
    }
    
    lastIndex = regex.lastIndex
  }
  
  // Add remaining text after the last match
  if (lastIndex < text.length) {
    runs.push(new TextRun(text.substring(lastIndex)))
  }
  
  // If no formatting was found, return the plain text
  if (runs.length === 0) {
    runs.push(new TextRun(text))
  }
  
  return runs
}

export async function downloadAsDocx(content: string, filename: string = 'document.docx') {
  // Split content into paragraphs by line breaks
  const lines = content.split('\n')
  
  const paragraphs = lines.map(line => {
    // Handle markdown headings
    if (line.startsWith('# ')) {
      return new Paragraph({
        children: [new TextRun({ text: line.substring(2), bold: true, size: 32 })],
      })
    } else if (line.startsWith('## ')) {
      return new Paragraph({
        children: [new TextRun({ text: line.substring(3), bold: true, size: 28 })],
      })
    } else if (line.startsWith('### ')) {
      return new Paragraph({
        children: [new TextRun({ text: line.substring(4), bold: true, size: 24 })],
      })
    } else if (line.startsWith('- ')) {
      // Handle list items
      return new Paragraph({
        children: parseInlineMarkdown(line.substring(2)),
        bullet: { level: 0 },
      })
    } else {
      // Handle inline formatting for regular paragraphs
      return new Paragraph({
        children: parseInlineMarkdown(line),
      })
    }
  })

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
    numbering: {
      config: [
        {
          reference: 'default-bullet',
          levels: [
            {
              level: 0,
              format: 'bullet',
              text: '•',
              alignment: 'left' as const,
            },
          ],
        },
      ],
    },
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}
