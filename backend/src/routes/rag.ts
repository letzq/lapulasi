/**
 * RAG 路由
 * 处理文档上传和 RAG 对话
 */

import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import { documentProcessor } from '../services/documentProcessor.js'
import { vectorStoreService } from '../services/vectorStore.js'
import { ragChain } from '../services/ragChain.js'
import { memoryService } from '../services/memoryService.js'
import { statsService } from '../services/statsService.js'
import { execute, query, queryOne } from '../config/database.js'
import { successResponse, errorResponse, camelizeKeys } from '../utils/transform.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise-workspace-secret-key'

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `${uuidv4()}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.txt') || file.originalname.endsWith('.md')) {
      cb(null, true)
    } else {
      cb(new Error('Unsupported file type'))
    }
  }
})

// 获取当前用户ID的辅助函数
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

/**
 * POST /api/rag/upload
 * 上传文档到知识库
 */
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    // 支持 knowledgeBaseId 和 knowledge_base_id 两种参数名
    const knowledge_base_id = req.body.knowledge_base_id || req.body.knowledgeBaseId
    const file = req.file

    if (!file) {
      res.status(400).json(errorResponse('没有上传文件'))
      return
    }

    if (!knowledge_base_id) {
      res.status(400).json(errorResponse('缺少知识库 ID'))
      return
    }

    // 验证知识库存在且属于当前用户
    const kb = await queryOne(
      'SELECT id FROM knowledge_bases WHERE id = ? AND user_id = ?',
      [knowledge_base_id, userId]
    )

    if (!kb) {
      res.status(404).json({ success: false, error: '知识库不存在' })
      return
    }

    // 1. 保存文档信息到数据库
    const documentId = uuidv4()
    await execute(
      'INSERT INTO documents (id, knowledge_base_id, user_id, name, file_path, file_size, mime_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [documentId, knowledge_base_id, userId, file.originalname, file.path, file.size, file.mimetype, 'processing']
    )

    // 2. 解析文档
    const chunks = await documentProcessor.processFile(file.path, file.mimetype)

    // 3. 保存分块到数据库
    for (const chunk of chunks) {
      const chunkId = uuidv4()
      const tokens = documentProcessor.estimateTokens(chunk.content)
      await execute(
        'INSERT INTO document_chunks (id, document_id, content, chunk_index, tokens, metadata) VALUES (?, ?, ?, ?, ?, ?)',
        [chunkId, documentId, chunk.content, chunk.metadata.chunk_index, tokens, JSON.stringify(chunk.metadata)]
      )
    }

    // 4. 向量化并存储到 ChromaDB
    try {
      await vectorStoreService.addDocument(
        documentId,
        chunks.map(c => c.content),
        chunks.map(c => ({
          ...c.metadata,
          document_id: documentId,
          knowledge_base_id
        }))
      )
    } catch (error) {
      console.error('Vector store error:', error)
      // 即使向量化失败，也继续处理
    }

    // 5. 更新文档状态
    await execute(
      'UPDATE documents SET status = ?, chunk_count = ?, total_tokens = ? WHERE id = ?',
      ['active', chunks.length, chunks.reduce((sum, c) => sum + documentProcessor.estimateTokens(c.content), 0), documentId]
    )

    // 6. 更新知识库文档数量
    await execute(
      'UPDATE knowledge_bases SET document_count = document_count + 1 WHERE id = ?',
      [knowledge_base_id]
    )

    // 7. 记录统计
    await statsService.recordUsage(userId, { apiCalls: 1 })

    res.status(201).json(successResponse({
      id: documentId,
      name: file.originalname,
      chunkCount: chunks.length,
      status: 'active'
    }))
  } catch (error: any) {
    console.error('Upload error:', error)
    res.status(500).json(errorResponse(error.message || '服务器内部错误'))
  }
})

/**
 * POST /api/rag/chat
 * 流式对话（SSE）
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { session_id, sessionId, content } = req.body
    const sid = session_id || sessionId

    if (!sid || !content) {
      res.status(400).json(errorResponse('session_id 和 content 不能为空'))
      return
    }

    // 获取用户ID
    const userId = getCurrentUserId(req) || ''

    // 设置 SSE 头
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders()

    // 1. 保存用户消息
    const userMessageId = uuidv4()
    await execute(
      'INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
      [userMessageId, sid, 'user', content]
    )

    // 2. 记录统计
    await statsService.recordUsage(userId, { messages: 1, tokens: content.length / 4 })

    // 3. 流式调用 RAG
    const startTime = Date.now()
    let fullAnswer = ''
    let sources: any[] = []
    let confidence = 0

    for await (const event of ragChain.streamAnswer(content, sid)) {
      if (event.type === 'chunk' && event.content) {
        fullAnswer += event.content
        res.write(`data: ${JSON.stringify({ type: 'chunk', content: event.content })}\n\n`)
      } else if (event.type === 'sources' && event.sources) {
        sources = event.sources
        res.write(`data: ${JSON.stringify({ type: 'sources', sources: event.sources })}\n\n`)
      } else if (event.type === 'done') {
        confidence = event.confidence || 0
      }
    }

    // 4. 计算延迟
    const latency = (Date.now() - startTime) / 1000

    // 5. 保存 AI 回复
    const aiMessageId = uuidv4()
    const tokens = Math.floor(fullAnswer.length / 4)
    await execute(
      'INSERT INTO messages (id, session_id, role, content, tokens, latency, confidence, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [aiMessageId, sid, 'assistant', fullAnswer, tokens, latency, confidence, JSON.stringify({ sources })]
    )

    // 6. 保存消息来源
    for (const source of sources) {
      await execute(
        'INSERT INTO message_sources (id, message_id, document_id, title, content, relevance) VALUES (?, ?, ?, ?, ?, ?)',
        [uuidv4(), aiMessageId, source.document_id, source.document_name, source.chunk_content, source.relevance]
      )
    }

    // 7. 更新会话统计
    await execute(
      'UPDATE sessions SET total_tokens = total_tokens + ?, avg_latency = ? WHERE id = ?',
      [tokens, latency, sid]
    )

    // 8. 记录统计
    await statsService.recordUsage(userId, { tokens, apiCalls: 1 })

    // 9. 发送完成事件
    res.write(`data: ${JSON.stringify({
      type: 'done',
      message: {
        id: aiMessageId,
        role: 'assistant',
        content: fullAnswer,
        tokens,
        latency,
        confidence,
        sources
      }
    })}\n\n`)

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error: any) {
    console.error('Chat error:', error)
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`)
    res.end()
  }
})

/**
 * GET /api/rag/documents
 * 获取文档列表
 */
router.get('/documents', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    // 支持 knowledgeBaseId 和 knowledge_base_id 两种参数名
    const kbId = (req.query.knowledge_base_id || req.query.knowledgeBaseId) as string

    let sql = `SELECT d.*, kb.name as knowledge_base_name
               FROM documents d
               JOIN knowledge_bases kb ON d.knowledge_base_id = kb.id
               WHERE kb.user_id = ?`
    const params: any[] = [userId]

    if (kbId) {
      sql += ' AND d.knowledge_base_id = ?'
      params.push(kbId)
    }

    sql += ' ORDER BY d.created_at DESC'

    const documents = await query(sql, params)

    res.json(successResponse(documents))
  } catch (error: any) {
    console.error('Get documents error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

/**
 * DELETE /api/rag/documents/:id
 * 删除文档
 */
router.delete('/documents/:id', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    // 验证文档存在且属于当前用户
    const document = await queryOne(
      `SELECT d.id, d.knowledge_base_id, d.file_path
       FROM documents d
       JOIN knowledge_bases kb ON d.knowledge_base_id = kb.id
       WHERE d.id = ? AND kb.user_id = ?`,
      [req.params.id, userId]
    )

    if (!document) {
      res.status(404).json(errorResponse('文档不存在'))
      return
    }

    // 1. 从向量数据库删除
    try {
      await vectorStoreService.deleteDocument(document.id)
    } catch (error) {
      console.error('Vector store delete error:', error)
    }

    // 2. 删除文件
    if (document.file_path && fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path)
    }

    // 3. 删除数据库记录（级联删除会删除分块）
    await execute('DELETE FROM documents WHERE id = ?', [document.id])

    // 4. 更新知识库文档数量
    await execute(
      'UPDATE knowledge_bases SET document_count = document_count - 1 WHERE id = ?',
      [document.knowledge_base_id]
    )

    res.json(successResponse(null))
  } catch (error: any) {
    console.error('Delete document error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

export default router
