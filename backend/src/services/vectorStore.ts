/**
 * 向量存储服务
 * 封装 ChromaDB 操作，使用 Ollama 真实 embedding
 */

import { chromaClient, COLLECTION_NAME } from '../config/ai.js'
import { embeddingService } from './embeddingService.js'

export class VectorStoreService {
  /**
   * 获取或创建集合（使用真实 embedding）
   */
  async getCollection() {
    return await chromaClient.getOrCreateCollection({
      name: COLLECTION_NAME,
      embeddingFunction: {
        generate: async (texts: string[]) => {
          return await embeddingService.getEmbeddings(texts)
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
    if (chunks.length === 0) return

    const collection = await this.getCollection()
    const ids = chunks.map((_, i) => `${documentId}_chunk_${i}`)
    const metadatas = metadata.map(m => ({
      ...m,
      document_id: documentId
    }))

    // 分批处理，每批 50 个 chunk
    const batchSize = 50
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batchChunks = chunks.slice(i, i + batchSize)
      const batchIds = ids.slice(i, i + batchSize)
      const batchMetadatas = metadatas.slice(i, i + batchSize)

      await collection.add({
        ids: batchIds,
        documents: batchChunks,
        metadatas: batchMetadatas
      })

      console.log(`[VectorStore] 添加批次 ${Math.floor(i / batchSize) + 1}: ${batchChunks.length} 个 chunks`)
    }

    console.log(`[VectorStore] 文档 ${documentId} 共添加 ${chunks.length} 个 chunks`)
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

    const results = await collection.get({
      where: { document_id: documentId }
    })

    if (results.ids.length > 0) {
      await collection.delete({ ids: results.ids })
      console.log(`[VectorStore] 删除文档 ${documentId} 的 ${results.ids.length} 个 chunks`)
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
