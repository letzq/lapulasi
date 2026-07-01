/**
 * 对话服务
 * 处理对话相关业务逻辑
 */

import { randomUUID } from 'crypto'
import { messageService } from './messageService.js'
import { sessionService } from './sessionService.js'
import { ragChain } from './ragChain.js'
import { execute, query } from '../config/database.js'
import type { Message, StreamEvent } from '../types/index.js'

export class ChatService {
  /**
   * 自动更新会话标题（取用户首条消息的前15个字符）
   */
  private async autoUpdateTitle(sessionId: string, content: string): Promise<void> {
    try {
      const session = await sessionService.findById(sessionId)
      if (!session || (session.title && session.title !== '新对话')) return

      const autoTitle = content.length > 15
        ? content.substring(0, 15) + '...'
        : content
      await sessionService.update(sessionId, { title: autoTitle })
    } catch (e) {
      console.warn('Auto-update title failed:', e)
    }
  }

  /**
   * 保存消息来源到 message_sources 表
   */
  private async saveSources(messageId: string, sources: any[]): Promise<void> {
    if (!sources || sources.length === 0) return

    try {
      for (const src of sources) {
        const documentId = src.documentId || src.document_id || null
        let title = src.documentName || src.document_name || src.title || '未知文档'

        // 如果有 document_id 但没有文档名，从数据库查询
        if (documentId && title === '未知文档') {
          try {
            const doc = await query<any[]>(
              'SELECT name FROM documents WHERE id = ? LIMIT 1',
              [documentId]
            )
            if (doc.length > 0 && doc[0].name) {
              title = doc[0].name
            }
          } catch {}
        }

        await execute(
          `INSERT INTO message_sources (id, message_id, document_id, chunk_id, title, content, relevance)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            randomUUID(),
            messageId,
            documentId,
            src.chunkId || src.chunk_id || null,
            title,
            src.chunkContent || src.chunk_content || src.content || '',
            src.similarity || src.relevance || 0
          ]
        )
      }
    } catch (e) {
      console.warn('Save sources failed:', e)
    }
  }

  /**
   * 发送消息（非流式）
   */
  async sendMessage(
    sessionId: string,
    content: string,
    userId: string
  ): Promise<Message> {
    const startTime = Date.now()

    // 0. 自动更新会话标题
    await this.autoUpdateTitle(sessionId, content)

    // 1. 保存用户消息
    await messageService.create({
      session_id: sessionId,
      role: 'user',
      content
    })

    // 2. 调用 RAG 获取回答
    const ragResult = await ragChain.answer(content, sessionId)

    // 3. 计算延迟
    const latency = (Date.now() - startTime) / 1000

    // 4. 保存 AI 回复
    const assistantMessage = await messageService.create({
      session_id: sessionId,
      role: 'assistant',
      content: ragResult.answer,
      latency,
      confidence: ragResult.confidence,
      metadata: {
        sources: ragResult.sources
      }
    })

    // 5. 保存来源到 message_sources 表
    await this.saveSources(assistantMessage.id, ragResult.sources)

    // 6. 更新会话统计
    await sessionService.update(sessionId, {
      avg_latency: latency
    })

    return assistantMessage
  }

  /**
   * 流式发送消息
   */
  async *streamMessage(
    sessionId: string,
    content: string,
    userId: string
  ): AsyncGenerator<StreamEvent, void, unknown> {
    const startTime = Date.now()

    // 0. 自动更新会话标题
    await this.autoUpdateTitle(sessionId, content)

    // 1. 保存用户消息
    await messageService.create({
      session_id: sessionId,
      role: 'user',
      content
    })

    // 2. 流式获取回答
    let fullAnswer = ''
    let sources: any[] = []
    let confidence = 0

    try {
      for await (const event of ragChain.streamAnswer(content, sessionId)) {
        if (event.type === 'chunk' && event.content) {
          fullAnswer += event.content
          yield { type: 'chunk', content: event.content }
        } else if (event.type === 'sources' && event.sources) {
          sources = event.sources
          // 转发来源事件给前端
          yield { type: 'sources', sources: event.sources }
        } else if (event.type === 'done') {
          confidence = event.confidence || 0
        }
      }
    } catch (error: any) {
      yield { type: 'error', error: error.message }
      return
    }

    // 3. 计算延迟
    const latency = (Date.now() - startTime) / 1000

    // 4. 保存完整回复
    const assistantMessage = await messageService.create({
      session_id: sessionId,
      role: 'assistant',
      content: fullAnswer,
      latency,
      confidence,
      metadata: { sources }
    })

    // 5. 保存来源到 message_sources 表
    await this.saveSources(assistantMessage.id, sources)

    // 6. 更新会话统计
    await sessionService.update(sessionId, {
      avg_latency: latency
    })

    // 7. 发送完成事件
    yield { type: 'done', message: assistantMessage }
  }
}

export const chatService = new ChatService()
