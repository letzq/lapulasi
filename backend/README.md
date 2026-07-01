# Enterprise Workspace AI 知识中心

基于 RAG（检索增强生成）技术的企业级知识管理平台，集成智能问答、文档管理、数据分析于一体。

## 功能特性

- **智能问答** — 基于知识库的 RAG 对话，支持 SSE 流式输出，自动引用来源文档
- **知识库管理** — 多知识库支持，文档上传（PDF/Word/Excel/TXT），自动分块向量化
- **会话管理** — 多会话历史，自动标题生成，消息持久化
- **数据看板** — 使用统计、Token 消耗、会话趋势等可视化分析
- **用户系统** — JWT 认证，角色权限（admin/user/viewer），个人设置

## 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | Vue 3 + TypeScript + Vite + Element Plus + ECharts + Pinia |
| **后端** | Node.js + Express + TypeScript (ESM) |
| **向量数据库** | ChromaDB (远程: `111.170.35.211:8000`) |
| **关系数据库** | MySQL 8.4 |
| **Embedding** | Ollama `qwen3-embedding:4b` (`localhost:11434`) |
| **LLM** | 小米模型 (OpenAI 兼容 API) |

## 项目结构

```
lapulasi/
├── frontend/                # Vue 3 前端
│   ├── src/
│   │   ├── api/             # API 调用层 (axios)
│   │   ├── components/      # 通用组件 (图表等)
│   │   ├── mock/            # Mock 数据
│   │   ├── router/          # Vue Router
│   │   ├── stores/          # Pinia 状态管理
│   │   ├── types/           # TypeScript 类型
│   │   └── views/           # 页面视图
│   │       ├── Agents.vue   # AI 对话界面 (SSE 流式)
│   │       ├── Home.vue     # 首页看板
│   │       ├── Knowledge.vue# 知识库管理
│   │       ├── Analytics.vue# 数据分析
│   │       ├── Assets.vue   # 资产管理
│   │       ├── Settings.vue # 系统设置
│   │       └── Login.vue    # 登录注册
│   └── package.json
├── backend/                 # Express 后端
│   ├── src/
│   │   ├── config/          # 配置 (数据库, AI 客户端)
│   │   ├── middleware/      # JWT 认证中间件
│   │   ├── routes/          # REST API 路由
│   │   ├── services/        # 业务逻辑层
│   │   │   ├── chatService.ts      # 对话编排
│   │   │   ├── ragChain.ts         # RAG 流水线
│   │   │   ├── vectorStore.ts      # ChromaDB 操作
│   │   │   ├── documentProcessor.ts# 文档解析分块
│   │   │   ├── embeddingService.ts # 向量嵌入
│   │   │   └── ...
│   │   └── types/           # TypeScript 类型
│   └── package.json
├── doc/                     # 文档
│   ├── API.md               # API 接口文档
│   └── init.sql             # 数据库初始化脚本
├── 原型图/                   # 设计稿
└── README.md
```

## 快速开始

### 环境要求

- Node.js >= 18
- MySQL 8.0+
- ChromaDB (远程或本地)
- Ollama (本地 Embedding 服务)

### 安装依赖

```bash
npm run install:all    # 同时安装前端和后端依赖
```

### 配置环境变量

**后端** (`backend/.env`):

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=lapulasi

LLM_API_KEY=your_api_key
LLM_BASE_URL=https://token-plan-cn.xiaomimimo.com/v1
LLM_MODEL=xiaomi-model

CHROMA_DB_URL=http://111.170.35.211:8000

JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

**前端** (`frontend/.env.development`):

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 初始化数据库

```bash
cd backend
npm run init-db        # 执行 init.sql 创建表结构和示例数据
```

### 启动服务

```bash
npm run dev            # 同时启动前端 (3000) 和后端 (8000)
```

或分别启动：

```bash
npm run dev:frontend   # http://localhost:3000
npm run dev:backend    # http://localhost:8000
```

### 默认账户

| 邮箱 | 密码 | 角色 |
|------|------|------|
| `admin@enterprise.com` | `admin123` | 管理员 |

> 注：若无法登录，请通过注册页面创建新账户。

## 核心流程

### RAG 对话流程

```
用户提问 → POST /api/rag/chat (SSE)
    ↓
chatService.streamMessage() 保存消息
    ↓
ragChain.streamAnswer()
    ├── ChromaDB 向量检索 (Top 3 相似文档块)
    ├── 组装上下文 + 对话历史
    └── 调用 LLM 流式生成
    ↓
SSE 事件流: chunk → sources → done
    ↓
前端 Agents.vue 实时渲染 + 引用来源展示
```

### 文档处理流程

```
上传文档 → POST /api/knowledge/:id/documents
    ↓
documentProcessor 解析 (PDF/Word/Excel/TXT)
    ↓
分块 (1000 字符, 200 重叠)
    ↓
embeddingService 生成向量 (Ollama qwen3-embedding)
    ↓
vectorStore 存入 ChromaDB
```

## API 接口

| 模块 | 端点 | 说明 |
|------|------|------|
| **认证** | `POST /api/auth/login` | 用户登录 |
| | `POST /api/auth/register` | 用户注册 |
| | `GET /api/auth/me` | 获取当前用户 |
| **会话** | `GET /api/sessions` | 会话列表 |
| | `POST /api/sessions` | 创建会话 |
| | `DELETE /api/sessions/:id` | 删除会话 |
| **消息** | `GET /api/messages?sessionId=` | 消息列表 |
| **RAG** | `POST /api/rag/chat` | 流式对话 (SSE) |
| | `POST /api/rag/search` | 向量检索 |
| **知识库** | `GET /api/knowledge` | 知识库列表 |
| | `POST /api/knowledge` | 创建知识库 |
| | `POST /api/knowledge/:id/documents` | 上传文档 |
| **分析** | `GET /api/analytics/stats` | 统计数据 |
| | `GET /api/analytics/trend` | 趋势分析 |

完整 API 文档见 [doc/API.md](doc/API.md)。

## 设计规范

- **主色**: `#3370ff`
- **侧边栏**: `#2b2f36`
- **页面背景**: `#f7f8fa`
- **字体**: Inter (UI) + JetBrains Mono (代码/数据)
- **设计语言**: 飞书风格，高密度信息展示，圆角卡片

详见 [原型图/DESIGN.md](原型图/DESIGN.md)。
