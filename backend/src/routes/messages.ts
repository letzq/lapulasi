import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import type { Message } from '../types/index.js'

const router = Router()

// Mock 消息数据
const mockMessages: Record<string, Message[]> = {
  'session-001': [
    {
      id: 'msg-001',
      sessionId: 'session-001',
      role: 'user',
      content: 'Can you summarize the Q3 infrastructure compliance requirements and provide the specific sources you referenced? We need this for the upcoming audit.',
      createdAt: new Date('2024-06-29T10:40:00Z')
    },
    {
      id: 'msg-002',
      sessionId: 'session-001',
      role: 'assistant',
      content: `Based on the provided corporate policies, the Q3 infrastructure compliance audit focuses on three main pillars:

1. **Data Encryption in Transit:** All internal APIs must mandate TLS 1.3 by end of September. Legacy systems relying on TLS 1.2 will be flagged as critical vulnerabilities.

2. **Access Control Logging:** System audit logs must be retained in immutability storage for a minimum of 365 days. Currently, the default retention for the EU cluster is 90 days.

3. **Vulnerability Patch SLAs:** Critical CVEs must be remediated within 72 hours of disclosure, an update from the previous 5-day window.

Please note that the EU cluster requires immediate attention to meet the new retention policy.`,
      confidence: 0.94,
      sources: [
        {
          id: 'src-001',
          title: 'Corporate Security Policy v2.3',
          content: 'Section 4.2: Data Encryption Standards',
          relevance: 0.98
        },
        {
          id: 'src-002',
          title: 'Infrastructure Compliance Guidelines Q3',
          content: 'Retention policy requirements',
          relevance: 0.92
        },
        {
          id: 'src-003',
          title: 'Vulnerability Management Framework',
          content: 'SLA definitions and escalation procedures',
          relevance: 0.89
        }
      ],
      metadata: {
        model: 'GPT-4-Enterprise',
        tokens: 285,
        latency: 1.2
      },
      createdAt: new Date('2024-06-29T10:42:00Z')
    }
  ],
  'session-002': [
    {
      id: 'msg-003',
      sessionId: 'session-002',
      role: 'user',
      content: 'What are the current API rate limits for our production environment?',
      createdAt: new Date('2024-06-29T09:30:00Z')
    },
    {
      id: 'msg-004',
      sessionId: 'session-002',
      role: 'assistant',
      content: 'The current API rate limits for production are:\n\n- **Standard APIs:** 1,000 requests/minute\n- **Premium APIs:** 5,000 requests/minute\n- **Batch APIs:** 100 requests/minute\n\nThese limits can be adjusted by contacting the platform team.',
      confidence: 0.96,
      metadata: {
        model: 'GPT-4-Enterprise',
        tokens: 95,
        latency: 0.8
      },
      createdAt: new Date('2024-06-29T09:30:30Z')
    }
  ]
}

// 生成 AI 回复
function generateAIResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()

  if (lowerMessage.includes('compliance') || lowerMessage.includes('audit')) {
    return `Based on the provided corporate policies, the Q3 infrastructure compliance audit focuses on three main pillars:

1. **Data Encryption in Transit:** All internal APIs must mandate TLS 1.3 by end of September.

2. **Access Control Logging:** System audit logs must be retained for a minimum of 365 days.

3. **Vulnerability Patch SLAs:** Critical CVEs must be remediated within 72 hours of disclosure.

Please note that the EU cluster requires immediate attention.`
  }

  if (lowerMessage.includes('api') || lowerMessage.includes('rate limit')) {
    return `Here are the current API rate limits:

- **Standard APIs:** 1,000 requests/minute
- **Premium APIs:** 5,000 requests/minute
- **Batch APIs:** 100 requests/minute

Contact the platform team for higher limits.`
  }

  return `Thank you for your question. Based on the knowledge base, here's what I found:

This is a simulated response from the Knowledge Agent. In production, this would use RAG to provide sourced answers from your documents.

Is there anything specific you'd like me to elaborate on?`
}

// GET /api/sessions/:sessionId/messages
router.get('/:sessionId/messages', (req, res) => {
  const { sessionId } = req.params
  const { page = 1, pageSize = 50 } = req.query

  const messages = mockMessages[sessionId] || []
  const pageNum = Number(page)
  const size = Number(pageSize)
  const start = (pageNum - 1) * size
  const end = start + size

  const items = messages.slice(start, end)
  const total = messages.length

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

// POST /api/sessions/:sessionId/messages
router.post('/:sessionId/messages', (req, res) => {
  const { sessionId } = req.params
  const { content } = req.body

  if (!content || !content.trim()) {
    res.status(400).json({ success: false, error: 'Content is required' })
    return
  }

  // 添加用户消息
  const userMessage: Message = {
    id: `msg-${uuidv4().slice(0, 8)}`,
    sessionId,
    role: 'user',
    content: content.trim(),
    createdAt: new Date()
  }

  if (!mockMessages[sessionId]) {
    mockMessages[sessionId] = []
  }
  mockMessages[sessionId].push(userMessage)

  // 生成 AI 回复
  const aiMessage: Message = {
    id: `msg-${uuidv4().slice(0, 8)}`,
    sessionId,
    role: 'assistant',
    content: generateAIResponse(content),
    confidence: 0.85 + Math.random() * 0.15,
    sources: [
      {
        id: `src-${uuidv4().slice(0, 8)}`,
        title: 'Corporate Policy Document',
        content: 'Relevant section from policy',
        relevance: 0.9 + Math.random() * 0.1
      }
    ],
    metadata: {
      model: 'GPT-4-Enterprise',
      tokens: Math.floor(Math.random() * 200) + 50,
      latency: 0.8 + Math.random() * 0.5
    },
    createdAt: new Date()
  }

  mockMessages[sessionId].push(aiMessage)

  res.status(201).json({ success: true, data: aiMessage })
})

// POST /api/sessions/:sessionId/messages/:messageId/regenerate
router.post('/:sessionId/messages/:messageId/regenerate', (req, res) => {
  const { sessionId, messageId } = req.params

  const messages = mockMessages[sessionId]
  if (!messages) {
    res.status(404).json({ success: false, error: 'Session not found' })
    return
  }

  const messageIndex = messages.findIndex(m => m.id === messageId)
  if (messageIndex === -1) {
    res.status(404).json({ success: false, error: 'Message not found' })
    return
  }

  // 找到对应的用户消息
  let userMessageContent = ''
  for (let i = messageIndex - 1; i >= 0; i--) {
    if (messages[i].role === 'user') {
      userMessageContent = messages[i].content
      break
    }
  }

  // 删除旧的 AI 回复并生成新的
  messages.splice(messageIndex, 1)

  const newAiMessage: Message = {
    id: `msg-${uuidv4().slice(0, 8)}`,
    sessionId,
    role: 'assistant',
    content: generateAIResponse(userMessageContent),
    confidence: 0.85 + Math.random() * 0.15,
    sources: [
      {
        id: `src-${uuidv4().slice(0, 8)}`,
        title: 'Updated Policy Document',
        content: 'Refreshed relevant section',
        relevance: 0.9 + Math.random() * 0.1
      }
    ],
    metadata: {
      model: 'GPT-4-Enterprise',
      tokens: Math.floor(Math.random() * 200) + 50,
      latency: 0.8 + Math.random() * 0.5
    },
    createdAt: new Date()
  }

  messages.push(newAiMessage)

  res.json({ success: true, data: newAiMessage })
})

// DELETE /api/sessions/:sessionId/messages/:messageId
router.delete('/:sessionId/messages/:messageId', (req, res) => {
  const { sessionId, messageId } = req.params

  const messages = mockMessages[sessionId]
  if (!messages) {
    res.status(404).json({ success: false, error: 'Session not found' })
    return
  }

  const index = messages.findIndex(m => m.id === messageId)
  if (index === -1) {
    res.status(404).json({ success: false, error: 'Message not found' })
    return
  }

  messages.splice(index, 1)

  res.json({ success: true, data: null })
})

export default router
