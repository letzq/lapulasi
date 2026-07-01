/**
 * RAG 链服务
 * 实现检索增强生成，支持来源标注和记忆功能
 */

import { vectorStoreService } from './vectorStore.js'
import { memoryService } from './memoryService.js'
import { ragLogger } from '../middleware/logger.js'
import dotenv from 'dotenv'

dotenv.config()

/**
 * RAG 提示词模板
 */
const RAG_PROMPT = `你是一个智能助手，基于提供的上下文和对话历史回答用户的问题。

重要规则：
1. 优先根据提供的上下文回答问题
2. 如果上下文中没有相关信息，可以根据你的知识回答，但需要说明
3. 回答要准确、简洁、有帮助
4. 使用中文回答
5. 在回答中适当引用来源文档

上下文（来自知识库）：
{context}

对话历史：
{history}

用户问题：{question}

请提供有帮助的回答：`

export interface RAGSource {
  document_id: string
  document_name: string
  chunk_content: string
  relevance: number
  page?: number
}

export interface RAGResult {
  answer: string
  sources: RAGSource[]
  confidence: number
}

export class RAGChain {
  /**
   * 获取回答（非流式）
   */
  async answer(
    question: string,
    sessionId?: string,
    topK = 5
  ): Promise<RAGResult> {
    // 1. 向量检索
    ragLogger.searchStart(question, topK)
    let searchResults: any = { ids: [[]], documents: [[]], metadatas: [[]], distances: [[]] }
    try {
      searchResults = await vectorStoreService.search(question, topK)
      const resultCount = searchResults.ids?.[0]?.length || 0
      const topRelevance = searchResults.distances?.[0]?.[0] !== undefined ? Math.max(0, 1 / (1 + searchResults.distances[0][0])) : 0
      ragLogger.searchResult(resultCount, topRelevance)
    } catch (error: any) {
      ragLogger.searchError(error)
    }

    // 2. 构建上下文
    const context = searchResults.documents?.[0]?.join('\n\n') || '没有找到相关文档'

    // 3. 加载对话历史
    let historyText = '无对话历史'
    if (sessionId) {
      const history = await memoryService.getHistory(sessionId, 5)
      historyText = memoryService.formatHistory(history)
    }

    // 4. 构建来源信息
    const sources: RAGSource[] = (searchResults.metadatas?.[0] || []).map((meta: any, i: number) => ({
      document_id: meta.document_id || 'unknown',
      document_name: meta.source || '未知文档',
      chunk_content: (searchResults.documents?.[0]?.[i] || '').substring(0, 200),
      relevance: searchResults.distances?.[0]?.[i] !== undefined
        ? Math.max(0, 1 / (1 + searchResults.distances[0][i]))
        : 0.5
    }))

    // 5. 构建提示词
    const prompt = RAG_PROMPT
      .replace('{context}', context)
      .replace('{history}', historyText)
      .replace('{question}', question)

    // 6. 调用 LLM
    const llmStart = Date.now()
    ragLogger.llmStart(process.env.LLM_MODEL || 'mimo-v2.5')
    const answer = await this.callLLM(prompt)
    ragLogger.llmDone(Date.now() - llmStart, answer.length)

    // 7. 计算置信度
    const confidence = sources.length > 0
      ? sources.reduce((sum, s) => sum + s.relevance, 0) / sources.length
      : 0.5

    return { answer, sources, confidence }
  }

  /**
   * 流式获取回答
   */
  async *streamAnswer(
    question: string,
    sessionId?: string,
    topK = 5
  ): AsyncGenerator<{ type: 'chunk' | 'sources' | 'done', content?: string, sources?: RAGSource[], confidence?: number }, void, unknown> {
    // 1. 向量检索（如果 ChromaDB 不可用，使用空结果）
    ragLogger.searchStart(question, topK)
    let searchResults: any = { ids: [[]], documents: [[]], metadatas: [[]], distances: [[]] }
    try {
      searchResults = await vectorStoreService.search(question, topK)
      const resultCount = searchResults.ids?.[0]?.length || 0
      const topRelevance = searchResults.distances?.[0]?.[0] !== undefined ? Math.max(0, 1 / (1 + searchResults.distances[0][0])) : 0
      ragLogger.searchResult(resultCount, topRelevance)
    } catch (error: any) {
      ragLogger.searchError(error)
    }

    // 2. 构建上下文
    const context = searchResults.documents?.[0]?.join('\n\n') || '没有找到相关文档'

    // 3. 加载对话历史
    let historyText = '无对话历史'
    if (sessionId) {
      const history = await memoryService.getHistory(sessionId, 5)
      historyText = memoryService.formatHistory(history)
    }

    // 4. 构建来源信息
    const sources: RAGSource[] = (searchResults.metadatas?.[0] || []).map((meta: any, i: number) => ({
      document_id: meta.document_id || 'unknown',
      document_name: meta.source || '未知文档',
      chunk_content: (searchResults.documents?.[0]?.[i] || '').substring(0, 200),
      relevance: searchResults.distances?.[0]?.[i] !== undefined
        ? Math.max(0, 1 / (1 + searchResults.distances[0][i]))
        : 0.5
    }))

    // 5. 发送来源信息
    yield { type: 'sources', sources }

    // 6. 构建提示词
    const prompt = RAG_PROMPT
      .replace('{context}', context)
      .replace('{history}', historyText)
      .replace('{question}', question)

    // 7. 流式调用 LLM
    let fullAnswer = ''
    try {
      const response = await fetch(`${process.env.LLM_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LLM_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.LLM_MODEL || 'mimo-v2.5',
          messages: [
            {
              role: 'system',
              content: '你是一个智能助手，基于提供的知识库回答用户的问题。请用中文回答，回答要准确、简洁、有帮助。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: true,
          max_tokens: 2048,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`)
      }

      // 处理流式响应
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader available')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim()
            if (data === '[DONE]') break
            if (data) {
              try {
                const parsed = JSON.parse(data)
                const chunkContent = parsed.choices?.[0]?.delta?.content
                if (chunkContent) {
                  fullAnswer += chunkContent
                  yield { type: 'chunk', content: chunkContent }
                }
              } catch {
                // 忽略解析错误
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('LLM API error:', error)
      // 如果 LLM 不可用，返回模拟回复
      fullAnswer = `感谢您的提问！您的问题是："${question}"

这是一个基于知识库的回复。当 LLM 服务可用时，系统会使用 RAG 技术提供更准确的回答。

如需了解更多详情，请随时提问。`

      // 流式发送模拟回复
      const words = fullAnswer.split('')
      for (let i = 0; i < words.length; i++) {
        yield { type: 'chunk', content: words[i] }
        await new Promise(resolve => setTimeout(resolve, 20))
      }
    }

    // 8. 计算置信度
    const confidence = sources.length > 0
      ? sources.reduce((sum, s) => sum + s.relevance, 0) / sources.length
      : 0.5

    // 9. 发送完成事件
    yield { type: 'done', sources, confidence }
  }

  /**
   * 调用 LLM
   */
  private async callLLM(prompt: string): Promise<string> {
    try {
      const response = await fetch(`${process.env.LLM_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LLM_API_KEY}`
        },
        body: JSON.stringify({
          model: process.env.LLM_MODEL || 'mimo-v2.5',
          messages: [
            {
              role: 'system',
              content: '你是一个智能助手，基于提供的知识库回答用户的问题。请用中文回答，回答要准确、简洁、有帮助。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 2048,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`)
      }

      const data = await response.json() as any
      return data.choices[0].message.content
    } catch (error) {
      console.error('LLM call error:', error)
      return `感谢您的提问！系统正在处理中，请稍后再试。`
    }
  }
}

export const ragChain = new RAGChain()
