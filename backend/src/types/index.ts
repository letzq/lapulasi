// 用户类型
export interface User {
  id: string
  name: string
  email: string
  password?: string
  avatar?: string
  role: 'admin' | 'user' | 'viewer'
  createdAt: Date
  updatedAt: Date
}

// 会话类型
export interface Session {
  id: string
  userId: string
  model: string
  title?: string
  latency: number
  tokens: number
  status: 'active' | 'completed' | 'failed'
  createdAt: Date
  updatedAt: Date
}

// 消息类型
export interface Message {
  id: string
  sessionId: string
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
  confidence?: number
  metadata?: MessageMetadata
  createdAt: Date
}

// 来源类型
export interface Source {
  id: string
  title: string
  url?: string
  content: string
  relevance: number
}

// 消息元数据
export interface MessageMetadata {
  model?: string
  tokens?: number
  latency?: number
}

// 资产类型
export interface Asset {
  id: string
  name: string
  type: 'document' | 'dataset' | 'model' | 'agent'
  status: 'active' | 'inactive' | 'processing'
  description?: string
  size?: number
  filePath?: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Agent 类型
export interface Agent {
  id: string
  name: string
  description: string
  model: string
  status: 'active' | 'inactive' | 'training'
  capabilities: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// 知识库类型
export interface KnowledgeBase {
  id: string
  name: string
  description: string
  documentCount: number
  lastUpdated: Date
  status: 'active' | 'indexing' | 'error'
  createdBy: string
  createdAt: Date
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

// 分页
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[]
  pagination: Pagination
}

// 请求类型
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface CreateSessionRequest {
  model?: string
  title?: string
}

export interface SendMessageRequest {
  content: string
}

export interface CreateAssetRequest {
  name: string
  type: Asset['type']
  description?: string
}

export interface CreateAgentRequest {
  name: string
  description: string
  model: string
  capabilities: string[]
}

export interface CreateKnowledgeBaseRequest {
  name: string
  description: string
}

export interface PaginationQuery {
  page?: number
  pageSize?: number
}

export interface SearchQuery extends PaginationQuery {
  search?: string
}
