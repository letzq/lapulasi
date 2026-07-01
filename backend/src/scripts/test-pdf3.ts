import fs from 'fs'

async function test() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const data = new Uint8Array(fs.readFileSync('uploads/338d4eda-770a-4295-9d73-a7adb80f5b05.pdf'))

  const doc = await pdfjsLib.getDocument({ data }).promise
  console.log('pages:', doc.numPages)

  let fullText = ''
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const text = content.items.map((item: any) => item.str).join(' ')
    fullText += text + '\n'
  }

  console.log('text length:', fullText.length)
  console.log('preview:', fullText.substring(0, 300))
}

test().catch(e => console.error('error:', e.message))
