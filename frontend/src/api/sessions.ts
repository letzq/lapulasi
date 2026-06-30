/*
 * 会话 API
 */

import request from '@/utils/request'
import type { Session, PaginatedResponse } from '@/types'

export type { Session }

export interface SessionListParams {
  page?: number
  pageSize?: number
  status?: string
}

export interface SessionListResult extends PaginatedResponse<Session> {}

// 获取会话列表
export function getSessions(params?: SessionListParams) {
  return request.get<any, SessionListResult>('/sessions', { params })
}

// 获取会话详情
export function getSession(id: string) {
  return request.get<any, Session>(`/sessions/${id}`)
}

// 创建会话
export function createSession(data: { title?: string; model?: string }) {
  return request.post<any, Session>('/sessions', data)
}

// 更新会话
export function updateSession(id: string, data: Partial<Session>) {
  return request.put<any, Session>(`/sessions/${id}`, data)
}

// 删除会话
export function deleteSession(id: string) {
  return request.delete<any, null>(`/sessions/${id}`)
}

// 清空会话消息
export function clearSessionMessages(id: string) {
  return request.delete<any, null>(`/sessions/${id}/messages`)
}
