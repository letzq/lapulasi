/**
 * 工具函数模块
 */

import { v4 as uuidv4 } from 'uuid'

/**
 * 生成 UUID
 */
export function generateId(): string {
  return uuidv4()
}

/**
 * 计算分页信息
 */
export function calculatePagination(page: number, pageSize: number, total: number) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize)
  }
}

/**
* 格式化文件大小
*/
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * 获取 MIME 类型
 */
export function getMimeType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop()
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'txt': 'text/plain',
    'md': 'text/markdown',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'json': 'application/json',
    'csv': 'text/csv'
  }
  return mimeTypes[ext || ''] || 'application/octet-stream'
}

/**
 * 延迟执行
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
