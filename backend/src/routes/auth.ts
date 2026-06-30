import { Router, Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query, queryOne, execute } from '../config/database.js'
import { successResponse, errorResponse, camelizeKeys } from '../utils/transform.js'

const router = Router()

const JWT_SECRET = process.env.JWT_SECRET || 'enterprise-workspace-secret-key'

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: '邮箱和密码不能为空'
      })
      return
    }

    // 从数据库查询用户
    const user = await queryOne(
      'SELECT id, name, email, password_hash, avatar, role, is_active FROM users WHERE email = ?',
      [email]
    )

    if (!user) {
      res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
      })
      return
    }

    // 检查账户是否激活
    if (!user.is_active) {
      res.status(403).json({
        success: false,
        error: '账户已被禁用'
      })
      return
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
      })
      return
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 更新最后登录时间
    await execute(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    )

    // 返回用户信息（不包含密码）
    const { password_hash, ...userWithoutPassword } = user

    res.json(successResponse({
      user: camelizeKeys(userWithoutPassword),
      token
    }))
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    })
  }
})

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        error: '姓名、邮箱和密码不能为空'
      })
      return
    }

    // 检查邮箱是否已存在
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: '该邮箱已被注册'
      })
      return
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // 创建用户
    const userId = uuidv4()
    await execute(
      'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [userId, name, email, passwordHash, 'user']
    )

    // 生成 JWT token
    const token = jwt.sign(
      { userId, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 查询创建的用户
    const newUser = await queryOne(
      'SELECT id, name, email, avatar, role, created_at FROM users WHERE id = ?',
      [userId]
    )

    res.status(201).json(successResponse({
      user: camelizeKeys(newUser),
      token
    }))
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      error: '服务器内部错误'
    })
  }
})

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      res.status(401).json({ success: false, error: '未提供认证令牌' })
      return
    }

    // 验证 token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    // 查询用户信息
    const user = await queryOne(
      'SELECT id, name, email, avatar, role, is_active, last_login_at, created_at FROM users WHERE id = ?',
      [decoded.userId]
    )

    if (!user) {
      res.status(404).json({ success: false, error: '用户不存在' })
      return
    }

    if (!user.is_active) {
      res.status(403).json({ success: false, error: '账户已被禁用' })
      return
    }

    res.json(successResponse(user))
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json(errorResponse('无效的认证令牌'))
      return
    }
    console.error('Get user info error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// PUT /api/auth/me
router.put('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      res.status(401).json({ success: false, error: '未提供认证令牌' })
      return
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const { name, avatar } = req.body

    // 动态构建更新语句
    const updates: string[] = []
    const params: any[] = []
    if (name !== undefined) { updates.push('name = ?'); params.push(name) }
    if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar) }

    if (updates.length > 0) {
      params.push(decoded.userId)
      await execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params)
    }

    const updatedUser = await queryOne(
      'SELECT id, name, email, avatar, role, created_at FROM users WHERE id = ?',
      [decoded.userId]
    )

    res.json(successResponse(updatedUser))
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// PUT /api/auth/password
router.put('/password', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      res.status(401).json(errorResponse('未提供认证令牌'))
      return
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    const { oldPassword, old_password, newPassword, new_password } = req.body
    const oldPwd = oldPassword || old_password
    const newPwd = newPassword || new_password

    if (!oldPwd || !newPwd) {
      res.status(400).json(errorResponse('旧密码和新密码不能为空'))
      return
    }

    if (newPwd.length < 6) {
      res.status(400).json(errorResponse('新密码长度不能少于6位'))
      return
    }

    const user = await queryOne('SELECT id, password_hash FROM users WHERE id = ?', [decoded.userId])
    if (!user) {
      res.status(404).json(errorResponse('用户不存在'))
      return
    }

    const isValid = await bcrypt.compare(oldPwd, user.password_hash)
    if (!isValid) {
      res.status(400).json(errorResponse('旧密码错误'))
      return
    }

    const salt = await bcrypt.genSalt(10)
    const newHash = await bcrypt.hash(newPwd, salt)
    await execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, decoded.userId])

    res.json(successResponse(null))
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json(errorResponse('服务器内部错误'))
  }
})

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response) => {
  res.json(successResponse(null))
})

export default router
