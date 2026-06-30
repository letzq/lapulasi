import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import { query, queryOne, execute } from '../config/database.js'
import { ragChain } from '../services/ragChain.js'
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

// GET /api/messages?sessionId=xxx
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    // 支持 sessionId 和 session_id 两种参数名
    const sessionId = (req.query.sessionId || req.query.session_id) as string
    const page = parseInt(req.query.page as string) || 1
    const pageSize = parseInt(req.query.pageSize as string) || 50

    if (!sessionId) {
      res.status(400).json(errorResponse('缺少 sessionId 参数'))
      return
    }

    const session = await queryOne(
      'SELECT id FROM sessions WHERE id = ? AND user_id = ?',
      [sessionId, userId]
    )

    if (!session) {
      res.status(404).json(errorResponse('会话不存在'))
      return
    }

    const offset = (page - 1) * pageSize

    const messages = await query(
      `SELECT id, session_id, role, content, tokens, latency, confidence, metadata, created_at FROM messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ${pageSize} OFFSET ${offset}`,
      [sessionId]
    )

    const countResult = await queryOne(
      'SELECT COUNT(*) as total FROM messages WHERE session_id = ?',
      [sessionId]
    )
    const total = countResult?.total || 0

    // 获取消息来源
    const messagesWithSources = await Promise.all(
      messages.map(async (msg: any) => {
        const sources = await query(
          'SELECT id, document_id, title, content, url, relevance FROM message_sources WHERE message_id = ?',
          [msg.id]
        )
        return {
          ...msg,
          sources: sources.length > 0 ? camelizeKeys(sources) : undefined
        }
      })
    )

    res.json(paginatedResponse(messagesWithSources, total, page, pageSize))
  } catch (error) {
    console.error('Get messages error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// POST /api/messages
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const { sessionId, session_id, content } = req.body
    const sid = sessionId || session_id

    if (!sid || !content) {
      res.status(400).json(errorResponse('sessionId 和 content 不能为空'))
      return
    }

    const session = await queryOne(
      'SELECT id FROM sessions WHERE id = ? AND user_id = ?',
      [sid, userId]
    )

    if (!session) {
      res.status(404).json(errorResponse('会话不存在'))
      return
    }

    // 创建用户消息
    const userMessageId = uuidv4()
    await execute(
      'INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
      [userMessageId, sid, 'user', content]
    )

    // 调用 RAG 获取真实回答
    const startTime = Date.now()
    const ragResult = await ragChain.answer(content, sid)
    const latency = (Date.now() - startTime) / 1000
    const tokens = Math.floor(ragResult.answer.length / 4)

    // 保存 AI 回复
    const aiMessageId = uuidv4()
    await execute(
      'INSERT INTO messages (id, session_id, role, content, tokens, latency, confidence, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [aiMessageId, sid, 'assistant', ragResult.answer, tokens, latency, ragResult.confidence, JSON.stringify({ sources: ragResult.sources })]
    )

    // 保存消息来源
    for (const source of ragResult.sources) {
      await execute(
        'INSERT INTO message_sources (id, message_id, document_id, title, content, relevance) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), aiMessageId, source.document_id, source.document_name, source.chunk_content, source.relevance]
      )
    }

    // 更新会话统计
    await execute(
      'UPDATE sessions SET total_tokens = total_tokens + ?, avg_latency = ? WHERE id = ?',
      [tokens, latency, sid]
    )

    const aiMessage = await queryOne(
      'SELECT id, session_id, role, content, tokens, latency, confidence, created_at FROM messages WHERE id = ?',
      [aiMessageId]
    )

    res.status(201).json(successResponse(aiMessage))
  } catch (error) {
    console.error('Create message error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// POST /api/messages/:id/regenerate
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    // 查找原消息及其关联的用户问题
    const originalMessage = await queryOne(
      `SELECT m.id, m.session_id, m.role FROM messages m
       JOIN sessions s ON m.session_id = s.id
       WHERE m.id = ? AND s.user_id = ?`,
      [req.params.id, userId]
    )

    if (!originalMessage) {
      res.status(404).json(errorResponse('消息不存在'))
      return
    }

    // 获取该会话中此消息之前的用户问题
    const userQuestion = await queryOne(
      `SELECT content FROM messages
       WHERE session_id = ? AND role = 'user' AND created_at < (
         SELECT created_at FROM messages WHERE id = ?
       )
       ORDER BY created_at DESC LIMIT 1`,
      [originalMessage.session_id, req.params.id]
    )

    const questionText = userQuestion?.content || '请重新回答'

    // 调用 RAG 重新生成
    const startTime = Date.now()
    const ragResult = await ragChain.answer(questionText, originalMessage.session_id)
    const latency = (Date.now() - startTime) / 1000
    const tokens = Math.floor(ragResult.answer.length / 4)

    await execute(
      'UPDATE messages SET content = ?, tokens = ?, latency = ?, confidence = ?, metadata = ? WHERE id = ?',
      [ragResult.answer, tokens, latency, ragResult.confidence, JSON.stringify({ sources: ragResult.sources }), req.params.id]
    )

    // 更新来源
    await execute('DELETE FROM message_sources WHERE message_id = ?', [req.params.id])
    for (const source of ragResult.sources) {
      await execute(
        'INSERT INTO message_sources (id, message_id, document_id, title, content, relevance) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), req.params.id, source.document_id, source.document_name, source.chunk_content, source.relevance]
      )
    }

    const updatedMessage = await queryOne(
      'SELECT id, session_id, role, content, tokens, latency, confidence, created_at FROM messages WHERE id = ?',
      [req.params.id]
    )

    res.json(successResponse(updatedMessage))
  } catch (error) {
    console.error('Regenerate message error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// DELETE /api/messages/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const message = await queryOne(
      'SELECT m.id FROM messages m JOIN sessions s ON m.session_id = s.id WHERE m.id = ? AND s.user_id = ?',
      [req.params.id, userId]
    )

    if (!message) {
      res.status(404).json(errorResponse('消息不存在'))
      return
    }

    await execute('DELETE FROM messages WHERE id = ?', [req.params.id])
    res.json(successResponse(null))
  } catch (error) {
    console.error('Delete message error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

export default router
