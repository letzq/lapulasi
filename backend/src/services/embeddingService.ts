/**
 * 嵌入服务
 * 使用 Ollama qwen3-embedding:4b 生成向量
 */

import dotenv from 'dotenv'

dotenv.config()

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434'
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'qwen3-embedding:4b'

export class EmbeddingService {
  /**
   * 获取单条文本的嵌入向量
   */
  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: text
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama embedding error: ${response.status}`)
      }

      const data = await response.json() as any
      return data.embeddings[0]
    } catch (error) {
      console.error('Embedding error:', error)
      throw error
    }
  }

  /**
   * 批量获取嵌入向量
   */
  async getEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await fetch(`${OLLAMA_URL}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: EMBEDDING_MODEL,
          input: texts
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama embedding error: ${response.status}`)
      }

      const data = await response.json() as any
      return data.embeddings
    } catch (error) {
      console.error('Batch embedding error:', error)
      throw error
    }
  }
}

export const embeddingService = new EmbeddingService()
