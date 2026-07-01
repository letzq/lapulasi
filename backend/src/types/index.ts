/**
 * 类型定义模块
 * 定义所有数据库实体和 API 类型
 */

// =====================================================
// 数据库实体类型
// =====================================================

/**
 * 用户
 */
export interface User {
  id: string
  name: string
  email: string
  password_hash?: string
  avatar?: string
  role: 'admin' | 'user' | 'viewer'
  is_active: boolean
  last_login_at?: Date
  created_at: Date
  updated_at: Date
}

/**
 * 会话
 */
export interface Session {
  id: string
  user_id: string
  title?: string
  model: string
  status: 'active' | 'completed' | 'failed'
  total_tokens: number
  avg_latency: number
  metadata?: Record<string, any>
  created_at: Date
  updated_at: Date
}

/**
 * 消息
 */
export interface Message {
  id: string
  session_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  tokens: number
  latency: number
  confidence?: number
  metadata?: Record<string, any>
  created_at: Date
}

/**
 * 消息来源
 */
export interface MessageSource {
  id: string
  message_id: string
  document_id?: string
  chunk_id?: string
  title: string
  content?: string
  url?: string
  relevance: number
  created_at: Date
}

/**
 * 知识库
 */
export interface KnowledgeBase {
  id: string
  user_id: string
  name: string
  description?: string
  status: 'active' | 'indexing' | 'error'
  document_count: number
  total_tokens: number
  config?: Record<string, any>
  metadata?: Record<string, any>
  created_at: Date
  updated_at: Date
}

/**
 * 文档
 */
export interface Document {
  id: string
  knowledge_base_id: string
  user_id: string
  name: string
  file_path?: string
  file_size?: number
  mime_type?: string
  status: 'active' | 'processing' | 'error'
  chunk_count: number
  total_tokens: number
  error_message?: string
  metadata?: Record<string, any>
  created_at: Date
  updated_at: Date
}

/**
 * 文档分块
 */
export interface DocumentChunk {
  id: string
  document_id: string
  content: string
  chunk_index: number
  tokens: number
  metadata?: Record<string, any>
  embedding_id?: string
  created_at: Date
}

/**
 * 资产
 */
export interface Asset {
  id: string
  user_id: string
  name: string
  type: 'document' | 'dataset' | 'model' | 'agent'
  status: 'active' | 'inactive' | 'processing' | 'error'
  description?: string
  file_path?: string
  file_size?: number
  mime_type?: string
  metadata?: Record<string, any>
  created_at: Date
  updated_at: Date
}

/**
 * Agent
 */
export interface Agent {
  id: string
  user_id: string
  name: string
  description?: string
  model: string
  status: 'active' | 'inactive' | 'training' | 'error'
  system_prompt?: string
  capabilities?: string[]
  config?: Record<string, any>
  metadata?: Record<string, any>
  created_at: Date
  updated_at: Date
}

/**
 * 使用统计
 */
export interface UsageStat {
  id: string
  user_id?: string
  date: Date
  sessions_count: number
  messages_count: number
  tokens_used: number
  api_calls: number
  created_at: Date
}

// =====================================================
// API 请求/响应类型
// =====================================================

/**
 * 通用 API 响应
 */
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  error?: string
}

/**
 * 分页响应
 */
export interface PaginatedResponse<T> {
  items: T[]
  pagination: Pagination
}

/**
 * 分页信息
 */
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

/**
 * 分页查询参数
 */
export interface PaginationQuery {
  page?: number
  pageSize?: number
}

/**
 * 搜索查询参数
 */
export interface SearchQuery extends PaginationQuery {
  search?: string
}

/**
 * 登录请求
 */
export interface LoginRequest {
  email: string
  password: string
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  name: string
  email: string
  password: string
}

/**
 * 创建会话请求
 */
export interface CreateSessionRequest {
  model?: string
  title?: string
}

/**
 * 发送消息请求
 */
export interface SendMessageRequest {
  content: string
}

/**
 * RAG 聊天请求
 */
export interface RAGChatRequest {
  session_id: string
  content: string
}

/**
 * 上传文档响应
 */
export interface UploadedDocument {
  id: string
  name: string
  chunkCount: number
}

/**
 * 流式事件
 */
export interface StreamChunkEvent {
  type: 'chunk'
  content: string
}

export interface StreamSourcesEvent {
  type: 'sources'
  sources: any[]
}

export interface StreamDoneEvent {
  type: 'done'
  message: Message
}

export interface StreamErrorEvent {
  type: 'error'
  error: string
}

export type StreamEvent = StreamChunkEvent | StreamSourcesEvent | StreamDoneEvent | StreamErrorEvent

/**
 * 创建知识库请求
 */
export interface CreateKnowledgeBaseRequest {
  name: string
  description?: string
}

/**
 * 创建资产请求
 */
export interface CreateAssetRequest {
  name: string
  type: Asset['type']
  description?: string
}

/**
 * 创建 Agent 请求
 */
export interface CreateAgentRequest {
  name: string
  description?: string
  model: string
  capabilities?: string[]
}
