/**
 * 数据库初始化脚本
 * 用于创建测试用户和初始数据
 */

import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { query, queryOne, execute, testConnection } from '../config/database.js'

async function initDatabase() {
  console.log('🔧 开始初始化数据库...')

  // 测试数据库连接
  const connected = await testConnection()
  if (!connected) {
    console.error('❌ 数据库连接失败')
    process.exit(1)
  }

  try {
    // 生成密码哈希
    const password = 'password'
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)
    console.log('✅ 密码哈希生成成功')

    // 检查测试用户是否存在
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = ?',
      ['zhangsan@enterprise.com']
    )

    if (existingUser) {
      // 更新密码
      await execute(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [passwordHash, 'zhangsan@enterprise.com']
      )
      console.log('✅ 测试用户密码已更新')
    } else {
      // 创建测试用户
      const userId = uuidv4()
      await execute(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
        [userId, '张三', 'zhangsan@enterprise.com', passwordHash, 'admin']
      )
      console.log('✅ 测试用户创建成功')
    }

    // 更新管理员密码
    const adminExists = await queryOne(
      'SELECT id FROM users WHERE email = ?',
      ['admin@enterprise.com']
    )

    if (adminExists) {
      await execute(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [passwordHash, 'admin@enterprise.com']
      )
      console.log('✅ 管理员密码已更新')
    }

    // 查询所有用户
    const users = await query('SELECT id, name, email, role FROM users')
    console.log('\n📋 当前用户列表:')
    users.forEach((user: any) => {
      console.log(`  - ${user.name} (${user.email}) - ${user.role}`)
    })

    console.log('\n✨ 数据库初始化完成！')
    console.log('\n📝 测试账号:')
    console.log('  邮箱: zhangsan@enterprise.com')
    console.log('  密码: password')
    console.log('\n  邮箱: admin@enterprise.com')
    console.log('  密码: password')

  } catch (error) {
    console.error('❌ 初始化失败:', error)
  } finally {
    process.exit(0)
  }
}

initDatabase()
