import fs from 'fs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

async function test() {
  const pdfParse = require('pdf-parse')
  const files = fs.readdirSync('uploads').filter(f => f.endsWith('.pdf'))
  console.log(`找到 ${files.length} 个 PDF 文件\n`)

  for (const file of files.slice(0, 5)) {
    const buf = fs.readFileSync('uploads/' + file)
    try {
      const data = await pdfParse(buf)
      console.log(`✅ ${file}`)
      console.log(`   页数: ${data.numpages}, 字符数: ${data.text.length}`)
      console.log(`   预览: ${data.text.substring(0, 200).replace(/\n/g, ' ')}`)
      console.log()
    } catch (e: any) {
      console.log(`❌ ${file}: ${e.message}\n`)
    }
  }
}

test().catch(console.error)
