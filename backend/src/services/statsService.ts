/**
 * 使用统计服务
 * 记录和查询使用统计数据
 */

import { query, queryOne, execute } from '../config/database.js'
import { v4 as uuidv4 } from 'uuid'

export interface UsageStat {
  id: string
  user_id: string | null
  date: string
  sessions_count: number
  messages_count: number
  tokens_used: number
  api_calls: number
}

export class StatsService {
  /**
   * 记录使用统计
   */
  async recordUsage(userId: string, data: {
    sessions?: number
    messages?: number
    tokens?: number
    apiCalls?: number
  }): Promise<void> {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // 检查今天的记录是否存在
    const existing = await queryOne<UsageStat>(
      'SELECT id FROM usage_stats WHERE user_id = ? AND date = ?',
      [userId, today]
    )

    if (existing) {
      // 更新现有记录
      const updates: string[] = []
      const params: any[] = []

      if (data.sessions) {
        updates.push('sessions_count = sessions_count + ?')
        params.push(data.sessions)
      }
      if (data.messages) {
        updates.push('messages_count = messages_count + ?')
        params.push(data.messages)
      }
      if (data.tokens) {
        updates.push('tokens_used = tokens_used + ?')
        params.push(data.tokens)
      }
      if (data.apiCalls) {
        updates.push('api_calls = api_calls + ?')
        params.push(data.apiCalls)
      }

      if (updates.length > 0) {
        params.push(existing.id)
        await execute(
          `UPDATE usage_stats SET ${updates.join(', ')} WHERE id = ?`,
          params
        )
      }
    } else {
      // 创建新记录
      await execute(
        'INSERT INTO usage_stats (id, user_id, date, sessions_count, messages_count, tokens_used, api_calls) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          uuidv4(),
          userId,
          today,
          data.sessions || 0,
          data.messages || 0,
          data.tokens || 0,
          data.apiCalls || 0
        ]
      )
    }
  }

  /**
   * 获取用户使用统计
   */
  async getUserStats(userId: string, days = 30): Promise<UsageStat[]> {
    return await query<UsageStat[]>(
      `SELECT * FROM usage_stats
       WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       ORDER BY date DESC`,
      [userId, days]
    )
  }

  /**
   * 获取系统使用统计
   */
  async getSystemStats(days = 30): Promise<{
    totalSessions: number
    totalMessages: number
    totalTokens: number
    totalApiCalls: number
    dailyStats: UsageStat[]
  }> {
    const dailyStats = await query<UsageStat[]>(
      `SELECT
         date,
         SUM(sessions_count) as sessions_count,
         SUM(messages_count) as messages_count,
         SUM(tokens_used) as tokens_used,
         SUM(api_calls) as api_calls
       FROM usage_stats
       WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY date
       ORDER BY date DESC`,
      [days]
    )

    const totals = await queryOne(
      `SELECT
         SUM(sessions_count) as totalSessions,
         SUM(messages_count) as totalMessages,
         SUM(tokens_used) as totalTokens,
         SUM(api_calls) as totalApiCalls
       FROM usage_stats
       WHERE date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
      [days]
    )

    return {
      totalSessions: totals?.totalSessions || 0,
      totalMessages: totals?.totalMessages || 0,
      totalTokens: totals?.totalTokens || 0,
      totalApiCalls: totals?.totalApiCalls || 0,
      dailyStats
    }
  }

  /**
   * 获取今日统计
   */
  async getTodayStats(userId: string): Promise<UsageStat | null> {
    const today = new Date().toISOString().split('T')[0]
    return await queryOne<UsageStat>(
      'SELECT * FROM usage_stats WHERE user_id = ? AND date = ?',
      [userId, today]
    )
  }
}

export const statsService = new StatsService()
