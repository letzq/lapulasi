/*
 * 认证 API
 */

import request from '@/utils/request'

export interface LoginParams {
  email: string
  password: string
}

export interface RegisterParams {
  email: string
  password: string
  name: string
}

export interface UserInfo {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  isActive?: boolean
  createdAt?: string
}

export interface LoginResult {
  token: string
  user: UserInfo
}

// 用户登录
export function login(data: LoginParams) {
  return request.post<any, LoginResult>('/auth/login', data)
}

// 用户注册
export function register(data: RegisterParams) {
  return request.post<any, LoginResult>('/auth/register', data)
}

// 获取当前用户信息
export function getUserInfo() {
  return request.get<any, UserInfo>('/auth/me')
}

// 更新用户信息
export function updateUserInfo(data: Partial<UserInfo>) {
  return request.put<any, UserInfo>('/auth/me', data)
}

// 修改密码
export function changePassword(data: { oldPassword: string; newPassword: string }) {
  return request.put<any, null>('/auth/password', data)
}

// 退出登录
export function logout() {
  return request.post('/auth/logout')
}
