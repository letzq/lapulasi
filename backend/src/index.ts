/**
 * Enterprise Workspace 后端入口
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import { testConnection } from './config/database.js'
import { testChromaConnection } from './config/ai.js'

import { snakifyKeys } from './utils/transform.js'

import authRoutes from './routes/auth.js'
import sessionsRoutes from './routes/sessions.js'
import messagesRoutes from './routes/messages.js'
import knowledgeRoutes from './routes/knowledge.js'
import assetsRoutes from './routes/assets.js'
import ragRoutes from './routes/rag.js'
import analyticsRoutes from './routes/analytics.js'


// 加载环境变量
dotenv.config()

// ES 模块兼容
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 8000

// =====================================================
// 中间件
// =====================================================

app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 请求体 camelCase → snake_case 自动转换
app.use((req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = snakifyKeys(req.body)
  }
  next()
})

// 静态文件（上传的文件）
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// =====================================================
// 路由
// =====================================================

app.use('/api/auth', authRoutes)
app.use('/api/sessions', sessionsRoutes)
app.use('/api/messages', messagesRoutes)
app.use('/api/knowledge', knowledgeRoutes)
app.use('/api/assets', assetsRoutes)
app.use('/api/rag', ragRoutes)
app.use('/api/analytics', analyticsRoutes)


// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      chromadb: 'connected'
    }
  })
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

// =====================================================
// 启动服务器
// =====================================================

async function startServer() {
  // 测试数据库连接
  const dbConnected = await testConnection()
  if (!dbConnected) {
    console.error('❌ Failed to connect to database')
    process.exit(1)
  }

  // 测试 ChromaDB 连接
  await testChromaConnection()

  // 启动服务器
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`📦 API Base URL: http://localhost:${PORT}/api`)
  })
}

startServer().catch(console.error)

export default app
