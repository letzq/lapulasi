import { Router, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { query, queryOne } from '../config/database.js'
import { statsService } from '../services/statsService.js'
import { successResponse, errorResponse, camelizeKeys } from '../utils/transform.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise-workspace-secret-key'

function getCurrentUserId(req: Request): string | null {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return null
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

// GET /api/analytics/overview
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const sessionCount = await queryOne(
      'SELECT COUNT(*) as total FROM sessions WHERE user_id = ?', [userId]
    )
    const messageCount = await queryOne(
      'SELECT COUNT(*) as total FROM messages m JOIN sessions s ON m.session_id = s.id WHERE s.user_id = ?', [userId]
    )
    const avgLatency = await queryOne(
      'SELECT AVG(avg_latency) as avg FROM sessions WHERE user_id = ? AND avg_latency > 0', [userId]
    )
    const avgConfidence = await queryOne(
      'SELECT AVG(confidence) as avg FROM messages m JOIN sessions s ON m.session_id = s.id WHERE s.user_id = ? AND m.confidence IS NOT NULL', [userId]
    )
    const totalTokens = await queryOne(
      'SELECT SUM(total_tokens) as total FROM sessions WHERE user_id = ?', [userId]
    )
    const activeUsers = await queryOne(
      'SELECT COUNT(DISTINCT user_id) as total FROM sessions WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
    )
    const modelStats = await query(
      'SELECT model, COUNT(*) as count FROM sessions WHERE user_id = ? GROUP BY model ORDER BY count DESC', [userId]
    )
    const systemStats = await statsService.getSystemStats(30)

    res.json(successResponse({
      totalSessions: sessionCount?.total || 0,
      totalMessages: messageCount?.total || 0,
      activeUsers: activeUsers?.total || 0,
      averageConfidence: avgConfidence?.avg || 0,
      totalTokens: totalTokens?.total || 0,
      averageLatency: avgLatency?.avg || 0,
      modelStats: camelizeKeys(modelStats || []),
      usageStats: camelizeKeys(systemStats)
    }))
  } catch (error) {
    console.error('Get analytics overview error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// GET /api/analytics/daily
router.get('/daily', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const { startDate, endDate } = req.query

    let sql = `
      SELECT DATE(created_at) as date, COUNT(*) as sessions, SUM(total_tokens) as tokens
      FROM sessions WHERE user_id = ?`
    const params: any[] = [userId]

    if (startDate) { sql += ' AND DATE(created_at) >= ?'; params.push(startDate) }
    if (endDate) { sql += ' AND DATE(created_at) <= ?'; params.push(endDate) }

    sql += ' GROUP BY DATE(created_at) ORDER BY date DESC LIMIT 30'
    const dailyStats = await query(sql, params)

    const dailyWithMessages = await Promise.all(
      dailyStats.map(async (day: any) => {
        const messageCount = await queryOne(
          'SELECT COUNT(*) as count FROM messages m JOIN sessions s ON m.session_id = s.id WHERE s.user_id = ? AND DATE(m.created_at) = ?',
          [userId, day.date]
        )
        return {
          date: day.date,
          sessions: day.sessions,
          messages: messageCount?.count || 0,
          tokens: day.tokens || 0
        }
      })
    )

    res.json(successResponse(camelizeKeys(dailyWithMessages)))
  } catch (error) {
    console.error('Get daily stats error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// GET /api/analytics/models
router.get('/models', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const modelStats = await query(
      'SELECT model, COUNT(*) as count FROM sessions WHERE user_id = ? GROUP BY model ORDER BY count DESC', [userId]
    )

    const total = modelStats.reduce((sum: number, m: any) => sum + m.count, 0)
    const modelsWithPercentage = modelStats.map((m: any) => ({
      model: m.model,
      count: m.count,
      percentage: total > 0 ? Math.round((m.count / total) * 100) : 0
    }))

    res.json(successResponse(modelsWithPercentage))
  } catch (error) {
    console.error('Get model stats error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// GET /api/analytics/agents
router.get('/agents', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    // 获取用户的 agent 及其关联的会话/消息统计
    const agentStats = await query(
      `SELECT
        a.id as agent_id,
        a.name as agent_name,
        COUNT(DISTINCT s.id) as sessions,
        COUNT(m.id) as messages
      FROM agents a
      LEFT JOIN sessions s ON s.model = a.model AND s.user_id = ?
      LEFT JOIN messages m ON m.session_id = s.id
      WHERE a.user_id = ?
      GROUP BY a.id, a.name
      ORDER BY sessions DESC`,
      [userId, userId]
    )

    res.json(successResponse(camelizeKeys(agentStats)))
  } catch (error) {
    console.error('Get agent stats error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// GET /api/analytics/top-questions
router.get('/top-questions', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const limitNum = parseInt(req.query.limit as string) || 10
    const topQuestions = await query(
      `SELECT m.content as question, COUNT(*) as count
       FROM messages m JOIN sessions s ON m.session_id = s.id
       WHERE s.user_id = ? AND m.role = 'user'
       GROUP BY m.content ORDER BY count DESC LIMIT ${limitNum}`,
      [userId]
    )

    res.json(successResponse(camelizeKeys(topQuestions)))
  } catch (error) {
    console.error('Get top questions error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

export default router
