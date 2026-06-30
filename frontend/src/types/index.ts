export interface User {
  id: string; name: string; email: string; avatar?: string; role: 'admin' | 'user' | 'viewer'
}

export interface Session {
  id: string; model: string; latency: number; tokens: number;
  createdAt: string; status: 'active' | 'completed' | 'failed'
}

export interface Message {
  id: string; sessionId: string; role: 'user' | 'assistant'; content: string;
  timestamp: string; sources?: Source[]; confidence?: number; metadata?: MessageMetadata
}

export interface Source {
  id: string; title: string; url?: string; content: string; relevance: number
}

export interface MessageMetadata {
  model?: string; tokens?: number; latency?: number
}

export interface MenuItem {
  id: string; label: string; icon: string; path: string; badge?: number
}

export interface ApiResponse<T> {
  success: boolean; data: T; message?: string; error?: string
}

export interface Pagination {
  page: number; pageSize: number; total: number; totalPages: number
}

export interface PaginatedResponse<T> {
  items: T[]; pagination: Pagination
}

export interface Asset {
  id: string; name: string; type: 'document' | 'dataset' | 'model' | 'agent';
  status: 'active' | 'inactive' | 'processing'; createdAt: string;
  updatedAt: string; size?: number; description?: string
}

export interface Agent {
  id: string; name: string; description: string; model: string;
  status: 'active' | 'inactive' | 'training'; capabilities: string[]; createdAt: string
}

export interface KnowledgeBase {
  id: string; name: string; description: string; documentCount: number;
  lastUpdated: string; status: 'active' | 'indexing' | 'error'
}
