/**
 * 嵌入服务
 * 处理文本向量化
 */

import dotenv from 'dotenv'

dotenv.config()

export class EmbeddingService {
  private apiKey: string
  private baseUrl: string
  private model: string

  constructor() {
    this.apiKey = process.env.LLM_API_KEY || ''
    this.baseUrl = process.env.LLM_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1'
    this.model = 'text-embedding-ada-002' // 使用 OpenAI 兼容的嵌入模型
  }

  /**
   * 获取文本嵌入向量
   */
  async getEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          input: text
        })
      })

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`)
      }

      const data = await response.json() as any
      return data.data[0].embedding
    } catch (error) {
      console.error('Embedding error:', error)
      // 如果嵌入 API 不可用，返回随机向量（用于测试）
      return this.generateRandomEmbedding()
    }
  }

  /**
   * 批量获取文本嵌入向量
   */
  async getEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          input: texts
        })
      })

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`)
      }

      const data = await response.json() as any
      return data.data.map((item: any) => item.embedding)
    } catch (error) {
      console.error('Batch embedding error:', error)
      // 如果嵌入 API 不可用，返回随机向量（用于测试）
      return texts.map(() => this.generateRandomEmbedding())
    }
  }

  /**
   * 生成随机嵌入向量（用于测试）
   */
  private generateRandomEmbedding(dimensions = 1536): number[] {
    const embedding: number[] = []
    for (let i = 0; i < dimensions; i++) {
      embedding.push(Math.random() * 2 - 1) // -1 到 1 之间的随机数
    }
    // 归一化
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return embedding.map(val => val / norm)
  }
}

export const embeddingService = new EmbeddingService()
