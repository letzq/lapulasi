/**
 * 请求/响应命名风格转换中间件
 * 自动将请求体 camelCase → snake_case
 * 自动将响应体 snake_case → camelCase
 */

import { Request, Response, NextFunction } from 'express'
import { snakifyKeys, camelizeKeys } from '../utils/transform.js'

/**
 * 请求体 camelCase → snake_case 中间件
 */
export function requestCamelToSnake(req: Request, _res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = snakifyKeys(req.body)
  }
  // 同时转换 query 参数
  if (req.query && typeof req.query === 'object') {
    const converted: Record<string, any> = {}
    for (const [key, value] of Object.entries(req.query)) {
      converted[key] = value // query 参数保持原样，由路由自行处理
    }
  }
  next()
}
