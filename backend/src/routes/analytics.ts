import { Router } from 'express'

const router = Router()

// Mock 分析数据
const mockAnalytics = {
  overview: {
    totalSessions: 1256,
    totalMessages: 4892,
    averageLatency: 1.1,
    averageConfidence: 0.92,
    activeUsers: 89,
    topModels: [
      { model: 'GPT-4-Enterprise', usage: 756 },
      { model: 'Claude-3-Enterprise', usage: 500 }
    ]
  },
  usage: {
    daily: [
      { date: '2024-06-23', sessions: 145, messages: 567 },
      { date: '2024-06-24', sessions: 189, messages: 723 },
      { date: '2024-06-25', sessions: 167, messages: 645 },
      { date: '2024-06-26', sessions: 201, messages: 789 },
      { date: '2024-06-27', sessions: 178, messages: 698 },
      { date: '2024-06-28', sessions: 156, messages: 612 },
      { date: '2024-06-29', sessions: 67, messages: 258 }
    ]
  }
}

// GET /api/analytics/overview
router.get('/overview', (_req, res) => {
  res.json({
    success: true,
    data: mockAnalytics.overview
  })
})

// GET /api/analytics/usage
router.get('/usage', (_req, res) => {
  res.json({
    success: true,
    data: mockAnalytics.usage
  })
})

// POST /api/analytics/query
router.post('/query', (req, res) => {
  const { startDate, endDate, metrics } = req.body

  // 模拟查询结果
  const result = {
    startDate,
    endDate,
    metrics: metrics || ['sessions', 'messages'],
    data: mockAnalytics.usage.daily.filter(d => {
      const date = new Date(d.date)
      return date >= new Date(startDate) && date <= new Date(endDate)
    })
  }

  res.json({
    success: true,
    data: result
  })
})

export default router
