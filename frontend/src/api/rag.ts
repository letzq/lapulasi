/*
 * RAG 对话 API
 */

import request from '@/utils/request'
import type { Document } from '@/types'

export type { Document as RagDocument }

export interface RagChatParams {
  content: string
  sessionId: string
  knowledgeBaseId?: string
  model?: string
}

// RAG 流式对话
export async function* streamRagChat(params: RagChatParams): AsyncGenerator<any> {
  const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
  const authStore = await import('@/stores/auth').then(m => m.useAuthStore())

  const response = await fetch(`${baseURL}/rag/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authStore.token}`
    },
    body: JSON.stringify({
      session_id: params.sessionId,
      content: params.content,
      knowledge_base_id: params.knowledgeBaseId
    })
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw new Error('No reader available')
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') return
          if (data) {
            try {
              const parsed = JSON.parse(data)
              yield parsed
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// 上传文档到知识库
export function uploadDocument(file: File, knowledgeBaseId?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (knowledgeBaseId) {
    formData.append('knowledge_base_id', knowledgeBaseId)
  }
  return request.post<any, { id: string; name: string; chunkCount: number; status: string }>('/rag/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 获取文档列表
export function getDocuments(knowledgeBaseId?: string) {
  return request.get<any, Document[]>('/rag/documents', {
    params: knowledgeBaseId ? { knowledge_base_id: knowledgeBaseId } : undefined
  })
}

// 删除文档
export function deleteDocument(id: string) {
  return request.delete<any, null>(`/rag/documents/${id}`)
}
