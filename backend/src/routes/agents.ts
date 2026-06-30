import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import type { Agent, Message } from '../types/index.js'

const router = Router()

// Mock Agent 数据
const mockAgents: Agent[] = [
  {
    id: 'agent-001',
    name: 'Knowledge Agent',
    description: 'Retrieval-Augmented Generation agent for enterprise knowledge bases.',
    model: 'GPT-4-Enterprise',
    status: 'active',
    capabilities: ['document-retrieval', 'citation', 'summarization'],
    createdBy: 'user-001',
    createdAt: new Date('2024-06-01T10:00:00Z'),
    updatedAt: new Date('2024-06-29T09:00:00Z')
  },
  {
    id: 'agent-002',
    name: 'Code Assistant',
    description: 'AI-powered code review and generation assistant.',
    model: 'Claude-3-Enterprise',
    status: 'active',
    capabilities: ['code-review', 'code-generation', 'refactoring'],
    createdBy: 'user-001',
    createdAt: new Date('2024-05-15T14:00:00Z'),
    updatedAt: new Date('2024-06-28T16:00:00Z')
  }
]

// 生成 AI 回复
function generateAIResponse(userMessage: string, agentName: string): string {
  return `Thank you for your question. Based on the knowledge base, here's what I found:

This is a simulated response from ${agentName}. In production, this would use RAG to provide sourced answers.

Is there anything specific you'd like me to elaborate on?`
}

// GET /api/agents
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10, search } = req.query
  const pageNum = Number(page)
  const size = Number(pageSize)

  let filtered = [...mockAgents]

  if (search) {
    const searchStr = String(search).toLowerCase()
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(searchStr) ||
      a.description.toLowerCase().includes(searchStr)
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

// GET /api/agents/:id
router.get('/:id', (req, res) => {
  const agent = mockAgents.find(a => a.id === req.params.id)
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent not found' })
    return
  }
  res.json({ success: true, data: agent })
})

// POST /api/agents
router.post('/', (req, res) => {
  const { name, description, model, capabilities } = req.body

  const newAgent: Agent = {
    id: `agent-${uuidv4().slice(0, 8)}`,
    name,
    description,
    model,
    capabilities: capabilities || [],
    status: 'active',
    createdBy: 'user-001',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  mockAgents.unshift(newAgent)

  res.status(201).json({ success: true, data: newAgent })
})

// POST /api/agents/:id/chat
router.post('/:id/chat', (req, res) => {
  const agent = mockAgents.find(a => a.id === req.params.id)
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent not found' })
    return
  }

  const { message } = req.body
  if (!message) {
    res.status(400).json({ success: false, error: 'Message is required' })
    return
  }

  const aiMessage: Message = {
    id: `msg-${uuidv4().slice(0, 8)}`,
    sessionId: `session-${uuidv4().slice(0, 8)}`,
    role: 'assistant',
    content: generateAIResponse(message, agent.name),
    confidence: 0.88 + Math.random() * 0.12,
    metadata: {
      model: agent.model,
      tokens: Math.floor(Math.random() * 200) + 50,
      latency: 1.0 + Math.random() * 0.5
    },
    createdAt: new Date()
  }

  res.json({ success: true, data: aiMessage })
})

// PATCH /api/agents/:id
router.patch('/:id', (req, res) => {
  const agent = mockAgents.find(a => a.id === req.params.id)
  if (!agent) {
    res.status(404).json({ success: false, error: 'Agent not found' })
    return
  }

  const { name, description, model, capabilities, status } = req.body
  if (name) agent.name = name
  if (description) agent.description = description
  if (model) agent.model = model
  if (capabilities) agent.capabilities = capabilities
  if (status) agent.status = status
  agent.updatedAt = new Date()

  res.json({ success: true, data: agent })
})

// DELETE /api/agents/:id
router.delete('/:id', (req, res) => {
  const index = mockAgents.findIndex(a => a.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ success: false, error: 'Agent not found' })
    return
  }

  mockAgents.splice(index, 1)

  res.json({ success: true, data: null })
})

export default router
