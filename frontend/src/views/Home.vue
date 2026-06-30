<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { mockApi } from '@/mock/api'

const stats = ref({ totalSessions: 0, totalMessages: 0, activeUsers: 0, averageConfidence: 0 })
const recentSessions = ref<any[]>([])

onMounted(async () => {
  const overview = await mockApi.analytics.getOverview()
  if (overview.success) stats.value = overview.data
  const sessions = await mockApi.sessions.getAll()
  recentSessions.value = sessions.items.slice(0, 5)
})

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
</script>

<template>
  <div class="home-page">
    <div class="page-header"><h1>Welcome to Enterprise Workspace</h1><p>AI-powered operations for your organization</p></div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-icon">💬</div><div class="stat-content"><div class="stat-value">{{ stats.totalSessions }}</div><div class="stat-label">Total Sessions</div></div></div>
      <div class="stat-card"><div class="stat-icon">📝</div><div class="stat-content"><div class="stat-value">{{ stats.totalMessages }}</div><div class="stat-label">Total Messages</div></div></div>
      <div class="stat-card"><div class="stat-icon">👥</div><div class="stat-content"><div class="stat-value">{{ stats.activeUsers }}</div><div class="stat-label">Active Users</div></div></div>
      <div class="stat-card"><div class="stat-icon">🎯</div><div class="stat-content"><div class="stat-value">{{ Math.round((stats.averageConfidence || 0) * 100) }}%</div><div class="stat-label">Avg. Confidence</div></div></div>
    </div>
    <div class="recent-section">
      <h2>Recent Sessions</h2>
      <div class="sessions-list">
        <div v-for="s in recentSessions" :key="s.id" class="session-card">
          <div class="session-info"><div class="session-id">{{ s.id.slice(0, 10) }}...</div><div class="session-model">{{ s.model }}</div></div>
          <div class="session-stats"><span>{{ s.tokens }} tokens</span><span>{{ s.latency }}s</span></div>
          <div class="session-date">{{ formatDate(s.createdAt) }}</div>
        </div>
      </div>
    </div>
    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div class="actions-grid">
        <router-link to="/agents" class="action-card"><div class="action-icon">🤖</div><div class="action-title">Start New Chat</div><div class="action-desc">Begin a conversation</div></router-link>
        <router-link to="/assets" class="action-card"><div class="action-icon">📁</div><div class="action-title">Upload Asset</div><div class="action-desc">Add documents</div></router-link>
        <router-link to="/knowledge" class="action-card"><div class="action-icon">📚</div><div class="action-title">Knowledge Base</div><div class="action-desc">Manage repositories</div></router-link>
        <router-link to="/analytics" class="action-card"><div class="action-icon">📊</div><div class="action-title">View Analytics</div><div class="action-desc">Track metrics</div></router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-page { max-width: 1200px; margin: 0 auto; }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 28px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px; }
.page-header p { font-size: 16px; color: var(--text-secondary); }
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 40px; }
.stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
.stat-card:hover { box-shadow: var(--shadow-md); }
.stat-icon { width: 48px; height: 48px; background-color: var(--bg-tertiary); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 24px; }
.stat-value { font-size: 24px; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 13px; color: var(--text-secondary); }
.recent-section { margin-bottom: 40px; }
.recent-section h2, .quick-actions h2 { font-size: 20px; font-weight: 600; color: var(--text-primary); margin-bottom: 16px; }
.sessions-list { display: flex; flex-direction: column; gap: 12px; }
.session-card { display: flex; align-items: center; gap: 24px; padding: 16px 20px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; }
.session-card:hover { border-color: var(--color-primary); }
.session-id { font-size: 14px; font-weight: 500; font-family: var(--font-mono); }
.session-model { font-size: 12px; color: var(--text-secondary); }
.session-stats { display: flex; gap: 16px; font-size: 13px; color: var(--text-secondary); }
.session-date { font-size: 13px; color: var(--text-tertiary); }
.actions-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.action-card { display: flex; flex-direction: column; align-items: center; padding: 24px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); text-decoration: none; transition: all 0.2s ease; }
.action-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-md); transform: translateY(-2px); }
.action-icon { font-size: 32px; margin-bottom: 12px; }
.action-title { font-size: 16px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; }
.action-desc { font-size: 13px; color: var(--text-secondary); text-align: center; }
</style>
