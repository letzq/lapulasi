/**
 * 操作日志中间件
 * 记录请求方法、路径、状态码、耗时、用户 ID
 */

import { Request, Response, NextFunction } from 'express'

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now()
  const { method, originalUrl } = req

  // 获取用户 ID（如果已认证）
  const getUserId = (): string => {
    try {
      const authHeader = req.headers.authorization
      const token = authHeader?.replace('Bearer ', '')
      if (!token) return '-'
      // 简单解码 JWT payload（不验证签名）
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
      return payload.userId || '-'
    } catch {
      return '-'
    }
  }

  // 响应结束后记录日志
  res.on('finish', () => {
    const duration = Date.now() - startTime
    const { statusCode } = res
    const userId = getUserId()

    // 状态码颜色标记
    const statusMark = statusCode >= 400 ? '❌' : '✅'
    const durationStr = duration > 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`

    console.log(
      `${statusMark} ${method.padEnd(7)} ${originalUrl.padEnd(40)} ${statusCode} ${durationStr.padEnd(8)} user=${userId}`
    )
  })

  next()
}

/**
 * RAG 链路日志
 */
export const ragLogger = {
  searchStart(query: string, topK: number) {
    console.log(`[RAG] 向量搜索开始: query="${query.substring(0, 50)}..." topK=${topK}`)
  },

  searchResult(count: number, topRelevance: number) {
    console.log(`[RAG] 向量搜索完成: ${count} 个结果, 最高相关度=${topRelevance.toFixed(3)}`)
  },

  searchError(error: any) {
    console.error(`[RAG] 向量搜索失败:`, error.message || error)
  },

  llmStart(model: string) {
    console.log(`[RAG] LLM 调用开始: model=${model}`)
  },

  llmDone(duration: number, answerLength: number) {
    console.log(`[RAG] LLM 调用完成: ${duration}ms, 回答长度=${answerLength}`)
  },

  llmError(error: any) {
    console.error(`[RAG] LLM 调用失败:`, error.message || error)
  },

  sourcesSaved(messageId: string, count: number) {
    console.log(`[RAG] 来源已保存: message=${messageId}, ${count} 个来源`)
  },

  documentIndexed(documentId: string, chunkCount: number, duration: number) {
    console.log(`[RAG] 文档索引完成: doc=${documentId}, ${chunkCount} 个 chunks, ${duration}ms`)
  }
}
