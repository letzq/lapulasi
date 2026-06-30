/**
 * 命名风格转换工具
 * snake_case ↔ camelCase
 */

/**
 * snake_case → camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
}

/**
 * camelCase → snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

/**
 * 递归转换对象的 key 为 camelCase
 */
export function camelizeKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => camelizeKeys(item))
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[toCamelCase(key)] = camelizeKeys(value)
    }
    return result
  }
  return obj
}

/**
 * 递归转换对象的 key 为 snake_case
 */
export function snakifyKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => snakifyKeys(item))
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    const result: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
      result[toSnakeCase(key)] = snakifyKeys(value)
    }
    return result
  }
  return obj
}

/**
 * 构建标准分页响应
 */
export function paginatedResponse(items: any[], total: number, page: number, pageSize: number) {
  return {
    items: camelizeKeys(items),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  }
}

/**
 * 构建标准成功响应
 */
export function successResponse(data: any) {
  return {
    success: true,
    data: camelizeKeys(data)
  }
}

/**
 * 构建标准错误响应
 */
export function errorResponse(error: string) {
  return {
    success: false,
    error
  }
}
