/**
 * 记忆服务
 * 处理对话历史和上下文管理
 */

import { query } from '../config/database.js'
import type { Message } from '../types/index.js'

export class MemoryService {
  /**
   * 获取对话历史
   */
  async getHistory(sessionId: string, maxRounds = 10): Promise<Message[]> {
    const limit = maxRounds * 2 // 每轮包含用户和AI消息
    const messages = await query<Message[]>(
      `SELECT id, session_id, role, content, tokens, latency, confidence, metadata, created_at
       FROM messages
       WHERE session_id = ?
       ORDER BY created_at DESC
       LIMIT ${limit}`,
      [sessionId]
    )
    return messages.reverse() // 按时间正序
  }

  /**
   * 格式化历史为上下文
   */
  formatHistory(messages: Message[]): string {
    if (messages.length === 0) {
      return '无对话历史'
    }

    return messages.map(m => {
      const role = m.role === 'user' ? '用户' : 'AI助手'
      return `${role}: ${m.content}`
    }).join('\n\n')
  }

  /**
   * 压缩历史（保留关键信息）
   */
  compressHistory(messages: Message[]): string {
    if (messages.length <= 4) {
      return this.formatHistory(messages)
    }

    // 保留最近的 4 条消息
    const recentMessages = messages.slice(-4)
    const olderMessages = messages.slice(0, -4)

    // 对旧消息进行摘要
    const summary = olderMessages.length > 0
      ? `[此前的 ${olderMessages.length} 条对话已省略]\n\n`
      : ''

    return summary + this.formatHistory(recentMessages)
  }

  /**
   * 获取会话摘要
   */
  async getSessionSummary(sessionId: string): Promise<string> {
    const messages = await this.getHistory(sessionId, 5)

    if (messages.length === 0) {
      return '新会话'
    }

    // 提取第一条用户消息作为摘要
    const firstUserMessage = messages.find(m => m.role === 'user')
    if (firstUserMessage) {
      const content = firstUserMessage.content
      return content.length > 50 ? content.substring(0, 50) + '...' : content
    }

    return '会话进行中'
  }

  /**
   * 搜索相关历史消息
   */
  async searchHistory(sessionId: string, keyword: string, limit = 5): Promise<Message[]> {
    return await query<Message[]>(
      `SELECT id, session_id, role, content, created_at
       FROM messages
       WHERE session_id = ? AND content LIKE ?
       ORDER BY created_at DESC
       LIMIT ?`,
      [sessionId, `%${keyword}%`, limit]
    )
  }
}

export const memoryService = new MemoryService()
