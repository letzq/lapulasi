/**
 * 对话服务
 * 处理对话相关业务逻辑
 */

import { messageService } from './messageService.js'
import { sessionService } from './sessionService.js'
import { ragChain } from './ragChain.js'
import type { Message, StreamEvent } from '../types/index.js'

export class ChatService {
  /**
   * 发送消息（非流式）
   */
  async sendMessage(
    sessionId: string,
    content: string,
    userId: string
  ): Promise<Message> {
    const startTime = Date.now()

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

    // 5. 更新会话统计
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

    // 5. 更新会话统计
    await sessionService.update(sessionId, {
      avg_latency: latency
    })

    // 6. 发送完成事件
    yield { type: 'done', message: assistantMessage }
  }
}

export const chatService = new ChatService()
