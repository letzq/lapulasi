/*
 * 消息 API
 */

import request from '@/utils/request'
import type { Message, PaginatedResponse } from '@/types'

export type { Message }

export interface MessageListParams {
  sessionId: string
  page?: number
  pageSize?: number
}

export interface MessageListResult extends PaginatedResponse<Message> {}

export interface SendMessageParams {
  sessionId: string
  content: string
}

// 获取消息列表
export function getMessages(params: MessageListParams) {
  return request.get<any, MessageListResult>('/messages', { params })
}

// 发送消息（非流式）
export function sendMessage(data: SendMessageParams) {
  return request.post<any, Message>('/messages', data)
}

// 删除消息
export function deleteMessage(id: string) {
  return request.delete<any, null>(`/messages/${id}`)
}

// 重新生成回答
export function regenerateMessage(id: string) {
  return request.post<any, Message>(`/messages/${id}/regenerate`)
}
