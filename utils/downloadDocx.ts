import { Document, Packer, Paragraph, TextRun, HeadingLevel, convertInchesToTwip } from 'docx'
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

// Count leading tabs or spaces (4 spaces = 1 tab level)
function getIndentationLevel(line: string): { level: number; content: string } {
  let level = 0
  let index = 0
  
  while (index < line.length) {
    if (line[index] === '\t') {
      level++
      index++
    } else if (
      line[index] === ' ' &&
      line[index + 1] === ' ' &&
      line[index + 2] === ' ' &&
      line[index + 3] === ' '
    ) {
      level++
      index += 4
    } else {
      break
    }
  }
  
  return { level, content: line.slice(index) }
}

// Map heading level (1-6) to HeadingLevel enum
const headingLevelMap: Record<number, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
}

// Parse markdown heading and return level and text, or null if not a heading
function parseMarkdownHeading(text: string): { level: number; content: string } | null {
  const match = text.match(/^(#{1,6})\s+(.*)$/)
  if (match) {
    return { level: match[1].length, content: match[2] }
  }
  return null
}

export async function downloadAsDocx(content: string, filename: string = 'document.docx') {
  // Split content into paragraphs by line breaks
  const lines = content.split('\n')
  
  const paragraphs: Paragraph[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Get indentation level
    const { level: indentLevel, content: lineContent } = getIndentationLevel(line)
    
    // Calculate indentation in twips (1 inch = 1440 twips, 0.5 inch per level)
    const indentation = indentLevel > 0 ? { left: convertInchesToTwip(0.5 * indentLevel) } : undefined
    
    // Handle markdown headings with proper Word heading styles
    const heading = parseMarkdownHeading(lineContent)
    if (heading) {
      paragraphs.push(new Paragraph({
        text: heading.content,
        heading: headingLevelMap[heading.level],
        indent: indentation,
      }))
    } else if (lineContent.startsWith('- ')) {
      // Handle list items with proper indentation
      paragraphs.push(new Paragraph({
        children: parseInlineMarkdown(lineContent.substring(2)),
        bullet: { level: indentLevel },
      }))
    } else if (lineContent === '') {
      // Empty line - add an empty paragraph for spacing
      paragraphs.push(new Paragraph({
        children: [],
      }))
    } else {
      // Handle inline formatting for regular paragraphs with indentation
      paragraphs.push(new Paragraph({
        children: parseInlineMarkdown(lineContent),
        indent: indentation,
      }))
    }
  }

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
            {
              level: 1,
              format: 'bullet',
              text: '◦',
              alignment: 'left' as const,
            },
            {
              level: 2,
              format: 'bullet',
              text: '▪',
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
