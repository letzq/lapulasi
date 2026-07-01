import { documentProcessor } from '../services/documentProcessor.js'

async function test() {
  const files = ['uploads/338d4eda-770a-4295-9d73-a7adb80f5b05.pdf', 'uploads/24598107-f202-4a52-84db-24eef432848d.pdf']

  for (const file of files) {
    console.log(`\n=== 测试 ${file} ===`)
    try {
      const chunks = await documentProcessor.processFile(file, 'application/pdf')
      console.log(`chunks: ${chunks.length}`)
      if (chunks.length > 0) {
        console.log(`preview: ${chunks[0].content.substring(0, 200)}`)
      }
    } catch (e: any) {
      console.log(`error: ${e.message}`)
    }
  }
}

test()
