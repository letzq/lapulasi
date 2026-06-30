import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'

import authRoutes from './routes/auth.js'
import sessionsRoutes from './routes/sessions.js'
import messagesRoutes from './routes/messages.js'
import assetsRoutes from './routes/assets.js'
import agentsRoutes from './routes/agents.js'
import knowledgeBasesRoutes from './routes/knowledgeBases.js'
import analyticsRoutes from './routes/analytics.js'

// 加载环境变量
dotenv.config()

const app = express()
const PORT = process.env.PORT || 8000

// 中间件
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionsRoutes)
app.use('/api/sessions', messagesRoutes)
app.use('/api/assets', assetsRoutes)
app.use('/api/agents', agentsRoutes)
app.use('/api/knowledge-bases', knowledgeBasesRoutes)
app.use('/api/analytics', analyticsRoutes)

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 处理
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' })
})

// 错误处理
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ success: false, error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app
