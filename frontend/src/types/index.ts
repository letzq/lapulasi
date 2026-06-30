/**
 * 前端类型定义（与后端 camelCase 响应对齐）
 */

// =====================================================
// 核心实体类型
// =====================================================

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'viewer'
  isActive?: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt?: string
}

export interface Session {
  id: string
  userId: string
  title?: string
  model: string
  status: 'active' | 'completed' | 'failed'
  totalTokens: number
  avgLatency: number | string
  metadata?: Record<string, any>
  messageCount?: number
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens?: number
  latency?: number | string
  confidence?: number | string
  sources?: Source[]
  metadata?: Record<string, any>
  createdAt: string
}

export interface Source {
  id?: string
  documentId?: string
  documentName?: string
  title?: string
  content?: string
  url?: string
  chunkContent?: string
  relevance: number
}

export interface KnowledgeBase {
  id: string
  userId: string
  name: string
  description?: string
  status: 'active' | 'indexing' | 'error'
  documentCount: number
  totalTokens: number
  config?: Record<string, any>
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  knowledgeBaseId: string
  userId: string
  name: string
  filePath?: string
  fileSize?: number
  mimeType?: string
  status: 'active' | 'processing' | 'error'
  chunkCount: number
  totalTokens: number
  errorMessage?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Asset {
  id: string
  userId: string
  name: string
  type: 'document' | 'dataset' | 'model' | 'agent'
  status: 'active' | 'inactive' | 'processing' | 'error'
  description?: string
  filePath?: string
  fileSize?: number
  mimeType?: string
  metadata?: Record<string, any>
  chunkCount?: number
  createdAt: string
  updatedAt: string
}

export interface Agent {
  id: string
  userId: string
  name: string
  description?: string
  model: string
  status: 'active' | 'inactive' | 'training' | 'error'
  systemPrompt?: string
  capabilities?: string[]
  config?: Record<string, any>
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

// =====================================================
// API 通用类型
// =====================================================

export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: Pagination
}

// =====================================================
// 菜单/导航
// =====================================================

export interface MenuItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
}

// =====================================================
// 消息元数据
// =====================================================

export interface MessageMetadata {
  model?: string
  tokens?: number
  latency?: number
  sources?: Source[]
}
