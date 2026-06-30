/**
 * 数据库配置模块
 * 使用 MySQL 连接池
 */

import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// 数据库连接配置
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lapulasi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
}

// 创建连接池
const pool = mysql.createPool(dbConfig)

// 测试数据库连接
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection()
    console.log('✅ MySQL connected successfully')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ MySQL connection failed:', error)
    return false
  }
}

// 执行查询
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params)
  return rows as T
}

// 执行单条查询
export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T[]>(sql, params)
  return rows[0] || null
}

// 执行插入/更新/删除
export async function execute(sql: string, params?: any[]): Promise<any> {
  const [result] = await pool.execute(sql, params)
  return result
}

// 获取事务连接
export async function getConnection() {
  return await pool.getConnection()
}

export default pool
