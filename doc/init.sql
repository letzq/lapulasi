-- =====================================================
-- Enterprise Workspace 数据库初始化脚本
-- 数据库: MySQL 8.0+
-- 字符集: utf8mb4
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS lapulasi
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE lapulasi;

-- =====================================================
-- 删除已存在的表（按依赖顺序）
-- =====================================================
DROP TABLE IF EXISTS usage_stats;
DROP TABLE IF EXISTS document_chunks;
DROP TABLE IF EXISTS message_sources;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS agents;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS knowledge_bases;
DROP TABLE IF EXISTS users;

-- =====================================================
-- 1. 用户表 (users)
-- 存储系统用户信息，包括认证信息和角色权限
-- =====================================================
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY COMMENT '用户ID，UUID格式',
    name VARCHAR(100) NOT NULL COMMENT '用户姓名',
    email VARCHAR(255) UNIQUE NOT NULL COMMENT '用户邮箱，用于登录',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希值，使用bcrypt加密',
    avatar VARCHAR(500) COMMENT '用户头像URL',
    role ENUM('admin', 'user', 'viewer') DEFAULT 'user' COMMENT '用户角色：admin-管理员, user-普通用户, viewer-只读用户',
    is_active TINYINT(1) DEFAULT 1 COMMENT '账户是否激活：1-激活, 0-禁用',
    last_login_at DATETIME COMMENT '最后登录时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表，存储系统用户信息';

-- =====================================================
-- 2. 会话表 (sessions)
-- 存储用户与AI的对话会话信息
-- =====================================================
CREATE TABLE sessions (
    id CHAR(36) PRIMARY KEY COMMENT '会话ID，UUID格式',
    user_id CHAR(36) NOT NULL COMMENT '所属用户ID',
    title VARCHAR(255) COMMENT '会话标题，用户可自定义',
    model VARCHAR(100) NOT NULL DEFAULT 'gpt-4' COMMENT '使用的AI模型名称',
    status ENUM('active', 'completed', 'failed') DEFAULT 'active' COMMENT '会话状态：active-进行中, completed-已完成, failed-失败',
    total_tokens INT DEFAULT 0 COMMENT '会话消耗的总token数',
    avg_latency DECIMAL(5,2) DEFAULT 0 COMMENT '平均响应延迟（秒）',
    metadata JSON COMMENT '扩展元数据，JSON格式',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_sessions_user_id (user_id),
    INDEX idx_sessions_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='会话表，存储用户对话会话';

-- =====================================================
-- 3. 知识库表 (knowledge_bases)
-- 存储知识库信息，用于RAG文档检索
-- =====================================================
CREATE TABLE knowledge_bases (
    id CHAR(36) PRIMARY KEY COMMENT '知识库ID，UUID格式',
    user_id CHAR(36) NOT NULL COMMENT '创建者用户ID',
    name VARCHAR(255) NOT NULL COMMENT '知识库名称',
    description TEXT COMMENT '知识库描述',
    status ENUM('active', 'indexing', 'error') DEFAULT 'active' COMMENT '状态：active-正常, indexing-索引中, error-错误',
    document_count INT DEFAULT 0 COMMENT '文档数量',
    total_tokens INT DEFAULT 0 COMMENT '总token数',
    config JSON COMMENT '知识库配置，JSON格式',
    metadata JSON COMMENT '扩展元数据，JSON格式',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_knowledge_bases_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='知识库表，存储RAG知识库信息';

-- =====================================================
-- 4. 文档表 (documents)
-- 存储上传到知识库的文档信息
-- =====================================================
CREATE TABLE documents (
    id CHAR(36) PRIMARY KEY COMMENT '文档ID，UUID格式',
    knowledge_base_id CHAR(36) NOT NULL COMMENT '所属知识库ID',
    user_id CHAR(36) NOT NULL COMMENT '上传者用户ID',
    name VARCHAR(255) NOT NULL COMMENT '文档名称',
    file_path VARCHAR(500) COMMENT '文件存储路径',
    file_size BIGINT COMMENT '文件大小（字节）',
    mime_type VARCHAR(100) COMMENT 'MIME类型，如 application/pdf',
    status ENUM('active', 'processing', 'error') DEFAULT 'active' COMMENT '状态：active-正常, processing-处理中, error-错误',
    chunk_count INT DEFAULT 0 COMMENT '文档分块数量',
    total_tokens INT DEFAULT 0 COMMENT '文档总token数',
    error_message TEXT COMMENT '错误信息，处理失败时记录',
    metadata JSON COMMENT '扩展元数据，JSON格式',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_documents_knowledge_base_id (knowledge_base_id),
    INDEX idx_documents_user_id (user_id),
    FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档表，存储知识库中的文档';

-- =====================================================
-- 5. 消息表 (messages)
-- 存储对话消息，包括用户提问和AI回复
-- =====================================================
CREATE TABLE messages (
    id CHAR(36) PRIMARY KEY COMMENT '消息ID，UUID格式',
    session_id CHAR(36) NOT NULL COMMENT '所属会话ID',
    role ENUM('user', 'assistant', 'system') NOT NULL COMMENT '消息角色：user-用户, assistant-AI助手, system-系统',
    content TEXT NOT NULL COMMENT '消息内容',
    tokens INT DEFAULT 0 COMMENT '消息消耗的token数',
    latency DECIMAL(5,2) DEFAULT 0 COMMENT '响应延迟（秒）',
    confidence DECIMAL(3,2) COMMENT 'AI回复的置信度，范围0-1',
    metadata JSON COMMENT '扩展元数据，如模型信息、来源等',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_messages_session_id (session_id),
    INDEX idx_messages_created_at (created_at),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息表，存储对话消息';

-- =====================================================
-- 6. 消息来源表 (message_sources)
-- 存储AI回复引用的文档来源
-- =====================================================
CREATE TABLE message_sources (
    id CHAR(36) PRIMARY KEY COMMENT '来源ID，UUID格式',
    message_id CHAR(36) NOT NULL COMMENT '关联的消息ID',
    document_id CHAR(36) COMMENT '引用的文档ID',
    chunk_id VARCHAR(100) COMMENT '引用的文档分块ID',
    title VARCHAR(255) NOT NULL COMMENT '来源标题',
    content TEXT COMMENT '来源内容摘要',
    url VARCHAR(500) COMMENT '来源链接',
    relevance DECIMAL(3,2) NOT NULL COMMENT '相关度评分，范围0-1',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_message_sources_message_id (message_id),
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息来源表，存储AI回复引用的文档来源';

-- =====================================================
-- 7. 资产表 (assets)
-- 存储用户上传的各类资产（文档、数据集、模型等）
-- =====================================================
CREATE TABLE assets (
    id CHAR(36) PRIMARY KEY COMMENT '资产ID，UUID格式',
    user_id CHAR(36) NOT NULL COMMENT '所有者用户ID',
    name VARCHAR(255) NOT NULL COMMENT '资产名称',
    type ENUM('document', 'dataset', 'model', 'agent') NOT NULL COMMENT '资产类型：document-文档, dataset-数据集, model-模型, agent-智能体',
    status ENUM('active', 'inactive', 'processing', 'error') DEFAULT 'active' COMMENT '状态：active-正常, inactive-停用, processing-处理中, error-错误',
    description TEXT COMMENT '资产描述',
    file_path VARCHAR(500) COMMENT '文件存储路径',
    file_size BIGINT COMMENT '文件大小（字节）',
    mime_type VARCHAR(100) COMMENT 'MIME类型',
    metadata JSON COMMENT '扩展元数据，JSON格式',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_assets_user_id (user_id),
    INDEX idx_assets_type (type),
    INDEX idx_assets_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='资产表，存储用户上传的各类资产';

-- =====================================================
-- 8. Agent 表 (agents)
-- 存储AI智能体配置信息
-- =====================================================
CREATE TABLE agents (
    id CHAR(36) PRIMARY KEY COMMENT 'Agent ID，UUID格式',
    user_id CHAR(36) NOT NULL COMMENT '创建者用户ID',
    name VARCHAR(255) NOT NULL COMMENT 'Agent名称',
    description TEXT COMMENT 'Agent描述',
    model VARCHAR(100) NOT NULL COMMENT '使用的AI模型',
    status ENUM('active', 'inactive', 'training', 'error') DEFAULT 'active' COMMENT '状态：active-正常, inactive-停用, training-训练中, error-错误',
    system_prompt TEXT COMMENT '系统提示词，定义Agent行为',
    capabilities JSON COMMENT '能力列表，JSON数组格式',
    config JSON COMMENT '配置信息，JSON格式',
    metadata JSON COMMENT '扩展元数据，JSON格式',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_agents_user_id (user_id),
    INDEX idx_agents_status (status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Agent表，存储AI智能体配置';

-- =====================================================
-- 9. 文档分块表 (document_chunks)
-- 存储文档分块信息，用于向量化和检索
-- =====================================================
CREATE TABLE document_chunks (
    id CHAR(36) PRIMARY KEY COMMENT '分块ID，UUID格式',
    document_id CHAR(36) NOT NULL COMMENT '所属文档ID',
    content TEXT NOT NULL COMMENT '分块内容',
    chunk_index INT NOT NULL COMMENT '分块索引，从0开始',
    tokens INT DEFAULT 0 COMMENT '分块token数',
    metadata JSON COMMENT '扩展元数据，如页码、章节等',
    embedding_id VARCHAR(100) COMMENT 'ChromaDB中的向量ID，用于检索',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_document_chunks_document_id (document_id),
    INDEX idx_document_chunks_embedding_id (embedding_id),
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文档分块表，存储文档分块信息';

-- =====================================================
-- 10. 使用统计表 (usage_stats)
-- 存储每日使用统计数据
-- =====================================================
CREATE TABLE usage_stats (
    id CHAR(36) PRIMARY KEY COMMENT '统计ID，UUID格式',
    user_id CHAR(36) COMMENT '用户ID，为空表示系统级统计',
    date DATE NOT NULL COMMENT '统计日期',
    sessions_count INT DEFAULT 0 COMMENT '当日会话数',
    messages_count INT DEFAULT 0 COMMENT '当日消息数',
    tokens_used INT DEFAULT 0 COMMENT '当日消耗token数',
    api_calls INT DEFAULT 0 COMMENT '当日API调用次数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_usage_stats_user_date (user_id, date),
    INDEX idx_usage_stats_date (date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='使用统计表，存储每日使用数据';

-- =====================================================
-- 初始数据
-- =====================================================

-- 默认管理员用户 (密码: admin123, 使用 bcrypt 加密)
INSERT INTO users (id, name, email, password_hash, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', '管理员', 'admin@enterprise.com', '$2b$10$YourHashedPasswordHere', 'admin');

-- 示例用户
INSERT INTO users (id, name, email, password_hash, role) VALUES
('660e8400-e29b-41d4-a716-446655440001', '张三', 'zhangsan@enterprise.com', '$2b$10$YourHashedPasswordHere', 'user');

-- 示例知识库
INSERT INTO knowledge_bases (id, user_id, name, description) VALUES
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', '企业政策库', '企业政策和合规文档'),
('780e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', '技术文档库', '内部技术文档和 API 参考');

-- 示例 Agent
INSERT INTO agents (id, user_id, name, description, model, capabilities) VALUES
('880e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Knowledge Agent', '基于 RAG 的知识检索 Agent', 'gpt-4', '["document-retrieval", "citation", "summarization"]'),
('890e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440000', 'Code Assistant', 'AI 代码审查和生成助手', 'claude-3', '["code-review", "code-generation", "refactoring"]');

-- 示例会话
INSERT INTO sessions (id, user_id, title, model, status, total_tokens) VALUES
('990e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440001', 'Q3 合规讨论', 'gpt-4', 'active', 428);

-- 示例消息
INSERT INTO messages (id, session_id, role, content, tokens, confidence) VALUES
('aa0e8400-e29b-41d4-a716-446655440007', '990e8400-e29b-41d4-a716-446655440006', 'user', '请总结 Q3 基础设施合规要求', 25, NULL),
('bb0e8400-e29b-41d4-a716-446655440008', '990e8400-e29b-41d4-a716-446655440006', 'assistant', '根据提供的公司政策，Q3 基础设施合规审计重点关注三个主要方面：\n\n1. **传输中数据加密**：所有内部 API 必须在 9 月底前强制使用 TLS 1.3。\n\n2. **访问控制日志**：系统审计日志必须在不可变存储中保留至少 365 天。\n\n3. **漏洞补丁 SLA**：关键 CVE 必须在披露后 72 小时内修复。', 285, 0.94);

-- 示例资产
INSERT INTO assets (id, user_id, name, type, status, description, file_size) VALUES
('cc0e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440000', '企业安全策略', 'document', 'active', '企业安全策略文档 v2.3', 2048576),
('dd0e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', '客户数据库', 'dataset', 'active', '生产环境客户数据快照', 104857600);

-- =====================================================
-- 完成
-- =====================================================
SELECT 'Database initialization completed!' AS status;
SELECT CONCAT('Created tables: ', COUNT(*)) AS info FROM information_schema.tables WHERE table_schema = 'lapulasi';
