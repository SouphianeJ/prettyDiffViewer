# Pretty Diff Viewer

This is a simple Next.js application written in TypeScript that lets you compare two pieces of text. Added or modified text is highlighted in green, removed text in red and changes that only affect whitespace are shown in blue.

## Features

- **File Upload**: Upload `.txt` or `.docx` files for comparison
- **AI Text Improvement**: Use Google Gemini AI to improve your text
- **Export to .docx**: Download the modified text as a Word document
- **Responsive Design**: Works on desktop and mobile devices

## Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Environment Variables

To use the AI text improvement feature, you need to configure a Gemini API key:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Add your API key to `.env.local`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

The API key is only used server-side and is never exposed to the client.
