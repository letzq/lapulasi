<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChatDotRound,
  EditPen,
  User,
  Aim,
  FolderOpened,
  Collection,
  DataAnalysis,
  Plus
} from '@element-plus/icons-vue'
import { getOverview, type OverviewStats } from '@/api/analytics'
import { getSessions, type Session } from '@/api/sessions'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const stats = ref<OverviewStats>({
  totalSessions: 0,
  totalMessages: 0,
  activeUsers: 0,
  averageConfidence: 0,
  totalTokens: 0,
  averageLatency: 0
})
const recentSessions = ref<Session[]>([])

onMounted(async () => {
  loading.value = true
  try {
    const [overviewData, sessionsData] = await Promise.all([
      getOverview(),
      getSessions({ page: 1, pageSize: 5 })
    ])
    stats.value = overviewData
    recentSessions.value = sessionsData.items
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    loading.value = false
  }
})

const formatDate = (d: string) => {
  return new Date(d).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const navigateTo = (path: string) => {
  router.push(path)
}

const statCards = [
  { key: 'totalSessions', label: '总会话数', icon: ChatDotRound, color: '#3370ff' },
  { key: 'totalMessages', label: '总消息数', icon: EditPen, color: '#34c759' },
  { key: 'activeUsers', label: '活跃用户', icon: User, color: '#ff9500' },
  { key: 'averageConfidence', label: '平均置信度', icon: Aim, color: '#f53f3f', isPercent: true }
]

const quickActions = [
  { title: '开始新对话', desc: '与 AI 助手交流', icon: ChatDotRound, path: '/agents', color: '#3370ff' },
  { title: '上传资产', desc: '添加文档资源', icon: FolderOpened, path: '/assets', color: '#34c759' },
  { title: '知识库管理', desc: '管理知识仓库', icon: Collection, path: '/knowledge', color: '#ff9500' },
  { title: '查看数据分析', desc: '查看使用统计', icon: DataAnalysis, path: '/analytics', color: '#86909c' }
]
</script>

<template>
  <div class="home-page" v-loading="loading">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>欢迎使用 Enterprise Workspace</h1>
      <p>AI 驱动的智能知识中心</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stats-row">
      <el-col :span="6" v-for="stat in statCards" :key="stat.key">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ backgroundColor: stat.color + '15', color: stat.color }">
              <el-icon :size="24"><component :is="stat.icon" /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">
                {{ stat.isPercent ? Math.round(Number(stats[stat.key as keyof OverviewStats] || 0) * 100) + '%' : stats[stat.key as keyof OverviewStats] }}
              </div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <!-- 最近会话 -->
      <el-col :span="16">
        <el-card class="section-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">最近会话</span>
              <el-button type="primary" link @click="navigateTo('/agents')">查看全部</el-button>
            </div>
          </template>
          <div class="sessions-list">
            <div
              v-for="session in recentSessions"
              :key="session.id"
              class="session-item"
              @click="navigateTo(`/agents?session=${session.id}`)"
            >
              <div class="session-icon">
                <el-icon :size="20" color="#3370ff"><ChatDotRound /></el-icon>
              </div>
              <div class="session-info">
                <div class="session-title">{{ session.title || '新对话' }}</div>
                <div class="session-meta">
                  <span class="session-model">{{ session.model }}</span>
                  <span class="session-tokens">{{ session.totalTokens }} tokens</span>
                </div>
              </div>
              <div class="session-time">{{ formatDate(session.createdAt) }}</div>
            </div>
            <el-empty v-if="recentSessions.length === 0" description="暂无会话记录" />
          </div>
        </el-card>
      </el-col>

      <!-- 快捷操作 -->
      <el-col :span="8">
        <el-card class="section-card" shadow="never">
          <template #header>
            <span class="card-title">快捷操作</span>
          </template>
          <div class="actions-list">
            <div
              v-for="action in quickActions"
              :key="action.path"
              class="action-item"
              @click="navigateTo(action.path)"
            >
              <div class="action-icon" :style="{ backgroundColor: action.color + '15', color: action.color }">
                <el-icon :size="20"><component :is="action.icon" /></el-icon>
              </div>
              <div class="action-info">
                <div class="action-title">{{ action.title }}</div>
                <div class="action-desc">{{ action.desc }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.page-header p {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
}

.stat-card :deep(.el-card__body) {
  padding: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.section-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
  height: 100%;
}

.section-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color-light);
}

.section-card :deep(.el-card__body) {
  padding: 16px 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.sessions-list {
  display: flex;
  flex-direction: column;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color-light);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.session-item:last-child {
  border-bottom: none;
}

.session-item:hover {
  background-color: var(--bg-secondary);
  margin: 0 -20px;
  padding: 12px 20px;
  border-radius: var(--radius-md);
}

.session-icon {
  width: 36px;
  height: 36px;
  background-color: var(--color-primary-light);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 4px;
}

.session-model {
  font-size: 12px;
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  padding: 2px 8px;
  border-radius: var(--radius-round);
}

.session-tokens {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.session-time {
  font-size: 12px;
  color: var(--color-text-placeholder);
  flex-shrink: 0;
}

.actions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-item:hover {
  background-color: var(--bg-secondary);
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-title {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.action-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}
</style>
