<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElCard, ElRow, ElCol, ElStatistic } from 'element-plus'
import {
  ChatDotRound,
  EditPen,
  Timer,
  Aim,
  DataAnalysis
} from '@element-plus/icons-vue'
import { LineChart, BarChart, PieChart, GaugeChart } from '@/components/charts'
import {
  getOverview,
  getDailyStats,
  getModelStats,
  type OverviewStats,
  type DailyStats,
  type ModelStats
} from '@/api/analytics'

const loading = ref(false)
const overview = ref<OverviewStats>({
  totalSessions: 0,
  totalMessages: 0,
  activeUsers: 0,
  averageConfidence: 0,
  totalTokens: 0,
  averageLatency: 0
})
const dailyStats = ref<DailyStats[]>([])
const modelStats = ref<ModelStats[]>([])

// 图表数据
const lineChartData = ref({
  xData: [] as string[],
  series: [
    { name: '会话数', data: [] as number[] },
    { name: '消息数', data: [] as number[] }
  ]
})

const barChartData = ref({
  xData: [] as string[],
  series: [
    { name: 'Token 使用量', data: [] as number[] }
  ]
})

const pieChartData = ref<{ name: string; value: number }[]>([])

onMounted(async () => {
  loading.value = true
  try {
    const [overviewData, dailyData, modelData] = await Promise.all([
      getOverview(),
      getDailyStats(),
      getModelStats()
    ])

    overview.value = overviewData
    dailyStats.value = dailyData
    modelStats.value = modelData

    // 处理折线图数据
    lineChartData.value = {
      xData: dailyData.map(d => {
        const date = new Date(d.date)
        return `${date.getMonth() + 1}/${date.getDate()}`
      }),
      series: [
        { name: '会话数', data: dailyData.map(d => d.sessions) },
        { name: '消息数', data: dailyData.map(d => d.messages) }
      ]
    }

    // 处理柱状图数据
    barChartData.value = {
      xData: dailyData.map(d => {
        const date = new Date(d.date)
        return `${date.getMonth() + 1}/${date.getDate()}`
      }),
      series: [
        { name: 'Token 使用量', data: dailyData.map(d => d.tokens) }
      ]
    }

    // 处理饼图数据
    pieChartData.value = modelData.map(m => ({
      name: m.model,
      value: m.count
    }))
  } catch (error) {
    console.error('Failed to load analytics:', error)
  } finally {
    loading.value = false
  }
})

const statCards = [
  { key: 'totalSessions', label: '总会话数', icon: ChatDotRound, color: '#3370ff' },
  { key: 'totalMessages', label: '总消息数', icon: EditPen, color: '#34c759' },
  { key: 'averageLatency', label: '平均延迟', icon: Timer, color: '#ff9500', unit: 's' },
  { key: 'averageConfidence', label: '平均置信度', icon: Aim, color: '#f53f3f', isPercent: true }
]
</script>

<template>
  <div class="analytics-page" v-loading="loading">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1>数据分析</h1>
      <p>查看使用情况、性能指标和洞察</p>
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
                {{ stat.isPercent
                  ? Math.round((overview[stat.key as keyof OverviewStats] || 0) * 100) + '%'
                  : (overview[stat.key as keyof OverviewStats] || 0) + (stat.unit || '')
                }}
              </div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="24" class="charts-row">
      <!-- 会话趋势 -->
      <el-col :span="16">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">
                <el-icon><DataAnalysis /></el-icon>
                会话趋势
              </span>
            </div>
          </template>
          <LineChart :data="lineChartData" height="300px" />
        </el-card>
      </el-col>

      <!-- 模型使用分布 -->
      <el-col :span="8">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">模型使用分布</span>
            </div>
          </template>
          <PieChart :data="pieChartData" height="300px" />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <!-- Token 使用量 -->
      <el-col :span="16">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">Token 使用量</span>
            </div>
          </template>
          <BarChart :data="barChartData" height="250px" />
        </el-card>
      </el-col>

      <!-- 置信度仪表盘 -->
      <el-col :span="8">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">平均置信度</span>
            </div>
          </template>
          <GaugeChart
            :value="Math.round((overview.averageConfidence || 0) * 100)"
            height="250px"
            title="置信度指标"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 模型统计表格 -->
    <el-card class="table-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">模型使用统计</span>
        </div>
      </template>
      <el-table :data="modelStats" style="width: 100%">
        <el-table-column prop="model" label="模型名称" min-width="200" />
        <el-table-column prop="count" label="使用次数" width="120" align="center" />
        <el-table-column prop="percentage" label="使用占比" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.percentage > 50 ? 'success' : row.percentage > 20 ? 'primary' : 'info'">
              {{ row.percentage }}%
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="使用趋势" min-width="200">
          <template #default="{ row }">
            <div class="usage-bar">
              <div class="usage-bar-fill" :style="{ width: row.percentage + '%' }"></div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.analytics-page {
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

.charts-row {
  margin-bottom: 24px;
}

.chart-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
  height: 100%;
}

.chart-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color-light);
}

.chart-card :deep(.el-card__body) {
  padding: 20px;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-title .el-icon {
  color: var(--color-primary);
}

.table-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
}

.table-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color-light);
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

.usage-bar {
  height: 8px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-round);
  overflow: hidden;
}

.usage-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), #5590ff);
  border-radius: var(--radius-round);
  transition: width var(--transition-normal);
}
</style>
