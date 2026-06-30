/*
 * 数据分析 API
 */

import request from '@/utils/request'

export interface OverviewStats {
  totalSessions: number
  totalMessages: number
  activeUsers: number
  averageConfidence: number | string
  totalTokens: number | string
  averageLatency: number | string
  modelStats?: ModelStats[]
  usageStats?: UsageStats
}

export interface UsageStats {
  totalSessions: number | string
  totalMessages: number | string
  totalTokens: number | string
  totalApiCalls: number | string
  dailyStats?: DailyStatsItem[]
}

export interface DailyStatsItem {
  date: string
  sessionsCount: number | string
  messagesCount: number | string
  tokensUsed: number | string
  apiCalls: number | string
}

export interface DailyStats {
  date: string
  sessions: number
  messages: number
  tokens: number | string
}

export interface ModelStats {
  model: string
  count: number
  percentage?: number
}

export interface AgentStats {
  agentId: string
  agentName: string
  sessions: number
  messages: number
}

export interface TopQuestion {
  question: string
  count: number
}

// 获取总览统计
export function getOverview() {
  return request.get<any, OverviewStats>('/analytics/overview')
}

// 获取每日统计
export function getDailyStats(params?: { startDate?: string; endDate?: string }) {
  return request.get<any, DailyStats[]>('/analytics/daily', { params })
}

// 获取模型使用统计
export function getModelStats() {
  return request.get<any, ModelStats[]>('/analytics/models')
}

// 获取 Agent 使用统计
export function getAgentStats() {
  return request.get<any, AgentStats[]>('/analytics/agents')
}

// 获取热门问题
export function getTopQuestions(limit?: number) {
  return request.get<any, TopQuestion[]>('/analytics/top-questions', {
    params: { limit }
  })
}
