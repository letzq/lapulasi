import type { User, Session, Message, Asset, Agent, KnowledgeBase } from '@/types'

export const mockUser: User = {
  id: 'user-001', name: '张三', email: 'zhangsan@enterprise.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan', role: 'admin'
}

export const mockSessions: Session[] = [
  { id: 'session-001', model: 'GPT-4-Enterprise', latency: 1.2, tokens: 428, createdAt: '2024-06-29T10:00:00Z', status: 'active' },
  { id: 'session-002', model: 'GPT-4-Enterprise', latency: 0.8, tokens: 156, createdAt: '2024-06-29T09:30:00Z', status: 'completed' }
]

export const mockMessages: Record<string, Message[]> = {
  'session-001': [
    { id: 'msg-001', sessionId: 'session-001', role: 'user', content: 'Can you summarize the Q3 infrastructure compliance requirements and provide the specific sources you referenced? We need this for the upcoming audit.', timestamp: '2024-06-29T10:40:00Z' },
    { id: 'msg-002', sessionId: 'session-001', role: 'assistant', content: 'Based on the provided corporate policies, the Q3 infrastructure compliance audit focuses on three main pillars:\n\n1. **Data Encryption in Transit:** All internal APIs must mandate TLS 1.3 by end of September. Legacy systems relying on TLS 1.2 will be flagged as critical vulnerabilities.\n\n2. **Access Control Logging:** System audit logs must be retained in immutability storage for a minimum of 365 days. Currently, the default retention for the EU cluster is 90 days.\n\n3. **Vulnerability Patch SLAs:** Critical CVEs must be remediated within 72 hours of disclosure, an update from the previous 5-day window.\n\nPlease note that the EU cluster requires immediate attention to meet the new retention policy.', timestamp: '2024-06-29T10:42:00Z', confidence: 0.94, sources: [{ id: 'src-001', title: 'Corporate Security Policy v2.3', content: 'Section 4.2: Data Encryption Standards', relevance: 0.98 }, { id: 'src-002', title: 'Infrastructure Compliance Guidelines Q3', content: 'Retention policy requirements', relevance: 0.92 }, { id: 'src-003', title: 'Vulnerability Management Framework', content: 'SLA definitions and escalation procedures', relevance: 0.89 }], metadata: { model: 'GPT-4-Enterprise', tokens: 285, latency: 1.2 } }
  ]
}

export const mockAssets: Asset[] = [
  { id: 'asset-001', name: 'Corporate Security Policy', type: 'document', status: 'active', createdAt: '2024-06-01T10:00:00Z', updatedAt: '2024-06-15T14:30:00Z', size: 2048576, description: 'Enterprise security policy document v2.3' },
  { id: 'asset-002', name: 'Customer Database', type: 'dataset', status: 'active', createdAt: '2024-05-15T08:00:00Z', updatedAt: '2024-06-28T16:00:00Z', size: 104857600, description: 'Production customer data snapshot' },
  { id: 'asset-003', name: 'GPT-4 Enterprise', type: 'model', status: 'active', createdAt: '2024-04-01T12:00:00Z', updatedAt: '2024-06-25T10:00:00Z', description: 'Enterprise-grade GPT-4 model deployment' },
  { id: 'asset-004', name: 'Knowledge Agent', type: 'agent', status: 'active', createdAt: '2024-06-01T10:00:00Z', updatedAt: '2024-06-29T09:00:00Z', description: 'RAG-based knowledge retrieval agent' }
]

export const mockAgents: Agent[] = [
  { id: 'agent-001', name: 'Knowledge Agent', description: 'Retrieval-Augmented Generation agent for enterprise knowledge bases.', model: 'GPT-4-Enterprise', status: 'active', capabilities: ['document-retrieval', 'citation', 'summarization'], createdAt: '2024-06-01T10:00:00Z' },
  { id: 'agent-002', name: 'Code Assistant', description: 'AI-powered code review and generation assistant.', model: 'Claude-3-Enterprise', status: 'active', capabilities: ['code-review', 'code-generation', 'refactoring'], createdAt: '2024-05-15T14:00:00Z' }
]

export const mockKnowledgeBases: KnowledgeBase[] = [
  { id: 'kb-001', name: 'Corporate Policies', description: 'Enterprise policies, guidelines, and compliance documents', documentCount: 45, lastUpdated: '2024-06-28T16:00:00Z', status: 'active' },
  { id: 'kb-002', name: 'Technical Documentation', description: 'Internal technical documentation and API references', documentCount: 128, lastUpdated: '2024-06-29T10:00:00Z', status: 'active' },
  { id: 'kb-003', name: 'HR Knowledge Base', description: 'Human resources policies and employee handbook', documentCount: 32, lastUpdated: '2024-06-15T12:00:00Z', status: 'indexing' }
]
