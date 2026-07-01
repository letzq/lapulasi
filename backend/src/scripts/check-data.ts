/**
 * 检查数据库中的文档和分块数据
 */
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lapulasi',
  charset: 'utf8mb4'
})

async function main() {
  // 查看文档
  const [docs] = await pool.execute(
    'SELECT id, name, mime_type, status, chunk_count, file_size FROM documents ORDER BY created_at DESC LIMIT 5'
  )
  console.log('\n=== 文档列表 ===')
  for (const doc of docs as any[]) {
    console.log(`  ${doc.name} | ${doc.mime_type} | ${doc.status} | ${doc.chunk_count} chunks | ${doc.file_size} bytes`)
  }

  // 查看分块内容
  const [chunks] = await pool.execute(
    'SELECT id, document_id, SUBSTRING(content, 1, 200) as preview, chunk_index, tokens FROM document_chunks ORDER BY created_at DESC LIMIT 5'
  )
  console.log('\n=== 分块内容预览 ===')
  for (const chunk of chunks as any[]) {
    console.log(`\n--- chunk #${chunk.chunk_index} (${chunk.tokens} tokens) ---`)
    console.log(chunk.preview)
  }

  // 查看消息来源
  const [sources] = await pool.execute(
    'SELECT id, message_id, title, SUBSTRING(content, 1, 100) as preview, relevance FROM message_sources ORDER BY created_at DESC LIMIT 5'
  )
  console.log('\n=== 消息来源预览 ===')
  for (const src of sources as any[]) {
    console.log(`  ${src.title} | relevance: ${src.relevance} | ${src.preview}`)
  }

  await pool.end()
  console.log('\n完成')
}

main().catch(e => {
  console.error('错误:', e.message)
  process.exit(1)
})
