<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { mockApi } from '@/mock/api'

const overview = ref<any>({})
const usage = ref<any>({})
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const o = await mockApi.analytics.getOverview(); if (o.success) overview.value = o.data
    const u = await mockApi.analytics.getUsage(); if (u.success) usage.value = u.data
  } finally { loading.value = false }
})

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
</script>

<template>
  <div class="analytics-page">
    <div class="page-header"><h1>Analytics</h1><p>Track usage, performance, and insights</p></div>
    <div class="overview-section">
      <h2>Overview</h2>
      <div class="overview-grid">
        <div class="overview-card"><div class="overview-icon">💬</div><div class="overview-content"><div class="overview-value">{{ overview.totalSessions || 0 }}</div><div class="overview-label">Total Sessions</div></div></div>
        <div class="overview-card"><div class="overview-icon">📝</div><div class="overview-content"><div class="overview-value">{{ overview.totalMessages || 0 }}</div><div class="overview-label">Total Messages</div></div></div>
        <div class="overview-card"><div class="overview-icon">⏱️</div><div class="overview-content"><div class="overview-value">{{ overview.averageLatency || 0 }}s</div><div class="overview-label">Avg. Latency</div></div></div>
        <div class="overview-card"><div class="overview-icon">🎯</div><div class="overview-content"><div class="overview-value">{{ Math.round((overview.averageConfidence || 0) * 100) }}%</div><div class="overview-label">Avg. Confidence</div></div></div>
      </div>
    </div>
    <div class="models-section">
      <h2>Model Usage</h2>
      <div class="models-list">
        <div v-for="m in overview.topModels || []" :key="m.model" class="model-card">
          <div class="model-name">{{ m.model }}</div>
          <div class="model-bar"><div class="model-bar-fill" :style="{ width: `${(m.usage / (overview.totalSessions || 1)) * 100}%` }"></div></div>
          <div class="model-usage">{{ m.usage }} sessions</div>
        </div>
      </div>
    </div>
    <div class="usage-section">
      <h2>Daily Usage (Last 7 Days)</h2>
      <div class="usage-chart">
        <div v-for="day in usage.daily || []" :key="day.date" class="usage-bar">
          <div class="bar-container">
            <div class="bar sessions-bar" :style="{ height: `${(day.sessions / 250) * 100}%` }" :title="`${day.sessions} sessions`"></div>
            <div class="bar messages-bar" :style="{ height: `${(day.messages / 1000) * 100}%` }" :title="`${day.messages} messages`"></div>
          </div>
          <div class="bar-label">{{ formatDate(day.date) }}</div>
        </div>
      </div>
      <div class="chart-legend">
        <span class="legend-item"><span class="legend-color sessions-color"></span>Sessions</span>
        <span class="legend-item"><span class="legend-color messages-color"></span>Messages</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analytics-page { max-width: 1200px; margin: 0 auto; }
.page-header { margin-bottom: 32px; }
.page-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.page-header p { font-size: 16px; color: var(--text-secondary); }
.overview-section, .models-section, .usage-section { margin-bottom: 40px; }
.overview-section h2, .models-section h2, .usage-section h2 { font-size: 20px; font-weight: 600; margin-bottom: 16px; }
.overview-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.overview-card { display: flex; align-items: center; gap: 16px; padding: 20px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
.overview-icon { width: 48px; height: 48px; background-color: var(--bg-tertiary); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 24px; }
.overview-value { font-size: 24px; font-weight: 700; }
.overview-label { font-size: 13px; color: var(--text-secondary); }
.models-list { display: flex; flex-direction: column; gap: 12px; }
.model-card { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
.model-name { width: 180px; font-size: 14px; font-weight: 500; }
.model-bar { flex: 1; height: 8px; background-color: var(--bg-tertiary); border-radius: var(--radius-full); overflow: hidden; }
.model-bar-fill { height: 100%; background: linear-gradient(90deg, var(--color-primary), #3b82f6); border-radius: var(--radius-full); }
.model-usage { width: 100px; text-align: right; font-size: 13px; color: var(--text-secondary); }
.usage-chart { display: flex; align-items: flex-end; gap: 12px; height: 200px; padding: 20px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
.usage-bar { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; }
.bar-container { flex: 1; display: flex; align-items: flex-end; gap: 4px; width: 100%; }
.bar { flex: 1; min-height: 4px; border-radius: var(--radius-sm) var(--radius-sm) 0 0; }
.sessions-bar { background: linear-gradient(180deg, var(--color-primary), #3b82f6); }
.messages-bar { background: linear-gradient(180deg, #22c55e, #16a34a); }
.bar-label { font-size: 11px; color: var(--text-tertiary); }
.chart-legend { display: flex; justify-content: center; gap: 24px; margin-top: 16px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
.legend-color { width: 12px; height: 12px; border-radius: var(--radius-sm); }
.sessions-color { background: linear-gradient(180deg, var(--color-primary), #3b82f6); }
.messages-color { background: linear-gradient(180deg, #22c55e, #16a34a); }
</style>
