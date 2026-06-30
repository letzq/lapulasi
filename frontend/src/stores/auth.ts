import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { mockApi } from '@/mock/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function login(email: string, password: string) {
    loading.value = true; error.value = null
    try {
      const res = await mockApi.auth.login(email, password)
      if (res.success) { user.value = res.data.user; token.value = res.data.token; localStorage.setItem('token', res.data.token); return true }
      else { error.value = res.error || 'Login failed'; return false }
    } catch { error.value = 'Network error'; return false } finally { loading.value = false }
  }

  async function fetchProfile() {
    if (!token.value) return
    loading.value = true
    try { const res = await mockApi.auth.getProfile(); if (res.success) user.value = res.data }
    catch { logout() } finally { loading.value = false }
  }

  function logout() { user.value = null; token.value = null; localStorage.removeItem('token') }

  return { user, token, loading, error, isAuthenticated, login, fetchProfile, logout }
})
