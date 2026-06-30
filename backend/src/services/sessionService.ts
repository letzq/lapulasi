/**
 * 会话服务
 * 处理会话相关的业务逻辑
 */

import { query, queryOne, execute } from '../config/database'
import { generateId } from '../utils/helpers'
import type { Session, PaginatedResponse, Pagination } from '../types'

export class SessionService {
  /**
   * 获取用户会话列表
   */
  async findAll(userId: string, page = 1, pageSize = 10): Promise<PaginatedResponse<Session>> {
    const offset = (page - 1) * pageSize

    const items = await query<Session[]>(
      'SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, pageSize, offset]
    )

    const countResult = await queryOne<{ total: number }>(
      'SELECT COUNT(*) as total FROM sessions WHERE user_id = ?',
      [userId]
    )

    const total = countResult?.total || 0
    const pagination: Pagination = {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }

    return { items, pagination }
  }

  /**
   * 获取单个会话
   */
  async findById(id: string): Promise<Session | null> {
    return await queryOne<Session>('SELECT * FROM sessions WHERE id = ?', [id])
  }

  /**
   * 创建会话
   */
  async create(data: { user_id: string; model?: string; title?: string }): Promise<Session> {
    const id = generateId()
    await execute(
      'INSERT INTO sessions (id, user_id, title, model) VALUES (?, ?, ?, ?)',
      [id, data.user_id, data.title, data.model || 'gpt-4']
    )
    return (await this.findById(id))!
  }

  /**
   * 更新会话
   */
  async update(id: string, data: Partial<Session>): Promise<Session | null> {
    const fields: string[] = []
    const values: any[] = []

    if (data.title !== undefined) {
      fields.push('title = ?')
      values.push(data.title)
    }
    if (data.status !== undefined) {
      fields.push('status = ?')
      values.push(data.status)
    }
    if (data.total_tokens !== undefined) {
      fields.push('total_tokens = ?')
      values.push(data.total_tokens)
    }
    if (data.avg_latency !== undefined) {
      fields.push('avg_latency = ?')
      values.push(data.avg_latency)
    }

    if (fields.length === 0) {
      return this.findById(id)
    }

    values.push(id)
    await execute(`UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`, values)
    return this.findById(id)
  }

  /**
   * 删除会话
   */
  async delete(id: string): Promise<void> {
    await execute('DELETE FROM sessions WHERE id = ?', [id])
  }
}

export const sessionService = new SessionService()
