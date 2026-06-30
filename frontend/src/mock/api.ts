import type { User, Session, Message, Asset, Agent, KnowledgeBase } from '@/types'
import { mockUser, mockSessions, mockMessages, mockAssets, mockAgents, mockKnowledgeBases } from './data'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
function generateId(): string { return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }

function generateAIResponse(content: string): string {
  const lower = content.toLowerCase()
  if (lower.includes('compliance') || lower.includes('audit')) {
    return `Based on the provided corporate policies, the Q3 infrastructure compliance audit focuses on three main pillars:\n\n1. **Data Encryption in Transit:** All internal APIs must mandate TLS 1.3 by end of September.\n\n2. **Access Control Logging:** System audit logs must be retained for a minimum of 365 days.\n\n3. **Vulnerability Patch SLAs:** Critical CVEs must be remediated within 72 hours of disclosure.`
  }
  if (lower.includes('api') || lower.includes('rate limit')) {
    return `Current API rate limits:\n\n- **Standard APIs:** 1,000 requests/minute\n- **Premium APIs:** 5,000 requests/minute\n- **Batch APIs:** 100 requests/minute`
  }
  return `Thank you for your question. Based on the knowledge base:\n\nThis is a simulated response. In production, this would use RAG to provide sourced answers.\n\nIs there anything specific you'd like me to elaborate on?`
}

export const mockApi = {
  auth: {
    login: async (email: string, _password: string) => {
      await delay(300)
      if (email === mockUser.email) return { success: true, data: { user: mockUser, token: 'mock-token-' + Date.now() } }
      return { success: false, data: { user: null, token: '' }, error: 'Invalid credentials' }
    },
    getProfile: async () => { await delay(200); return { success: true, data: mockUser } }
  },
  sessions: {
    getAll: async () => { await delay(300); return { items: mockSessions, pagination: { page: 1, pageSize: 10, total: mockSessions.length, totalPages: 1 } } },
    create: async (model?: string) => {
      await delay(300)
      const s: Session = { id: generateId(), model: model || 'GPT-4-Enterprise', latency: 0, tokens: 0, createdAt: new Date().toISOString(), status: 'active' }
      mockSessions.unshift(s)
      return { success: true, data: s }
    },
    delete: async (id: string) => { await delay(200); const i = mockSessions.findIndex(s => s.id === id); if (i !== -1) mockSessions.splice(i, 1); return { success: true, data: null } }
  },
  messages: {
    getBySession: async (sessionId: string) => { await delay(300); return { items: mockMessages[sessionId] || [], pagination: { page: 1, pageSize: 50, total: (mockMessages[sessionId] || []).length, totalPages: 1 } } },
    send: async (sessionId: string, content: string) => {
      await delay(800)
      if (!mockMessages[sessionId]) mockMessages[sessionId] = []
      const aiMsg: Message = { id: generateId(), sessionId, role: 'assistant', content: generateAIResponse(content), timestamp: new Date().toISOString(), confidence: 0.85 + Math.random() * 0.15, sources: [{ id: 'src-' + generateId(), title: 'Corporate Policy', content: 'Relevant section', relevance: 0.9 }], metadata: { model: 'GPT-4-Enterprise', tokens: Math.floor(Math.random() * 200) + 50, latency: 0.8 + Math.random() * 0.5 } }
      mockMessages[sessionId].push(aiMsg)
      return { success: true, data: aiMsg }
    },
    regenerate: async (sessionId: string, messageId: string) => {
      await delay(800)
      const msgs = mockMessages[sessionId]
      if (!msgs) return { success: false, data: null, error: 'Not found' }
      const i = msgs.findIndex(m => m.id === messageId)
      if (i === -1) return { success: false, data: null, error: 'Not found' }
      let userContent = ''
      for (let j = i - 1; j >= 0; j--) { if (msgs[j].role === 'user') { userContent = msgs[j].content; break } }
      msgs.splice(i, 1)
      const newMsg: Message = { id: generateId(), sessionId, role: 'assistant', content: generateAIResponse(userContent), timestamp: new Date().toISOString(), confidence: 0.85 + Math.random() * 0.15, metadata: { model: 'GPT-4-Enterprise', tokens: Math.floor(Math.random() * 200) + 50, latency: 0.8 + Math.random() * 0.5 } }
      msgs.push(newMsg)
      return { success: true, data: newMsg }
    }
  },
  assets: {
    getAll: async () => { await delay(300); return { items: mockAssets, pagination: { page: 1, pageSize: 10, total: mockAssets.length, totalPages: 1 } } },
    delete: async (id: string) => { await delay(200); const i = mockAssets.findIndex(a => a.id === id); if (i !== -1) mockAssets.splice(i, 1); return { success: true, data: null } }
  },
  agents: {
    getAll: async () => { await delay(300); return { items: mockAgents, pagination: { page: 1, pageSize: 10, total: mockAgents.length, totalPages: 1 } } }
  },
  knowledgeBases: {
    getAll: async () => { await delay(300); return { items: mockKnowledgeBases, pagination: { page: 1, pageSize: 10, total: mockKnowledgeBases.length, totalPages: 1 } } }
  },
  analytics: {
    getOverview: async () => { await delay(300); return { success: true, data: { totalSessions: 1256, totalMessages: 4892, averageLatency: 1.1, averageConfidence: 0.92, activeUsers: 89, topModels: [{ model: 'GPT-4-Enterprise', usage: 756 }, { model: 'Claude-3-Enterprise', usage: 500 }] } } },
    getUsage: async () => { await delay(300); return { success: true, data: { daily: [{ date: '2024-06-23', sessions: 145, messages: 567 }, { date: '2024-06-24', sessions: 189, messages: 723 }, { date: '2024-06-25', sessions: 167, messages: 645 }, { date: '2024-06-26', sessions: 201, messages: 789 }, { date: '2024-06-27', sessions: 178, messages: 698 }, { date: '2024-06-28', sessions: 156, messages: 612 }, { date: '2024-06-29', sessions: 67, messages: 258 }] } } }
  }
}

export default mockApi
