/**
 * API 请求/响应类型（与后端对齐）
 */

// 认证
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: any
  token: string
}

// 会话
export interface CreateSessionRequest {
  model?: string
  title?: string
}

// 消息
export interface SendMessageRequest {
  sessionId: string
  content: string
}

// RAG
export interface RagChatRequest {
  sessionId: string
  content: string
  knowledgeBaseId?: string
}

// 知识库
export interface CreateKnowledgeBaseRequest {
  name: string
  description?: string
}

// 资产
export interface CreateAssetRequest {
  name: string
  type: 'document' | 'dataset' | 'model' | 'agent'
  description?: string
}
