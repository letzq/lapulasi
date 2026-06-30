import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import type { Session } from '../types/index.js'

const router = Router()

// Mock 会话数据
const mockSessions: Session[] = [
  {
    id: 'session-001',
    userId: 'user-001',
    model: 'GPT-4-Enterprise',
    title: 'Q3 Compliance Discussion',
    latency: 1.2,
    tokens: 428,
    status: 'active',
    createdAt: new Date('2024-06-29T10:00:00Z'),
    updatedAt: new Date('2024-06-29T10:42:00Z')
  },
  {
    id: 'session-002',
    userId: 'user-001',
    model: 'GPT-4-Enterprise',
    title: 'API Rate Limits Query',
    latency: 0.8,
    tokens: 156,
    status: 'completed',
    createdAt: new Date('2024-06-29T09:30:00Z'),
    updatedAt: new Date('2024-06-29T09:31:00Z')
  }
]

// GET /api/sessions
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10 } = req.query
  const pageNum = Number(page)
  const size = Number(pageSize)

  const start = (pageNum - 1) * size
  const end = start + size
  const items = mockSessions.slice(start, end)
  const total = mockSessions.length

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

// GET /api/sessions/:id
router.get('/:id', (req, res) => {
  const session = mockSessions.find(s => s.id === req.params.id)
  if (!session) {
    res.status(404).json({ success: false, error: 'Session not found' })
    return
  }
  res.json({ success: true, data: session })
})

// POST /api/sessions
router.post('/', (req, res) => {
  const { model = 'GPT-4-Enterprise', title } = req.body

  const newSession: Session = {
    id: `session-${uuidv4().slice(0, 8)}`,
    userId: 'user-001',
    model,
    title,
    latency: 0,
    tokens: 0,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  mockSessions.unshift(newSession)

  res.status(201).json({ success: true, data: newSession })
})

// PATCH /api/sessions/:id
router.patch('/:id', (req, res) => {
  const session = mockSessions.find(s => s.id === req.params.id)
  if (!session) {
    res.status(404).json({ success: false, error: 'Session not found' })
    return
  }

  const { model, title } = req.body
  if (model) session.model = model
  if (title) session.title = title
  session.updatedAt = new Date()

  res.json({ success: true, data: session })
})

// DELETE /api/sessions/:id
router.delete('/:id', (req, res) => {
  const index = mockSessions.findIndex(s => s.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ success: false, error: 'Session not found' })
    return
  }

  mockSessions.splice(index, 1)

  res.json({ success: true, data: null })
})

export default router
