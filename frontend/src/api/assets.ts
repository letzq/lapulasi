/*
 * 资产 API
 */

import request from '@/utils/request'
import type { Asset, PaginatedResponse } from '@/types'

export type { Asset }

export interface AssetListParams {
  page?: number
  pageSize?: number
  type?: string
  status?: string
  search?: string
}

export interface AssetListResult extends PaginatedResponse<Asset> {}

// 获取资产列表
export function getAssets(params?: AssetListParams) {
  return request.get<any, AssetListResult>('/assets', { params })
}

// 获取资产详情
export function getAsset(id: string) {
  return request.get<any, Asset>(`/assets/${id}`)
}

// 创建资产（支持文件上传）
export function createAsset(data: { name: string; type: string; description?: string; file?: File; knowledgeBaseId?: string }) {
  const formData = new FormData()
  formData.append('name', data.name)
  formData.append('type', data.type)
  if (data.description) formData.append('description', data.description)
  if (data.file) formData.append('file', data.file)
  if (data.knowledgeBaseId) formData.append('knowledge_base_id', data.knowledgeBaseId)

  return request.post<any, Asset>('/assets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 更新资产
export function updateAsset(id: string, data: Partial<Asset>) {
  return request.put<any, Asset>(`/assets/${id}`, data)
}

// 删除资产
export function deleteAsset(id: string) {
  return request.delete<any, null>(`/assets/${id}`)
}
