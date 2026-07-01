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

/**
 * 修复 multer 中文文件名编码问题
 */
function fixFilename(originalname: string): string {
  try {
    const decoded = Buffer.from(originalname, 'latin1').toString('utf8')
    if (/[一-鿿]/.test(decoded)) return decoded
    return originalname
  } catch {
    return originalname
  }
}

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
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

// GET /api/assets
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const { page = 1, pageSize = 10, type, status, search } = req.query
    const pageNum = parseInt(page as string) || 1
    const size = parseInt(pageSize as string) || 10
    const offset = (pageNum - 1) * size

    let sql = 'SELECT id, user_id, name, type, status, description, file_path, file_size, mime_type, created_at, updated_at FROM assets WHERE user_id = ?'
    const params: any[] = [userId]

    if (type) {
      sql += ' AND type = ?'
      params.push(type)
    }

    if (status) {
      sql += ' AND status = ?'
      params.push(status)
    }

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    sql += ` ORDER BY updated_at DESC LIMIT ${size} OFFSET ${offset}`

    const assets = await query(sql, params)

    // 获取总数
    let countSql = 'SELECT COUNT(*) as total FROM assets WHERE user_id = ?'
    const countParams: any[] = [userId]
    if (type) {
      countSql += ' AND type = ?'
      countParams.push(type)
    }
    if (status) {
      countSql += ' AND status = ?'
      countParams.push(status)
    }
    if (search) {
      countSql += ' AND (name LIKE ? OR description LIKE ?)'
      countParams.push(`%${search}%`, `%${search}%`)
    }
    const countResult = await queryOne(countSql, countParams)
    const total = countResult?.total || 0

    res.json(paginatedResponse(assets, total, pageNum, size))
  } catch (error) {
    console.error('Get assets error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// GET /api/assets/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const asset = await queryOne(
      'SELECT id, user_id, name, type, status, description, file_path, file_size, mime_type, metadata, created_at, updated_at FROM assets WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    )

    if (!asset) {
      res.status(404).json(errorResponse('资产不存在'))
      return
    }

    res.json(successResponse(asset))
  } catch (error) {
    console.error('Get asset error:', error)
    res.status(500).json({ success: false, error: '服务器内部错误' })
  }
})

// POST /api/assets
router.post('/', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const { name, type, description, knowledge_base_id } = req.body

    if (!name || !type) {
      res.status(400).json(errorResponse('名称和类型不能为空'))
      return
    }

    // 验证类型
    const validTypes = ['document', 'dataset', 'model', 'agent']
    if (!validTypes.includes(type)) {
      res.status(400).json(errorResponse('无效的资产类型'))
      return
    }

    const assetId = uuidv4()
    let filePath = null
    let fileSize = null
    let mimeType = null
    let chunkCount = 0
    const fixedName = fixFilename(name || req.file?.originalname || 'unknown')

    // 如果有文件上传
    if (req.file) {
      filePath = req.file.path
      fileSize = req.file.size
      mimeType = req.file.mimetype

      // 如果是文档类型，进行文档处理
      if (type === 'document') {
        try {
          // 1. 解析文档
          const chunks = await documentProcessor.processFile(req.file.path, req.file.mimetype)
          chunkCount = chunks.length

          // 2. 如果指定了知识库，创建文档记录并保存切片
          if (knowledge_base_id && chunks.length > 0) {
            const documentId = uuidv4()

            // 创建文档记录
            await execute(
              'INSERT INTO documents (id, knowledge_base_id, user_id, name, file_path, file_size, mime_type, status, chunk_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [documentId, knowledge_base_id, userId, name, req.file.path, req.file.size, req.file.mimetype, 'active', chunkCount]
            )

            // 保存分块到数据库
            for (const chunk of chunks) {
              const chunkId = uuidv4()
              const tokens = documentProcessor.estimateTokens(chunk.content)
              await execute(
                'INSERT INTO document_chunks (id, document_id, content, chunk_index, tokens, metadata) VALUES (?, ?, ?, ?, ?, ?)',
                [chunkId, documentId, chunk.content, chunk.metadata.chunk_index, tokens, JSON.stringify(chunk.metadata)]
              )
            }

            // 向量化并存储到 ChromaDB
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
            }

            // 更新知识库文档数量
            await execute(
              'UPDATE knowledge_bases SET document_count = document_count + 1 WHERE id = ?',
              [knowledge_base_id]
            )
          }
        } catch (error) {
          console.error('Document processing error:', error)
          // 文档处理失败不影响资产创建
        }
      }
    }

    await execute(
      'INSERT INTO assets (id, user_id, name, type, status, description, file_path, file_size, mime_type, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [assetId, userId, fixedName, type, 'active', description || null, filePath, fileSize, mimeType, chunkCount > 0 ? JSON.stringify({ chunkCount, knowledge_base_id }) : null]
    )

    const newAsset = await queryOne(
      'SELECT id, user_id, name, type, status, description, file_path, file_size, mime_type, metadata, created_at, updated_at FROM assets WHERE id = ?',
      [assetId]
    )

    res.status(201).json(successResponse({ ...newAsset, chunkCount }))
  } catch (error) {
    console.error('Create asset error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// PUT /api/assets/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const { name, description, status } = req.body

    // 检查资产是否存在
    const existingAsset = await queryOne(
      'SELECT id FROM assets WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    )

    if (!existingAsset) {
      res.status(404).json(errorResponse('资产不存在'))
      return
    }

    // 构建更新语句
    const updates: string[] = []
    const params: any[] = []

    if (name !== undefined) {
      updates.push('name = ?')
      params.push(name)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      params.push(description)
    }
    if (status !== undefined) {
      updates.push('status = ?')
      params.push(status)
    }

    if (updates.length > 0) {
      params.push(req.params.id)
      await execute(
        `UPDATE assets SET ${updates.join(', ')} WHERE id = ?`,
        params
      )
    }

    const updatedAsset = await queryOne(
      'SELECT id, user_id, name, type, status, description, file_path, file_size, mime_type, created_at, updated_at FROM assets WHERE id = ?',
      [req.params.id]
    )

    res.json(successResponse(updatedAsset))
  } catch (error) {
    console.error('Update asset error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// DELETE /api/assets/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const existingAsset = await queryOne(
      'SELECT id FROM assets WHERE id = ? AND user_id = ?',
      [req.params.id, userId]
    )

    if (!existingAsset) {
      res.status(404).json(errorResponse('资产不存在'))
      return
    }

    await execute('DELETE FROM assets WHERE id = ?', [req.params.id])
    res.json(successResponse(null))
  } catch (error) {
    console.error('Delete asset error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// POST /api/assets/upload — 带进度反馈的上传（SSE）
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const userId = getCurrentUserId(req)
    if (!userId) {
      res.status(401).json(errorResponse('未授权'))
      return
    }

    const { name, type, description, knowledge_base_id } = req.body
    const file = req.file

    if (!name || !type) {
      res.status(400).json(errorResponse('名称和类型不能为空'))
      return
    }

    if (!file) {
      res.status(400).json(errorResponse('没有上传文件'))
      return
    }

    // 设置 SSE 头
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const sendProgress = (step: string, progress: number, detail?: string) => {
      res.write(`data: ${JSON.stringify({ step, progress, detail })}\n\n`)
    }

    const assetId = uuidv4()
    let chunkCount = 0

    try {
      // 步骤 1: 保存资产记录
      sendProgress('saving', 10, '保存资产信息...')
      const fixedNameSSE = fixFilename(file.originalname)
      await execute(
        'INSERT INTO assets (id, user_id, name, type, status, description, file_path, file_size, mime_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [assetId, userId, fixedNameSSE, type, 'active', description || null, file.path, file.size, file.mimetype]
      )

      // 步骤 2: 解析文档
      sendProgress('parsing', 30, '解析文档内容...')
      const chunks = await documentProcessor.processFile(file.path, file.mimetype)
      chunkCount = chunks.length
      sendProgress('parsing', 50, `解析完成: ${chunkCount} 个片段`)

      // 步骤 3: 保存切片到数据库
      if (type === 'document' && knowledge_base_id && chunks.length > 0) {
        sendProgress('chunking', 60, '保存切片到数据库...')
        const documentId = uuidv4()

        await execute(
          'INSERT INTO documents (id, knowledge_base_id, user_id, name, file_path, file_size, mime_type, status, chunk_count, total_tokens) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [documentId, knowledge_base_id, userId, name, file.path, file.size, file.mimetype, 'active', chunkCount, chunks.reduce((s, c) => s + documentProcessor.estimateTokens(c.content), 0)]
        )

        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i]
          const chunkId = uuidv4()
          const tokens = documentProcessor.estimateTokens(chunk.content)
          await execute(
            'INSERT INTO document_chunks (id, document_id, content, chunk_index, tokens, metadata) VALUES (?, ?, ?, ?, ?, ?)',
            [chunkId, documentId, chunk.content, chunk.metadata.chunk_index, tokens, JSON.stringify(chunk.metadata)]
          )
          // 每 10 个 chunk 报一次进度
          if ((i + 1) % 10 === 0 || i === chunks.length - 1) {
            const pct = 60 + Math.round(((i + 1) / chunks.length) * 20)
            sendProgress('chunking', pct, `已保存 ${i + 1}/${chunks.length} 个片段`)
          }
        }

        // 步骤 4: 向量化
        sendProgress('vectorizing', 85, '向量化中...')
        try {
          await vectorStoreService.addDocument(
            documentId,
            chunks.map(c => c.content),
            chunks.map(c => ({ ...c.metadata, document_id: documentId, knowledge_base_id }))
          )
        } catch (e: any) {
          console.error('[Assets] Vector store error:', e.message)
        }

        // 更新知识库统计
        await execute('UPDATE knowledge_bases SET document_count = document_count + 1 WHERE id = ?', [knowledge_base_id])

        // 更新资产 metadata
        await execute('UPDATE assets SET metadata = ? WHERE id = ?', [JSON.stringify({ chunkCount, documentId, knowledge_base_id }), assetId])
      } else if (type === 'document' && chunks.length > 0) {
        // 没有指定知识库，只更新 metadata
        await execute('UPDATE assets SET metadata = ? WHERE id = ?', [JSON.stringify({ chunkCount }), assetId])
      }

      // 完成
      sendProgress('done', 100, `处理完成: ${chunkCount} 个片段`)
      res.write(`data: ${JSON.stringify({ step: 'complete', assetId, chunkCount })}\n\n`)
      res.end()

    } catch (e: any) {
      sendProgress('error', 0, e.message)
      res.end()
    }

  } catch (error: any) {
    console.error('Upload error:', error)
    if (!res.headersSent) {
      res.status(500).json(errorResponse(error.message || '服务器内部错误'))
    }
  }
})

export default router
