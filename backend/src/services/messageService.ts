/**
 * 消息服务
 * 处理消息相关的业务逻辑
 */

import { query, queryOne, execute } from '../config/database'
import { generateId } from '../utils/helpers'
import type { Message, MessageSource, PaginatedResponse, Pagination } from '../types'

export class MessageService {
  /**
   * 获取会话消息列表
   */
  async findBySessionId(
    sessionId: string,
    page = 1,
    pageSize = 50
  ): Promise<PaginatedResponse<Message>> {
    const offset = (page - 1) * pageSize

    const items = await query<Message[]>(
      `SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ${pageSize} OFFSET ${offset}`,
      [sessionId]
    )

    const countResult = await queryOne<{ total: number }>(
      'SELECT COUNT(*) as total FROM messages WHERE session_id = ?',
      [sessionId]
    )

    const total = countResult?.total || 0
    const pagination: Pagination = { page, pageSize, total, totalPages: Math.ceil(total / pageSize) }

    return { items, pagination }
  }

  /**
   * 获取单个消息
   */
  async findById(id: string): Promise<Message | null> {
    return await queryOne<Message>('SELECT * FROM messages WHERE id = ?', [id])
  }

  /**
   * 创建消息
   */
  async create(data: {
    session_id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    tokens?: number
    latency?: number
    confidence?: number
    metadata?: Record<string, any>
  }): Promise<Message> {
    const id = generateId()
    await execute(
      `INSERT INTO messages (id, session_id, role, content, tokens, latency, confidence, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.session_id,
        data.role,
        data.content,
        data.tokens || 0,
        data.latency || 0,
        data.confidence ?? null,
        data.metadata ? JSON.stringify(data.metadata) : null
      ]
    )
    return (await this.findById(id))!
  }

  /**
   * 添加消息来源
   */
  async addSource(
    messageId: string,
    data: {
      document_id?: string
      chunk_id?: string
      title: string
      content?: string
      url?: string
      relevance: number
    }
  ): Promise<MessageSource> {
    const id = generateId()
    await execute(
      `INSERT INTO message_sources (id, message_id, document_id, chunk_id, title, content, url, relevance)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, messageId, data.document_id, data.chunk_id, data.title, data.content, data.url, data.relevance]
    )
    return (await queryOne<MessageSource>('SELECT * FROM message_sources WHERE id = ?', [id]))!
  }

  /**
   * 获取消息来源
   */
  async findSources(messageId: string): Promise<MessageSource[]> {
    return await query<MessageSource[]>(
      'SELECT * FROM message_sources WHERE message_id = ?',
      [messageId]
    )
  }

  /**
   * 删除消息
   */
  async delete(id: string): Promise<void> {
    await execute('DELETE FROM messages WHERE id = ?', [id])
  }
}

export const messageService = new MessageService()
