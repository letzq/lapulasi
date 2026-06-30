import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// Mock 用户数据
const mockUsers = [
  {
    id: 'user-001',
    name: '张三',
    email: 'zhangsan@enterprise.com',
    password: 'password',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan',
    role: 'admin' as const,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// Mock token 存储
const mockTokens = new Map<string, string>()

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body

  const user = mockUsers.find(u => u.email === email && u.password === password)
  if (!user) {
    res.status(401).json({
      success: false,
      data: { user: null, token: '' },
      error: 'Invalid credentials'
    })
    return
  }

  const token = `jwt-${uuidv4()}`
  mockTokens.set(token, user.id)

  const { password: _, ...userWithoutPassword } = user

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      token
    }
  })
})

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body

  if (mockUsers.find(u => u.email === email)) {
    res.status(400).json({
      success: false,
      data: null,
      error: 'Email already exists'
    })
    return
  }

  const newUser = {
    id: `user-${uuidv4().slice(0, 8)}`,
    name,
    email,
    password,
    role: 'user' as const,
    createdAt: new Date(),
    updatedAt: new Date()
  }

  mockUsers.push(newUser)

  const { password: _, ...userWithoutPassword } = newUser

  res.status(201).json({
    success: true,
    data: userWithoutPassword
  })
})

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.json({ success: true, data: null })
})

// GET /api/auth/profile
router.get('/profile', (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    res.status(401).json({ success: false, error: 'Unauthorized' })
    return
  }

  const userId = mockTokens.get(token)
  if (!userId) {
    res.status(401).json({ success: false, error: 'Invalid token' })
    return
  }

  const user = mockUsers.find(u => u.id === userId)
  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' })
    return
  }

  const { password: _, ...userWithoutPassword } = user

  res.json({
    success: true,
    data: userWithoutPassword
  })
})

export default router
