import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import { query, queryOne, execute } from '../config/database.js'
import { successResponse, errorResponse, paginatedResponse, camelizeKeys } from '../utils/transform.js'

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

// GET /api/sessions
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const { page = 1, pageSize = 10, status } = req.query
    const pageNum = parseInt(page as string) || 1
    const size = parseInt(pageSize as string) || 10
    const offset = (pageNum - 1) * size

    let sql = 'SELECT id, user_id, title, model, status, total_tokens, avg_latency, created_at, updated_at FROM sessions WHERE user_id = ?'
    const params: any[] = [userId]

    if (status) {
      sql += ' AND status = ?'
      params.push(status)
    }

    sql += ` ORDER BY updated_at DESC LIMIT ${size} OFFSET ${offset}`
    const sessions = await query(sql, params)

    let countSql = 'SELECT COUNT(*) as total FROM sessions WHERE user_id = ?'
    const countParams: any[] = [userId]
    if (status) {
      countSql += ' AND status = ?'
      countParams.push(status)
    }
    const countResult = await queryOne(countSql, countParams)
    const total = countResult?.total || 0

    // 获取每个会话的消息数量
    const sessionsWithCount = await Promise.all(
      sessions.map(async (session: any) => {
        const messageCount = await queryOne(
          'SELECT COUNT(*) as count FROM messages WHERE session_id = ?',
          [session.id]
        )
        return { ...session, messageCount: messageCount?.count || 0 }
      })
    )

    res.json(paginatedResponse(sessionsWithCount, total, pageNum, size))
  } catch (error) {
    console.error('Get sessions error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// GET /api/sessions/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const session = await queryOne(
      'SELECT id, user_id, title, model, status, total_tokens, avg_latency, metadata, created_at, updated_at FROM sessions WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    )

    if (!session) {
      res.status(404).json(errorResponse('会话不存在'))
      return
    }

    const messageCount = await queryOne(
      'SELECT COUNT(*) as count FROM messages WHERE session_id = ?',
      [session.id]
    )

    res.json(successResponse({ ...session, messageCount: messageCount?.count || 0 }))
  } catch (error) {
    console.error('Get session error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// POST /api/sessions
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const { model = 'xiaomi-model', title } = req.body
    const sessionId = uuidv4()

    await execute(
      'INSERT INTO sessions (id, user_id, title, model, status) VALUES (?, ?, ?, ?, ?)',
      [sessionId, userId, title || '新对话', model, 'active']
    )

    const newSession = await queryOne(
      'SELECT id, user_id, title, model, status, total_tokens, avg_latency, created_at, updated_at FROM sessions WHERE id = ?',
      [sessionId]
    )

    res.status(201).json(successResponse(newSession))
  } catch (error) {
    console.error('Create session error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// PATCH /api/sessions/:id
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const { title, model, status } = req.body

    const existingSession = await queryOne(
      'SELECT id FROM sessions WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    )

    if (!existingSession) {
      res.status(404).json(errorResponse('会话不存在'))
      return
    }

    const updates: string[] = []
    const params: any[] = []

    if (title !== undefined) { updates.push('title = ?'); params.push(title) }
    if (model !== undefined) { updates.push('model = ?'); params.push(model) }
    if (status !== undefined) { updates.push('status = ?'); params.push(status) }

    if (updates.length > 0) {
      params.push(req.params.id)
      await execute(`UPDATE sessions SET ${updates.join(', ')} WHERE id = ?`, params)
    }

    const updatedSession = await queryOne(
      'SELECT id, user_id, title, model, status, total_tokens, avg_latency, created_at, updated_at FROM sessions WHERE id = ?',
      [req.params.id]
    )

    res.json(successResponse(updatedSession))
  } catch (error) {
    console.error('Update session error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// PUT /api/sessions/:id (与 PATCH 相同逻辑)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const { title, model, status } = req.body

    const existingSession = await queryOne(
      'SELECT id FROM sessions WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    )

    if (!existingSession) {
      res.status(404).json(errorResponse('会话不存在'))
      return
    }

    const updates: string[] = []
    const params: any[] = []

    if (title !== undefined) { updates.push('title = ?'); params.push(title) }
    if (model !== undefined) { updates.push('model = ?'); params.push(model) }
    if (status !== undefined) { updates.push('status = ?'); params.push(status) }

    if (updates.length > 0) {
      params.push(req.params.id)
      await execute(`UPDATE sessions SET ${updates.join(', ')} WHERE id = ?`, params)
    }

    const updatedSession = await queryOne(
      'SELECT id, user_id, title, model, status, total_tokens, avg_latency, created_at, updated_at FROM sessions WHERE id = ?',
      [req.params.id]
    )

    res.json(successResponse(updatedSession))
  } catch (error) {
    console.error('Update session error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// DELETE /api/sessions/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const existingSession = await queryOne(
      'SELECT id FROM sessions WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    )

    if (!existingSession) {
      res.status(404).json(errorResponse('会话不存在'))
      return
    }

    await execute('DELETE FROM sessions WHERE id = ?', [req.params.id])
    res.json(successResponse(null))
  } catch (error) {
    console.error('Delete session error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// DELETE /api/sessions/:id/messages (清空会话消息)
router.delete('/:id/messages', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const existingSession = await queryOne(
      'SELECT id FROM sessions WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    )

    if (!existingSession) {
      res.status(404).json(errorResponse('会话不存在'))
      return
    }

    await execute('DELETE FROM messages WHERE session_id = ?', [req.params.id])
    await execute('UPDATE sessions SET total_tokens = 0, avg_latency = 0 WHERE id = ?', [req.params.id])

    res.json(successResponse(null))
  } catch (error) {
    console.error('Clear session messages error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

export default router
