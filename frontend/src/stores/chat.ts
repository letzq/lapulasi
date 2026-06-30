import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session, Message } from '@/types'
import { mockApi } from '@/mock/api'

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<Session[]>([])
  const currentSession = ref<Session | null>(null)
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const sendingMessage = ref(false)
  const error = ref<string | null>(null)
  const currentSessionId = computed(() => currentSession.value?.id || null)

  async function fetchSessions() {
    loading.value = true; error.value = null
    try { const res = await mockApi.sessions.getAll(); sessions.value = res.items }
    catch { error.value = 'Failed to fetch sessions' } finally { loading.value = false }
  }

  async function createSession(model?: string) {
    loading.value = true; error.value = null
    try {
      const res = await mockApi.sessions.create(model)
      if (res.success) { sessions.value.unshift(res.data); currentSession.value = res.data; messages.value = []; return res.data }
    } catch { error.value = 'Failed to create session' } finally { loading.value = false }
    return null
  }

  async function selectSession(session: Session) { currentSession.value = session; await fetchMessages(session.id) }

  async function fetchMessages(sessionId: string) {
    loading.value = true; error.value = null
    try { const res = await mockApi.messages.getBySession(sessionId); messages.value = res.items }
    catch { error.value = 'Failed to fetch messages' } finally { loading.value = false }
  }

  async function sendMessage(content: string) {
    if (!currentSession.value || !content.trim()) return null
    sendingMessage.value = true; error.value = null
    try {
      const optimistic: Message = { id: `temp-${Date.now()}`, sessionId: currentSession.value.id, role: 'user', content: content.trim(), timestamp: new Date().toISOString() }
      messages.value.push(optimistic)
      const res = await mockApi.messages.send(currentSession.value.id, content)
      if (res.success) {
        const i = messages.value.findIndex(m => m.id === optimistic.id)
        if (i !== -1) messages.value.splice(i, 1)
        messages.value.push(res.data)
        return res.data
      } else {
        const i = messages.value.findIndex(m => m.id === optimistic.id)
        if (i !== -1) messages.value.splice(i, 1)
        error.value = res.error || 'Failed to send'
        return null
      }
    } catch { error.value = 'Network error'; return null } finally { sendingMessage.value = false }
  }

  async function regenerateMessage(messageId: string) {
    if (!currentSession.value) return null
    loading.value = true; error.value = null
    try {
      const res = await mockApi.messages.regenerate(currentSession.value.id, messageId)
      if (res.success) { const i = messages.value.findIndex(m => m.id === messageId); if (i !== -1) messages.value[i] = res.data; return res.data }
    } catch { error.value = 'Failed to regenerate' } finally { loading.value = false }
    return null
  }

  async function deleteSession(sessionId: string) {
    loading.value = true; error.value = null
    try {
      const res = await mockApi.sessions.delete(sessionId)
      if (res.success) {
        sessions.value = sessions.value.filter(s => s.id !== sessionId)
        if (currentSession.value?.id === sessionId) { currentSession.value = sessions.value[0] || null; if (currentSession.value) await fetchMessages(currentSession.value.id); else messages.value = [] }
        return true
      }
    } catch { error.value = 'Failed to delete' } finally { loading.value = false }
    return false
  }

  return { sessions, currentSession, messages, loading, sendingMessage, error, currentSessionId, fetchSessions, createSession, selectSession, fetchMessages, sendMessage, regenerateMessage, deleteSession }
})
