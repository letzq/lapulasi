/**
 * 向量存储服务
 * 封装 ChromaDB 操作
 */

import { chromaClient, COLLECTION_NAME } from '../config/ai.js'

export class VectorStoreService {
  /**
   * 获取或创建集合
   */
  async getCollection() {
    // 使用空的嵌入函数，避免连接 HuggingFace
    return await chromaClient.getOrCreateCollection({
      name: COLLECTION_NAME,
      embeddingFunction: {
        generate: async (texts: string[]) => {
          // 返回随机向量（用于测试）
          return texts.map(() => {
            const embedding: number[] = []
            for (let i = 0; i < 1536; i++) {
              embedding.push(Math.random() * 2 - 1)
            }
            const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
            return embedding.map(val => val / norm)
          })
        }
      }
    })
  }

  /**
   * 添加文档分块到向量数据库
   */
  async addDocument(
    documentId: string,
    chunks: string[],
    metadata: Record<string, any>[]
  ): Promise<void> {
    const collection = await this.getCollection()

    const ids = chunks.map((_, i) => `${documentId}_chunk_${i}`)
    const metadatas = metadata.map(m => ({
      ...m,
      document_id: documentId
    }))

    await collection.add({
      ids,
      documents: chunks,
      metadatas
    })
  }

  /**
   * 搜索相似文档
   */
  async search(query: string, topK = 5): Promise<{
    ids: string[][]
    documents: string[][]
    metadatas: any[][]
    distances: number[][]
  }> {
    const collection = await this.getCollection()

    const results = await collection.query({
      queryTexts: [query],
      nResults: topK
    })

    return {
      ids: (results.ids || []) as string[][],
      documents: (results.documents || []) as string[][],
      metadatas: (results.metadatas || []) as any[][],
      distances: (results.distances || []) as number[][]
    }
  }

  /**
   * 删除文档的所有分块
   */
  async deleteDocument(documentId: string): Promise<void> {
    const collection = await this.getCollection()

    // 获取该文档的所有分块
    const results = await collection.get({
      where: { document_id: documentId }
    })

    if (results.ids.length > 0) {
      await collection.delete({
        ids: results.ids
      })
    }
  }

  /**
   * 获取集合统计
   */
  async getStats(): Promise<{ count: number }> {
    const collection = await this.getCollection()
    const count = await collection.count()
    return { count }
  }
}

export const vectorStoreService = new VectorStoreService()
