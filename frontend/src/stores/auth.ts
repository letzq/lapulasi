import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  login as apiLogin,
  register as apiRegister,
  getUserInfo,
  type LoginParams,
  type RegisterParams,
  type UserInfo
} from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  // 登录
  async function login(params: LoginParams) {
    loading.value = true
    error.value = null
    try {
      const result = await apiLogin(params)
      user.value = result.user
      token.value = result.token
      localStorage.setItem('token', result.token)
      return result
    } catch (err: any) {
      error.value = err.message || '登录失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 注册
  async function register(params: RegisterParams) {
    loading.value = true
    error.value = null
    try {
      const result = await apiRegister(params)
      user.value = result.user
      token.value = result.token
      localStorage.setItem('token', result.token)
      return result
    } catch (err: any) {
      error.value = err.message || '注册失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  async function fetchUserInfo() {
    if (!token.value) return

    loading.value = true
    try {
      const userInfo = await getUserInfo()
      user.value = userInfo
    } catch (err: any) {
      console.error('Failed to fetch user info:', err)
      // 如果获取用户信息失败，清除登录状态
      logout()
    } finally {
      loading.value = false
    }
  }

  // 退出登录
  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  // 初始化时获取用户信息
  if (token.value) {
    fetchUserInfo()
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    currentUser,
    login,
    register,
    fetchUserInfo,
    logout
  }
})
