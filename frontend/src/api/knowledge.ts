/*
 * 知识库 API
 */

import request from '@/utils/request'
import type { KnowledgeBase, Document, PaginatedResponse } from '@/types'

export type { KnowledgeBase, Document }

export interface KnowledgeBaseListParams {
  page?: number
  pageSize?: number
  status?: string
}

export interface KnowledgeBaseListResult extends PaginatedResponse<KnowledgeBase> {}

// 获取知识库列表
export function getKnowledgeBases(params?: KnowledgeBaseListParams) {
  return request.get<any, KnowledgeBaseListResult>('/knowledge', { params })
}

// 获取知识库详情
export function getKnowledgeBase(id: string) {
  return request.get<any, KnowledgeBase>(`/knowledge/${id}`)
}

// 创建知识库
export function createKnowledgeBase(data: { name: string; description?: string }) {
  return request.post<any, KnowledgeBase>('/knowledge', data)
}

// 更新知识库
export function updateKnowledgeBase(id: string, data: Partial<KnowledgeBase>) {
  return request.put<any, KnowledgeBase>(`/knowledge/${id}`, data)
}

// 删除知识库
export function deleteKnowledgeBase(id: string) {
  return request.delete<any, null>(`/knowledge/${id}`)
}

// 获取知识库文档列表
export function getKnowledgeBaseDocuments(id: string) {
  return request.get<any, Document[]>(`/knowledge/${id}/documents`)
}

// 上传文档到知识库
export function uploadToKnowledgeBase(id: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post<any, { id: string; name: string; chunkCount: number; status: string }>(
    `/knowledge/${id}/documents`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
}

// 删除知识库文档
export function deleteKnowledgeBaseDocument(docId: string) {
  return request.delete<any, null>(`/rag/documents/${docId}`)
}
