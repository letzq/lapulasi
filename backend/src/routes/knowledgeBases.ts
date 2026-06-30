import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import type { KnowledgeBase } from '../types/index.js'

const router = Router()

// Mock 知识库数据
const mockKnowledgeBases: KnowledgeBase[] = [
  {
    id: 'kb-001',
    name: 'Corporate Policies',
    description: 'Enterprise policies, guidelines, and compliance documents',
    documentCount: 45,
    lastUpdated: new Date('2024-06-28T16:00:00Z'),
    status: 'active',
    createdBy: 'user-001',
    createdAt: new Date('2024-05-01T10:00:00Z')
  },
  {
    id: 'kb-002',
    name: 'Technical Documentation',
    description: 'Internal technical documentation and API references',
    documentCount: 128,
    lastUpdated: new Date('2024-06-29T10:00:00Z'),
    status: 'active',
    createdBy: 'user-001',
    createdAt: new Date('2024-04-15T09:00:00Z')
  },
  {
    id: 'kb-003',
    name: 'HR Knowledge Base',
    description: 'Human resources policies and employee handbook',
    documentCount: 32,
    lastUpdated: new Date('2024-06-15T12:00:00Z'),
    status: 'indexing',
    createdBy: 'user-001',
    createdAt: new Date('2024-06-01T08:00:00Z')
  }
]

// GET /api/knowledge-bases
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10, search } = req.query
  const pageNum = Number(page)
  const size = Number(pageSize)

  let filtered = [...mockKnowledgeBases]

  if (search) {
    const searchStr = String(search).toLowerCase()
    filtered = filtered.filter(kb =>
      kb.name.toLowerCase().includes(searchStr) ||
      kb.description.toLowerCase().includes(searchStr)
    )
  }

  const start = (pageNum - 1) * size
  const end = start + size
  const items = filtered.slice(start, end)
  const total = filtered.length

  res.json({
    items,
    pagination: {
      page: pageNum,
      pageSize: size,
      total,
      totalPages: Math.ceil(total / size)
    }
  })
})

// GET /api/knowledge-bases/:id
router.get('/:id', (req, res) => {
  const kb = mockKnowledgeBases.find(k => k.id === req.params.id)
  if (!kb) {
    res.status(404).json({ success: false, error: 'Knowledge base not found' })
    return
  }
  res.json({ success: true, data: kb })
})

// POST /api/knowledge-bases
router.post('/', (req, res) => {
  const { name, description } = req.body

  const newKb: KnowledgeBase = {
    id: `kb-${uuidv4().slice(0, 8)}`,
    name,
    description,
    documentCount: 0,
    lastUpdated: new Date(),
    status: 'active',
    createdBy: 'user-001',
    createdAt: new Date()
  }

  mockKnowledgeBases.unshift(newKb)

  res.status(201).json({ success: true, data: newKb })
})

// POST /api/knowledge-bases/:id/documents
router.post('/:id/documents', (req, res) => {
  const kb = mockKnowledgeBases.find(k => k.id === req.params.id)
  if (!kb) {
    res.status(404).json({ success: false, error: 'Knowledge base not found' })
    return
  }

  // 模拟文档上传
  const { files } = req.body
  const fileCount = Array.isArray(files) ? files.length : 1

  kb.documentCount += fileCount
  kb.lastUpdated = new Date()
  kb.status = 'indexing'

  // 模拟索引完成
  setTimeout(() => {
    kb.status = 'active'
  }, 5000)

  res.json({
    success: true,
    data: {
      uploaded: fileCount,
      message: 'Documents uploaded successfully. Indexing in progress.'
    }
  })
})

// PATCH /api/knowledge-bases/:id
router.patch('/:id', (req, res) => {
  const kb = mockKnowledgeBases.find(k => k.id === req.params.id)
  if (!kb) {
    res.status(404).json({ success: false, error: 'Knowledge base not found' })
    return
  }

  const { name, description } = req.body
  if (name) kb.name = name
  if (description) kb.description = description
  kb.lastUpdated = new Date()

  res.json({ success: true, data: kb })
})

// DELETE /api/knowledge-bases/:id
router.delete('/:id', (req, res) => {
  const index = mockKnowledgeBases.findIndex(k => k.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ success: false, error: 'Knowledge base not found' })
    return
  }

  mockKnowledgeBases.splice(index, 1)

  res.json({ success: true, data: null })
})

export default router
