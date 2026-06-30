# Enterprise Workspace - AI Operations

全栈 AI 知识中心对话界面，包含前端 (Vue 3) 和后端 (Node.js + Express)。

## 项目结构

```
lapulasi/
├── frontend/           # 前端项目 (Vue 3 + Vite + TypeScript)
│   ├── src/
│   │   ├── api/        # API 接口
│   │   ├── mock/       # Mock 数据
│   │   ├── router/     # 路由
│   │   ├── stores/     # 状态管理
│   │   ├── types/      # 类型定义
│   │   └── views/      # 页面组件
│   ├── package.json
│   └── vite.config.ts
│
├── backend/            # 后端项目 (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── routes/     # API 路由
│   │   └── types/      # 类型定义
│   ├── package.json
│   └── tsconfig.json
│
└── package.json        # 根配置 (用于同时启动前后端)
```

## 快速开始

### 1. 安装所有依赖

```bash
npm run install:all
```

### 2. 启动开发服务器

```bash
npm run dev
```

这会同时启动：
- **前端**: http://localhost:3000
- **后端**: http://localhost:8000

### 3. 单独启动

```bash
# 仅启动前端
npm run dev:frontend

# 仅启动后端
npm run dev:backend
```

## 技术栈

### 前端
- **框架**: Vue 3 + Composition API
- **构建**: Vite
- **语言**: TypeScript
- **状态**: Pinia
- **路由**: Vue Router 4
- **HTTP**: Axios

### 后端
- **框架**: Express.js
- **语言**: TypeScript
- **工具**: tsx (开发热重载)
- **中间件**: CORS, Helmet, Morgan

## API 接口

### 认证
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 登录 |
| POST | /api/auth/register | 注册 |
| GET | /api/auth/profile | 获取用户信息 |

### 会话
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/sessions | 获取会话列表 |
| GET | /api/sessions/:id | 获取单个会话 |
| POST | /api/sessions | 创建会话 |
| PATCH | /api/sessions/:id | 更新会话 |
| DELETE | /api/sessions/:id | 删除会话 |

### 消息
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/sessions/:id/messages | 获取消息列表 |
| POST | /api/sessions/:id/messages | 发送消息 |
| POST | /api/sessions/:id/messages/:msgId/regenerate | 重新生成回复 |
| DELETE | /api/sessions/:id/messages/:msgId | 删除消息 |

### 资产
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/assets | 获取资产列表 |
| GET | /api/assets/:id | 获取单个资产 |
| POST | /api/assets | 创建资产 |
| PATCH | /api/assets/:id | 更新资产 |
| DELETE | /api/assets/:id | 删除资产 |

### Agent
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/agents | 获取 Agent 列表 |
| GET | /api/agents/:id | 获取单个 Agent |
| POST | /api/agents | 创建 Agent |
| POST | /api/agents/:id/chat | 与 Agent 对话 |
| DELETE | /api/agents/:id | 删除 Agent |

### 知识库
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/knowledge-bases | 获取知识库列表 |
| GET | /api/knowledge-bases/:id | 获取单个知识库 |
| POST | /api/knowledge-bases | 创建知识库 |
| POST | /api/knowledge-bases/:id/documents | 上传文档 |
| DELETE | /api/knowledge-bases/:id | 删除知识库 |

### 分析
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/analytics/overview | 获取概览数据 |
| GET | /api/analytics/usage | 获取使用统计 |

## 开发说明

### Mock 数据
后端使用内存中的 Mock 数据，重启服务器后数据会重置。

### 环境变量

**前端** (`frontend/.env`):
- `VITE_API_BASE_URL`: 后端 API 地址

**后端** (`backend/.env`):
- `PORT`: 服务器端口 (默认 8000)
- `CORS_ORIGIN`: 允许的前端地址
- `JWT_SECRET`: JWT 密钥

## License

ISC
