/**
 * AI 配置模块
 * 配置 LangChain、LLM 和向量数据库
 */

import { ChatOpenAI } from '@langchain/openai'
import { ChromaClient } from 'chromadb'
import dotenv from 'dotenv'

dotenv.config()

// 小米模型配置（OpenAI 兼容格式）
export const llm = new ChatOpenAI({
  modelName: process.env.LLM_MODEL || 'xiaomi-model',
  apiKey: process.env.LLM_API_KEY || '',
  configuration: {
    baseURL: process.env.LLM_BASE_URL || 'https://token-plan-cn.xiaomimimo.com/v1'
  },
  streaming: true,
  temperature: 0.7,
  maxTokens: 2048
})

// ChromaDB 客户端配置
export const chromaClient = new ChromaClient({
  path: process.env.CHROMA_DB_URL || 'http://111.170.35.211:8000'
})

// 向量集合名称
export const COLLECTION_NAME = 'documents'

// 测试 ChromaDB 连接
export async function testChromaConnection(): Promise<boolean> {
  try {
    await chromaClient.getOrCreateCollection({ name: COLLECTION_NAME })
    console.log('✅ ChromaDB connected successfully')
    return true
  } catch (error) {
    console.error('❌ ChromaDB connection failed:', error)
    return false
  }
}
