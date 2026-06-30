<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useChatStore } from '@/stores/chat'
import type { Message } from '@/types'

const chatStore = useChatStore()
const messageInput = ref('')
const messagesContainer = ref<HTMLDivElement | null>(null)
const isExpanded = ref(false)

onMounted(async () => {
  await chatStore.fetchSessions()
  if (chatStore.sessions.length === 0) await chatStore.createSession()
  else if (!chatStore.currentSession) await chatStore.selectSession(chatStore.sessions[0])
})

watch(() => chatStore.messages.length, async () => { await nextTick(); scrollToBottom() })

const scrollToBottom = () => { if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight }

const handleSend = async () => {
  if (!messageInput.value.trim() || chatStore.sendingMessage) return
  const content = messageInput.value; messageInput.value = ''
  await chatStore.sendMessage(content)
}

const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

const formatTime = (ts: string) => new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })

const formatContent = (c: string) => c.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\n/g, '</p><p>').replace(/\n(\d+)\.\s/g, '</p><p class="list">$1. ').replace(/\n/g, '<br>')

const toggleExpand = () => { isExpanded.value = !isExpanded.value }
</script>

<template>
  <div class="agents-page">
    <div class="session-header">
      <div class="session-info">
        <span class="session-badge"><span class="badge-dot"></span>Session ID: {{ chatStore.currentSession?.id?.slice(0, 10) || '...' }}</span>
        <span class="session-model">Model: {{ chatStore.currentSession?.model || 'GPT-4-Enterprise' }}</span>
      </div>
      <div class="session-stats">
        <span>Latency: {{ chatStore.currentSession?.latency || 0 }}s</span>
        <span class="sep">•</span>
        <span>Tokens: {{ chatStore.currentSession?.tokens || 0 }}</span>
      </div>
    </div>

    <div ref="messagesContainer" class="messages-container">
      <div v-if="chatStore.loading && chatStore.messages.length === 0" class="loading-state"><div class="spinner"></div><p>Loading...</p></div>
      <div v-else-if="chatStore.messages.length === 0" class="empty-state"><div class="empty-icon">💬</div><h3>Start a conversation</h3><p>Ask a question to get started</p></div>
      <template v-else>
        <div v-for="msg in chatStore.messages" :key="msg.id" class="message" :class="[msg.role, { 'is-temp': msg.id.startsWith('temp-') }]">
          <div v-if="msg.role === 'user'" class="user-message">
            <div class="message-content"><p>{{ msg.content }}</p></div>
          </div>
          <div v-else class="assistant-message">
            <div class="message-header">
              <div class="assistant-avatar">🔄</div>
              <span class="assistant-name">Knowledge Agent</span>
              <span class="message-time">{{ formatTime(msg.timestamp) }}</span>
            </div>
            <div class="message-body">
              <div class="message-text" v-html="formatContent(msg.content)"></div>
              <div v-if="msg.sources || msg.confidence" class="message-meta">
                <button v-if="msg.sources?.length" class="sources-btn" @click="toggleExpand">
                  <span>{{ isExpanded ? '▼' : '▶' }}</span>View Retrieval Trace & {{ msg.sources.length }} Sources
                </button>
                <span v-if="msg.confidence" class="confidence-badge">Avg. Confidence: {{ Math.round(msg.confidence * 100) }}%</span>
              </div>
            </div>
            <div class="message-actions">
              <button class="action-btn" title="Copy">📋</button>
              <button class="action-btn" title="Like">👍</button>
              <button class="action-btn" title="Dislike">👎</button>
              <button class="action-btn" @click="chatStore.regenerateMessage(msg.id)">🔄 Regenerate</button>
            </div>
          </div>
        </div>
      </template>
    </div>

    <div class="input-container">
      <div class="input-wrapper">
        <div class="input-actions-left">
          <button class="input-action-btn">📎</button>
          <button class="input-action-btn">@</button>
        </div>
        <textarea v-model="messageInput" class="message-input" placeholder="Ask follow-up or query another document..." rows="1" :disabled="chatStore.sendingMessage" @keydown="handleKeyDown"></textarea>
        <button class="send-btn" :disabled="!messageInput.trim() || chatStore.sendingMessage" @click="handleSend">
          <span v-if="chatStore.sendingMessage" class="spinner"></span>
          <span v-else>➤</span>
        </button>
      </div>
      <p class="disclaimer">AI-generated content may be inaccurate. Verify important information.</p>
    </div>
  </div>
</template>

<style scoped>
.agents-page { display: flex; flex-direction: column; height: calc(100vh - 140px); max-width: 900px; margin: 0 auto; padding: 0 24px; }
.session-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; background-color: var(--bg-tertiary); border-radius: var(--radius-lg); margin-bottom: 16px; }
.session-info { display: flex; align-items: center; gap: 16px; }
.session-badge { display: flex; align-items: center; gap: 8px; padding: 6px 12px; background-color: var(--bg-primary); border-radius: var(--radius-full); font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.badge-dot { width: 8px; height: 8px; background-color: #22c55e; border-radius: 50%; }
.session-model { font-size: 13px; color: var(--text-secondary); }
.session-stats { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
.sep { color: var(--text-tertiary); }
.messages-container { flex: 1; overflow-y: auto; padding: 16px 0; }
.loading-state, .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary); }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; color: var(--text-primary); }
.message { margin-bottom: 24px; animation: fadeIn 0.3s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.user-message { display: flex; justify-content: flex-end; }
.user-message .message-content { max-width: 70%; padding: 12px 16px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); font-size: 14px; line-height: 1.6; }
.assistant-message { display: flex; flex-direction: column; }
.message-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.assistant-avatar { width: 28px; height: 28px; background: linear-gradient(135deg, #2563eb, #3b82f6); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; color: white; }
.assistant-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.message-time { font-size: 12px; color: var(--text-tertiary); }
.message-body { padding-left: 36px; }
.message-text { background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px 20px; font-size: 14px; line-height: 1.7; }
.message-text :deep(p) { margin-bottom: 12px; }
.message-text :deep(p:last-child) { margin-bottom: 0; }
.message-text :deep(strong) { font-weight: 600; }
.message-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding: 12px 16px; background-color: var(--bg-tertiary); border-radius: var(--radius-md); }
.sources-btn { display: flex; align-items: center; gap: 8px; background: transparent; border: none; font-size: 13px; font-weight: 500; color: var(--text-secondary); cursor: pointer; }
.sources-btn:hover { color: var(--text-primary); }
.confidence-badge { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.message-actions { display: flex; align-items: center; gap: 4px; margin-top: 8px; padding-left: 36px; }
.action-btn { display: flex; align-items: center; gap: 4px; padding: 6px 10px; background: transparent; border: none; border-radius: var(--radius-md); font-size: 13px; color: var(--text-secondary); cursor: pointer; }
.action-btn:hover { background-color: var(--bg-tertiary); color: var(--text-primary); }
.input-container { padding: 16px 0 24px; }
.input-wrapper { display: flex; align-items: flex-end; gap: 12px; padding: 12px 16px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
.input-wrapper:focus-within { border-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-primary-light); }
.input-actions-left { display: flex; gap: 4px; }
.input-action-btn { padding: 6px; background: transparent; border: none; border-radius: var(--radius-md); font-size: 16px; color: var(--text-secondary); cursor: pointer; }
.input-action-btn:hover { background-color: var(--bg-tertiary); color: var(--text-primary); }
.message-input { flex: 1; min-height: 24px; max-height: 120px; padding: 4px 0; background: transparent; border: none; outline: none; font-size: 14px; line-height: 1.5; resize: none; }
.message-input::placeholder { color: var(--text-tertiary); }
.message-input:disabled { opacity: 0.6; }
.send-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background-color: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); font-size: 16px; cursor: pointer; }
.send-btn:hover:not(:disabled) { background-color: var(--color-primary-hover); }
.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.disclaimer { text-align: center; font-size: 12px; color: var(--text-tertiary); margin-top: 12px; }
.is-temp { opacity: 0.6; }
</style>
