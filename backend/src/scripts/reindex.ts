/**
 * 清空 ChromaDB 并重新索引所有文档
 * 用真实 Ollama embedding 替换旧的随机向量
 */
import dotenv from 'dotenv'
import mysql from 'mysql2/promise'
import { chromaClient, COLLECTION_NAME } from '../config/ai.js'
import { vectorStoreService } from '../services/vectorStore.js'
import { documentProcessor } from '../services/documentProcessor.js'

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
  console.log('=== 开始重新索引 ===\n')

  // 1. 清空 ChromaDB 集合
  console.log('1. 清空 ChromaDB 集合...')
  try {
    await chromaClient.deleteCollection({ name: COLLECTION_NAME })
    console.log('   ✅ 已删除旧集合')
  } catch {
    console.log('   集合不存在，跳过')
  }

  // 2. 获取所有活跃文档
  const [docs] = await pool.execute(
    'SELECT id, knowledge_base_id, name, file_path, mime_type FROM documents WHERE status = ?',
    ['active']
  )
  console.log(`\n2. 找到 ${(docs as any[]).length} 个活跃文档\n`)

  // 3. 逐个重新索引
  let successCount = 0
  let failCount = 0

  for (const doc of docs as any[]) {
    console.log(`处理: ${doc.name}`)
    try {
      if (!doc.file_path) {
        console.log('   ⚠️ 无文件路径，跳过')
        failCount++
        continue
      }

      // 解析文档
      const chunks = await documentProcessor.processFile(doc.file_path, doc.mime_type)
      if (chunks.length === 0) {
        console.log('   ⚠️ 解析无内容，跳过')
        failCount++
        continue
      }

      // 存入 ChromaDB
      await vectorStoreService.addDocument(
        doc.id,
        chunks.map(c => c.content),
        chunks.map(c => ({
          ...c.metadata,
          document_id: doc.id,
          knowledge_base_id: doc.knowledge_base_id
        }))
      )

      // 更新数据库中的 chunk_count 和 total_tokens
      const totalTokens = chunks.reduce((sum, c) => sum + documentProcessor.estimateTokens(c.content), 0)
      await pool.execute(
        'UPDATE documents SET chunk_count = ?, total_tokens = ? WHERE id = ?',
        [chunks.length, totalTokens, doc.id]
      )
      // 同步更新 document_chunks 表
      await pool.execute('DELETE FROM document_chunks WHERE document_id = ?', [doc.id])
      for (const chunk of chunks) {
        const { v4: uuidv4 } = await import('uuid')
        await pool.execute(
          'INSERT INTO document_chunks (id, document_id, content, chunk_index, tokens, metadata) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), doc.id, chunk.content, chunk.metadata.chunk_index, documentProcessor.estimateTokens(chunk.content), JSON.stringify(chunk.metadata)]
        )
      }

      console.log(`   ✅ ${chunks.length} chunks, ${totalTokens} tokens`)
      successCount++
    } catch (e: any) {
      console.log(`   ❌ 失败: ${e.message}`)
      failCount++
    }
  }

  console.log(`\n=== 完成 ===`)
  console.log(`成功: ${successCount}, 失败: ${failCount}`)

  const stats = await vectorStoreService.getStats()
  console.log(`ChromaDB 总 chunks: ${stats.count}`)

  await pool.end()
}

main().catch(e => {
  console.error('错误:', e.message)
  process.exit(1)
})
