import { Document, Packer, Paragraph, TextRun } from 'docx'
import { saveAs } from 'file-saver'

export async function downloadAsDocx(content: string, filename: string = 'document.docx') {
  // Split content into paragraphs by line breaks
  const lines = content.split('\n')
  
  const paragraphs = lines.map(line => {
    // Handle markdown-like formatting
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
    } else if (line.startsWith('**') && line.endsWith('**')) {
      return new Paragraph({
        children: [new TextRun({ text: line.slice(2, -2), bold: true })],
      })
    } else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      return new Paragraph({
        children: [new TextRun({ text: line.slice(1, -1), italics: true })],
      })
    } else {
      return new Paragraph({
        children: [new TextRun(line)],
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
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, filename)
}
