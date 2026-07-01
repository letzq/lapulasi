<script setup lang="ts">
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ChatDotRound,
  Plus,
  Delete,
  Position,
  Loading,
  DocumentCopy,
  Refresh,
  FolderOpened,
  Cpu,
  Timer,
  Coin,
  Promotion,
  ArrowDown,
  Document
} from '@element-plus/icons-vue'
import { getSessions, createSession, deleteSession, type Session } from '@/api/sessions'
import { getMessages, sendMessage, type Message } from '@/api/messages'
import { streamRagChat } from '@/api/rag'

const route = useRoute()
const sessions = ref<Session[]>([])
const currentSession = ref<Session | null>(null)
const messages = ref<Message[]>([])
const messageInput = ref('')
const messagesContainer = ref<HTMLElement | null>(null)
const loading = ref(false)
const sending = ref(false)
const showSources = ref<Record<string, boolean>>({})

// 加载会话列表
const loadSessions = async () => {
  try {
    const result = await getSessions({ page: 1, pageSize: 50 })
    sessions.value = result.items
    if (sessions.value.length > 0 && !currentSession.value) {
      await selectSession(sessions.value[0])
    }
  } catch (error) {
    console.error('Failed to load sessions:', error)
  }
}

// 选择会话
const selectSession = async (session: Session) => {
  currentSession.value = session
  await loadMessages(session.id)
}

// 加载消息
const loadMessages = async (sessionId: string) => {
  loading.value = true
  try {
    const result = await getMessages({ sessionId, page: 1, pageSize: 100 })
    messages.value = result.items
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('Failed to load messages:', error)
  } finally {
    loading.value = false
  }
}

// 创建新会话
const handleCreateSession = async () => {
  try {
    const session = await createSession({ title: '新对话' })
    sessions.value.unshift(session)
    await selectSession(session)
    ElMessage.success('新会话已创建')
  } catch (error) {
    ElMessage.error('创建会话失败')
  }
}

// 删除会话
const handleDeleteSession = async (session: Session) => {
  try {
    await ElMessageBox.confirm('确定要删除这个会话吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteSession(session.id)
    sessions.value = sessions.value.filter(s => s.id !== session.id)
    if (currentSession.value?.id === session.id) {
      if (sessions.value.length > 0) {
        await selectSession(sessions.value[0])
      } else {
        currentSession.value = null
        messages.value = []
      }
    }
    ElMessage.success('会话已删除')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除会话失败')
    }
  }
}

// 发送消息
const handleSend = async () => {
  if (!messageInput.value.trim() || sending.value || !currentSession.value) return

  const content = messageInput.value.trim()
  messageInput.value = ''

  // 自动更新会话标题（首次发消息时）
  if (currentSession.value.title === '新对话' || !currentSession.value.title) {
    const autoTitle = content.length > 15 ? content.substring(0, 15) + '...' : content
    currentSession.value.title = autoTitle
    // 同步更新侧边栏列表中的标题
    const sessionInList = sessions.value.find(s => s.id === currentSession.value!.id)
    if (sessionInList) {
      sessionInList.title = autoTitle
    }
  }

  // 添加用户消息到列表
  const userMessage: Message = {
    id: `temp-${Date.now()}`,
    sessionId: currentSession.value.id,
    role: 'user',
    content,
    createdAt: new Date().toISOString()
  }
  messages.value.push(userMessage)
  await nextTick()
  scrollToBottom()

  // 添加 AI 回复占位
  const aiMessage: Message = {
    id: `temp-ai-${Date.now()}`,
    sessionId: currentSession.value.id,
    role: 'assistant',
    content: '',
    createdAt: new Date().toISOString()
  }
  messages.value.push(aiMessage)

  sending.value = true
  try {
    // 使用流式对话
    const stream = streamRagChat({
      content: content,
      sessionId: currentSession.value.id
    })

    for await (const event of stream) {
      if (event.type === 'chunk' && event.content) {
        aiMessage.content += event.content
      } else if (event.type === 'sources' && event.sources) {
        aiMessage.sources = event.sources
      } else if (event.type === 'done') {
        aiMessage.confidence = event.confidence
      }
      await nextTick()
      scrollToBottom()
    }
  } catch (error) {
    console.error('Failed to send message:', error)
    aiMessage.content = '抱歉，发生了错误，请稍后重试。'
    ElMessage.error('发送消息失败')
  } finally {
    sending.value = false
  }
}

// 滚动到底部
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// 键盘事件
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

// 格式化时间
const formatTime = (ts: string) => {
  return new Date(ts).toLocaleTimeString('zh-CN', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

// 格式化内容（简单 Markdown）
const formatContent = (content: string) => {
  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

// 复制消息
const copyMessage = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败')
  }
}

// 切换来源显示
const toggleSources = (msgId: string) => {
  showSources.value[msgId] = !showSources.value[msgId]
}

// 获取来源相似度百分比
const getSourceSimilarity = (source: any): number => {
  const val = source.similarity ?? source.relevance ?? 0
  return Math.round((val > 1 ? val : val * 100))
}

// 相似度颜色
const similarityColor = (pct: number): string => {
  if (pct >= 80) return '#52c41a'
  if (pct >= 60) return '#faad14'
  return '#999'
}

// 获取来源文档名
const getSourceTitle = (source: any): string => {
  return source.documentName || source.document_name || source.title || '未知文档'
}

// 获取来源知识库名（如果有）
const getSourceKB = (source: any): string => {
  return source.knowledgeBaseName || source.knowledge_base_name || ''
}

// 获取来源内容
const getSourceContent = (source: any): string => {
  return source.chunkContent || source.chunk_content || source.content || ''
}

onMounted(async () => {
  await loadSessions()
  // 检查是否有 session 参数
  const sessionId = route.query.session as string
  if (sessionId) {
    const session = sessions.value.find(s => s.id === sessionId)
    if (session) {
      await selectSession(session)
    }
  }
})
</script>

<template>
  <div class="agents-page">
    <!-- 会话列表侧边栏 -->
    <div class="sessions-sidebar">
      <div class="sidebar-header">
        <el-button type="primary" class="new-session-btn" @click="handleCreateSession">
          <el-icon><Plus /></el-icon>
          <span>新建对话</span>
        </el-button>
      </div>
      <el-scrollbar class="sessions-list-wrapper">
        <div class="sessions-list">
          <div
            v-for="session in sessions"
            :key="session.id"
            class="session-item"
            :class="{ active: currentSession?.id === session.id }"
            @click="selectSession(session)"
          >
            <el-icon class="session-icon"><ChatDotRound /></el-icon>
            <div class="session-info">
              <div class="session-title">{{ session.title || '新对话' }}</div>
              <div class="session-meta">{{ session.messageCount }} 条消息</div>
            </div>
            <el-button
              class="delete-btn"
              type="danger"
              link
              @click.stop="handleDeleteSession(session)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <el-empty v-if="sessions.length === 0" description="暂无会话" :image-size="60" />
        </div>
      </el-scrollbar>
    </div>

    <!-- 对话区域 -->
    <div class="chat-area">
      <!-- 会话头部 -->
      <div v-if="currentSession" class="chat-header">
        <div class="header-info">
          <div class="header-title">{{ currentSession.title || '新对话' }}</div>
          <div class="header-meta">
            <span class="meta-item">
              <el-icon><Cpu /></el-icon>
              {{ currentSession.model || '小米模型' }}
            </span>
            <span class="meta-item">
              <el-icon><Coin /></el-icon>
              {{ currentSession.totalTokens }} tokens
            </span>
            <span class="meta-item">
              <el-icon><Timer /></el-icon>
              {{ currentSession.messageCount }} 条消息
            </span>
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div ref="messagesContainer" class="messages-container" v-loading="loading">
        <!-- 空状态 -->
        <div v-if="!currentSession" class="empty-state">
          <el-icon class="empty-icon"><ChatDotRound /></el-icon>
          <h3>选择或创建一个会话</h3>
          <p>开始与 AI 助手对话</p>
        </div>

        <div v-else-if="messages.length === 0 && !loading" class="empty-state">
          <el-icon class="empty-icon"><Promotion /></el-icon>
          <h3>开始对话</h3>
          <p>输入问题开始与 AI 助手交流</p>
        </div>

        <!-- 消息列表 -->
        <template v-else>
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message"
            :class="[msg.role, { 'is-temp': msg.id.startsWith('temp-') }]"
          >
            <!-- 用户消息 -->
            <div v-if="msg.role === 'user'" class="user-message">
              <div class="message-content">
                <p>{{ msg.content }}</p>
              </div>
              <div class="user-avatar">
                <span>U</span>
              </div>
            </div>

            <!-- AI 消息 -->
            <div v-else class="assistant-message">
              <div class="assistant-avatar">
                <el-icon><Cpu /></el-icon>
              </div>
              <div class="message-body">
                <div class="message-header">
                  <span class="assistant-name">Knowledge Agent</span>
                  <span class="message-time">{{ formatTime(msg.createdAt) }}</span>
                </div>
                <div class="message-text" v-html="formatContent(msg.content)"></div>
                <div v-if="msg.sources && msg.sources.length > 0" class="message-sources">
                  <div class="sources-header" @click="toggleSources(msg.id)">
                    <el-icon><FolderOpened /></el-icon>
                    <span class="sources-title">引用来源 ({{ msg.sources.length }})</span>
                    <el-icon class="sources-arrow" :class="{ expanded: showSources[msg.id] }"><ArrowDown /></el-icon>
                  </div>
                  <div v-if="showSources[msg.id]" class="sources-list">
                    <div v-for="(source, idx) in msg.sources" :key="idx" class="source-item">
                      <div class="source-top">
                        <div class="source-index">{{ idx + 1 }}</div>
                        <div class="source-info">
                          <div class="source-doc">
                            <el-icon class="source-doc-icon"><Document /></el-icon>
                            <span class="source-doc-name">{{ getSourceTitle(source) }}</span>
                          </div>
                          <div class="source-score">
                            <span class="score-label">相似度</span>
                            <el-progress
                              :percentage="getSourceSimilarity(source)"
                              :stroke-width="6"
                              :show-text="false"
                              :color="similarityColor(getSourceSimilarity(source))"
                              class="score-bar"
                            />
                            <span class="score-value" :style="{ color: similarityColor(getSourceSimilarity(source)) }">
                              {{ getSourceSimilarity(source) }}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="source-content" v-if="getSourceContent(source)">
                        {{ getSourceContent(source) }}
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="msg.confidence" class="message-confidence">
                  <span class="confidence-label">置信度:</span>
                  <el-progress
                    :percentage="Math.round(Number(msg.confidence) * 100)"
                    :stroke-width="6"
                    :show-text="false"
                    class="confidence-bar"
                  />
                  <span class="confidence-value">{{ Math.round(Number(msg.confidence) * 100) }}%</span>
                </div>
                <div class="message-actions">
                  <el-button class="action-btn" @click="copyMessage(msg.content)">
                    <el-icon><DocumentCopy /></el-icon>
                  </el-button>
                  <el-button class="action-btn" @click="handleSend">
                    <el-icon><Refresh /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="sending" class="message assistant">
            <div class="assistant-message">
              <div class="assistant-avatar">
                <el-icon class="is-loading"><Loading /></el-icon>
              </div>
              <div class="message-body">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 输入区域 -->
      <div v-if="currentSession" class="input-container">
        <div class="input-wrapper">
          <el-input
            v-model="messageInput"
            type="textarea"
            :rows="1"
            :autosize="{ minRows: 1, maxRows: 4 }"
            placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
            :disabled="sending"
            @keydown="handleKeyDown"
          />
          <el-button
            type="primary"
            class="send-btn"
            :disabled="!messageInput.trim() || sending"
            :loading="sending"
            @click="handleSend"
          >
            <el-icon v-if="!sending"><Position /></el-icon>
          </el-button>
        </div>
        <div class="input-footer">
          <span class="disclaimer">AI 生成的内容可能不准确，请核实重要信息</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.agents-page {
  display: flex;
  height: calc(100vh - var(--header-height) - var(--content-padding) * 2);
  margin: -24px;
  background-color: var(--bg-primary);
}

/* 会话列表侧边栏 */
.sessions-sidebar {
  width: 280px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.new-session-btn {
  width: 100%;
  height: 40px;
  border-radius: var(--radius-md);
  font-weight: 500;
}

.sessions-list-wrapper {
  flex: 1;
  overflow: hidden;
}

.sessions-list {
  padding: 8px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: 4px;
}

.session-item:hover {
  background-color: var(--bg-tertiary);
}

.session-item.active {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.session-icon {
  font-size: 18px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.session-item.active .session-icon {
  color: var(--color-primary);
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 14px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.delete-btn {
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.session-item:hover .delete-btn {
  opacity: 1;
}

/* 对话区域 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-primary);
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 500px;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.meta-item .el-icon {
  font-size: 14px;
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 64px;
  color: var(--color-text-placeholder);
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
}

/* 消息样式 */
.message {
  margin-bottom: 24px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.is-temp {
  opacity: 0.7;
}

/* 用户消息 */
.user-message {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.user-message .message-content {
  max-width: 70%;
  padding: 12px 16px;
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--radius-lg);
  border-top-right-radius: var(--radius-sm);
  font-size: 14px;
  line-height: 1.6;
}

.user-message .message-content p {
  margin: 0;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background-color: var(--bg-tertiary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

/* AI 消息 */
.assistant-message {
  display: flex;
  gap: 12px;
}

.assistant-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3370ff, #5590ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.assistant-avatar .el-icon {
  font-size: 18px;
}

.message-body {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.assistant-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.message-time {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.message-text {
  padding: 12px 16px;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border-top-left-radius: var(--radius-sm);
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text-primary);
}

.message-text :deep(strong) {
  font-weight: 600;
}

/* 来源 */
.message-sources {
  margin-top: 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--bg-primary);
}

.sources-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  font-size: 13px;
  color: var(--color-text-secondary);
}

.sources-header:hover {
  background-color: var(--bg-secondary);
}

.sources-title {
  flex: 1;
  font-weight: 500;
}

.sources-arrow {
  font-size: 14px;
  transition: transform var(--transition-fast);
}

.sources-arrow.expanded {
  transform: rotate(180deg);
}

.sources-list {
  padding: 0 14px 14px;
}

.source-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color-light);
}

.source-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.source-top {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.source-index {
  width: 22px;
  height: 22px;
  background: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
  margin-top: 2px;
}

.source-info {
  flex: 1;
  min-width: 0;
}

.source-doc {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.source-doc-icon {
  font-size: 14px;
  color: var(--color-primary);
  flex-shrink: 0;
}

.source-doc-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  word-break: break-all;
  line-height: 1.4;
}

.source-score {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.score-bar {
  flex: 1;
  max-width: 120px;
}

.score-value {
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
  min-width: 40px;
}

.source-content {
  margin-top: 10px;
  padding: 10px 12px;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-height: 120px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.message-confidence {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-text-secondary);
}

.confidence-label {
  flex-shrink: 0;
}

.confidence-bar {
  flex: 1;
  max-width: 100px;
}

.confidence-value {
  flex-shrink: 0;
  font-weight: 500;
}

/* 消息操作 */
.message-actions {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.message:hover .message-actions {
  opacity: 1;
}

.action-btn {
  padding: 4px 8px;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.action-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--color-primary);
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border-top-left-radius: var(--radius-sm);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: var(--color-text-placeholder);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
}

/* 输入区域 */
.input-container {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-primary);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 8px 12px;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

.input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.input-wrapper :deep(.el-textarea__inner) {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 4px 0;
  resize: none;
}

.send-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.input-footer {
  margin-top: 8px;
  text-align: center;
}

.disclaimer {
  font-size: 12px;
  color: var(--color-text-placeholder);
}
</style>
