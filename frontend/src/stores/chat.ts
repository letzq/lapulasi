import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session, Message } from '@/types'
import { getSessions, createSession as apiCreateSession, deleteSession as apiDeleteSession } from '@/api/sessions'
import { getMessages, sendMessage as apiSendMessage } from '@/api/messages'

export const useChatStore = defineStore('chat', () => {
  const sessions = ref<Session[]>([])
  const currentSession = ref<Session | null>(null)
  const messages = ref<Message[]>([])
  const loading = ref(false)
  const sendingMessage = ref(false)
  const error = ref<string | null>(null)
  const currentSessionId = computed(() => currentSession.value?.id || null)

  async function fetchSessions() {
    loading.value = true
    error.value = null
    try {
      const res = await getSessions({ page: 1, pageSize: 50 })
      sessions.value = res.items
    } catch {
      error.value = 'Failed to fetch sessions'
    } finally {
      loading.value = false
    }
  }

  async function createSession(model?: string) {
    loading.value = true
    error.value = null
    try {
      const session = await apiCreateSession({ model })
      sessions.value.unshift(session)
      currentSession.value = session
      messages.value = []
      return session
    } catch {
      error.value = 'Failed to create session'
      return null
    } finally {
      loading.value = false
    }
  }

  async function selectSession(session: Session) {
    currentSession.value = session
    await fetchMessages(session.id)
  }

  async function fetchMessages(sessionId: string) {
    loading.value = true
    error.value = null
    try {
      const res = await getMessages({ sessionId, page: 1, pageSize: 100 })
      messages.value = res.items
    } catch {
      error.value = 'Failed to fetch messages'
    } finally {
      loading.value = false
    }
  }

  async function sendMessage(content: string) {
    if (!currentSession.value || !content.trim()) return null
    sendingMessage.value = true
    error.value = null
    try {
      const message = await apiSendMessage({
        sessionId: currentSession.value.id,
        content: content.trim()
      })
      messages.value.push(message)
      return message
    } catch {
      error.value = 'Network error'
      return null
    } finally {
      sendingMessage.value = false
    }
  }

  async function deleteSession(sessionId: string) {
    loading.value = true
    error.value = null
    try {
      await apiDeleteSession(sessionId)
      sessions.value = sessions.value.filter(s => s.id !== sessionId)
      if (currentSession.value?.id === sessionId) {
        currentSession.value = sessions.value[0] || null
        if (currentSession.value) {
          await fetchMessages(currentSession.value.id)
        } else {
          messages.value = []
        }
      }
      return true
    } catch {
      error.value = 'Failed to delete'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    sessions,
    currentSession,
    messages,
    loading,
    sendingMessage,
    error,
    currentSessionId,
    fetchSessions,
    createSession,
    selectSession,
    fetchMessages,
    sendMessage,
    deleteSession
  }
})
