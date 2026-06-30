import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { query, queryOne, execute } from '../config/database.js'
import { documentProcessor } from '../services/documentProcessor.js'
import { vectorStoreService } from '../services/vectorStore.js'
import { successResponse, errorResponse, paginatedResponse, camelizeKeys } from '../utils/transform.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise-workspace-secret-key'

// 文件上传配置
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (_req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
})

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

// GET /api/knowledge
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const { page = 1, pageSize = 10, status } = req.query
    const pageNum = Number(page)
    const size = Number(pageSize)
    const offset = (pageNum - 1) * size

    let sql = 'SELECT id, user_id, name, description, status, document_count, total_tokens, created_at, updated_at FROM knowledge_bases WHERE user_id = ?'
    const params: any[] = [userId]

    if (status) {
      sql += ' AND status = ?'
      params.push(status)
    }

    sql += ` ORDER BY updated_at DESC LIMIT ${size} OFFSET ${offset}`
    const knowledgeBases = await query(sql, params)

    let countSql = 'SELECT COUNT(*) as total FROM knowledge_bases WHERE user_id = ?'
    const countParams: any[] = [userId]
    if (status) {
      countSql += ' AND status = ?'
      countParams.push(status)
    }
    const countResult = await queryOne(countSql, countParams)
    const total = countResult?.total || 0

    res.json(paginatedResponse(knowledgeBases, total, pageNum, size))
  } catch (error) {
    console.error('Get knowledge bases error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// GET /api/knowledge/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const knowledgeBase = await queryOne(
      'SELECT id, user_id, name, description, status, document_count, total_tokens, config, metadata, created_at, updated_at FROM knowledge_bases WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    )

    if (!knowledgeBase) {
      res.status(404).json(errorResponse('知识库不存在'))
      return
    }

    res.json(successResponse(knowledgeBase))
  } catch (error) {
    console.error('Get knowledge base error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// POST /api/knowledge
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const { name, description } = req.body

    if (!name) {
      res.status(400).json(errorResponse('知识库名称不能为空'))
      return
    }

    const knowledgeBaseId = uuidv4()
    await execute(
      'INSERT INTO knowledge_bases (id, user_id, name, description) VALUES (?, ?, ?, ?)',
      [knowledgeBaseId, userId, name, description || '']
    )

    const newKnowledgeBase = await queryOne(
      'SELECT id, user_id, name, description, status, document_count, total_tokens, created_at, updated_at FROM knowledge_bases WHERE id = ?',
      [knowledgeBaseId]
    )

    res.status(201).json(successResponse(newKnowledgeBase))
  } catch (error) {
    console.error('Create knowledge base error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// PUT /api/knowledge/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const { name, description } = req.body

    const existingKB = await queryOne(
      'SELECT id FROM knowledge_bases WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    )

    if (!existingKB) {
      res.status(404).json(errorResponse('知识库不存在'))
      return
    }

    const updates: string[] = []
    const params: any[] = []

    if (name !== undefined) { updates.push('name = ?'); params.push(name) }
    if (description !== undefined) { updates.push('description = ?'); params.push(description) }

    if (updates.length > 0) {
      params.push(req.params.id)
      await execute(`UPDATE knowledge_bases SET ${updates.join(', ')} WHERE id = ?`, params)
    }

    const updatedKB = await queryOne(
      'SELECT id, user_id, name, description, status, document_count, total_tokens, created_at, updated_at FROM knowledge_bases WHERE id = ?',
      [req.params.id]
    )

    res.json(successResponse(updatedKB))
  } catch (error) {
    console.error('Update knowledge base error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// DELETE /api/knowledge/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const existingKB = await queryOne(
      'SELECT id FROM knowledge_bases WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    )

    if (!existingKB) {
      res.status(404).json(errorResponse('知识库不存在'))
      return
    }

    await execute('DELETE FROM knowledge_bases WHERE id = ?', [req.params.id])
    res.json(successResponse(null))
  } catch (error) {
    console.error('Delete knowledge base error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// GET /api/knowledge/:id/documents
router.get('/:id/documents', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const kb = await queryOne(
      'SELECT id FROM knowledge_bases WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    )

    if (!kb) {
      res.status(404).json(errorResponse('知识库不存在'))
      return
    }

    const documents = await query(
      'SELECT id, knowledge_base_id, user_id, name, file_path, file_size, mime_type, status, chunk_count, total_tokens, error_message, metadata, created_at, updated_at FROM documents WHERE knowledge_base_id = ? ORDER BY created_at DESC',
      [req.params.id]
    )

    res.json(successResponse(camelizeKeys(documents)))
  } catch (error) {
    console.error('Get knowledge base documents error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// POST /api/knowledge/:id/documents
router.post('/:id/documents', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const kb = await queryOne(
      'SELECT id FROM knowledge_bases WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    )

    if (!kb) {
      res.status(404).json(errorResponse('知识库不存在'))
      return
    }

    const file = req.file
    if (!file) {
      res.status(400).json(errorResponse('没有上传文件'))
      return
    }

    // 1. 保存文档信息
    const documentId = uuidv4()
    await execute(
      'INSERT INTO documents (id, knowledge_base_id, user_id, name, file_path, file_size, mime_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [documentId, req.params.id, userId, file.originalname, file.path, file.size, file.mimetype, 'processing']
    )

    // 2. 解析文档
    const chunks = await documentProcessor.processFile(file.path, file.mimetype)

    // 3. 保存分块
    for (const chunk of chunks) {
      const chunkId = uuidv4()
      const tokens = documentProcessor.estimateTokens(chunk.content)
      await execute(
        'INSERT INTO document_chunks (id, document_id, content, chunk_index, tokens, metadata) VALUES (?, ?, ?, ?, ?, ?)',
        [chunkId, documentId, chunk.content, chunk.metadata.chunk_index, tokens, JSON.stringify(chunk.metadata)]
      )
    }

    // 4. 向量化
    try {
      await vectorStoreService.addDocument(
        documentId,
        chunks.map(c => c.content),
        chunks.map(c => ({ ...c.metadata, document_id: documentId, knowledge_base_id: req.params.id }))
      )
    } catch (error) {
      console.error('Vector store error:', error)
    }

    // 5. 更新状态
    const totalTokens = chunks.reduce((sum, c) => sum + documentProcessor.estimateTokens(c.content), 0)
    await execute(
      'UPDATE documents SET status = ?, chunk_count = ?, total_tokens = ? WHERE id = ?',
      ['active', chunks.length, totalTokens, documentId]
    )

    // 6. 更新知识库统计
    await execute(
      'UPDATE knowledge_bases SET document_count = document_count + 1, total_tokens = total_tokens + ? WHERE id = ?',
      [totalTokens, req.params.id]
    )

    res.status(201).json(successResponse({
      id: documentId,
      name: file.originalname,
      chunkCount: chunks.length,
      status: 'active'
    }))
  } catch (error: any) {
    console.error('Upload document error:', error)
    res.status(500).json(errorResponse(error.message || '服务器内部错误'))
  }
})

export default router
