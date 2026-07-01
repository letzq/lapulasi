/**
 * 嵌入服务
 * 使用阿里云百炼 Embedding API (OpenAI 兼容格式)
 */

import dotenv from 'dotenv'

dotenv.config()

const API_BASE_URL = process.env.EMBEDDING_BASE_URL || 'https://llm-snvwiitgadv6zpj7.cn-beijing.maas.aliyuncs.com/compatible-mode/v1'
const API_KEY = process.env.EMBEDDING_API_KEY || ''
const MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-v4'

export class EmbeddingService {
  /**
   * 获取单条文本的嵌入向量
   */
  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          input: text
        })
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Embedding API error (${response.status}): ${errText}`)
      }

      const data = await response.json() as any
      return data.data[0].embedding
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
      const response = await fetch(`${API_BASE_URL}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: MODEL,
          input: texts
        })
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Embedding API error (${response.status}): ${errText}`)
      }

      const data = await response.json() as any
      return data.data.map((item: any) => item.embedding)
    } catch (error) {
      console.error('Batch embedding error:', error)
      throw error
    }
  }
}

export const embeddingService = new EmbeddingService()
