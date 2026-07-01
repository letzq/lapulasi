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
| **Embedding** | 阿里云百炼 `text-embedding-v4` (OpenAI 兼容 API) |
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
- 阿里云百炼 API (Embedding 服务，或兼容 OpenAI 的 Embedding API)

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

EMBEDDING_API_KEY=your-dashscope-api-key
EMBEDDING_BASE_URL=https://llm-snvwiitgadv6zpj7.cn-beijing.maas.aliyuncs.com/compatible-mode/v1
EMBEDDING_MODEL=text-embedding-v4

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
| `admin@qq.com` | `admin123` | 管理员 |

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
embeddingService 生成向量 (阿里云百炼 text-embedding-v4)
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

详见 [原型图/DESIGN.md](原型图/DESIGN.md)。

---

## 架构设计问答

### 1. 如何设计知识资产的数据结构？

采用 **三层树形结构**：知识库 → 文档 → 分块，配合向量数据库实现语义检索。

```
knowledge_bases (知识库)
  ├── documents (文档)
  │     ├── document_chunks (分块) ──→ ChromaDB (向量)
  │     └── document_chunks ...
  └── documents ...
```

**关系库 (MySQL)** 存储元信息和业务数据：

| 表 | 职责 | 关键字段 |
|---|------|----------|
| `knowledge_bases` | 知识库容器 | `name`, `description`, `document_count`, `status` |
| `documents` | 文档元数据 | `name`, `file_path`, `mime_type`, `file_size`, `chunk_count`, `status` |
| `document_chunks` | 分块索引 | `document_id`, `content`, `chunk_index`, `tokens`, `embedding_id` |
| `message_sources` | 引用溯源 | `message_id`, `document_id`, `chunk_id`, `content`, `relevance` |

**向量库 (ChromaDB)** 存储向量和原文：

```
Collection: "documents"
  id:      "{documentId}_chunk_{index}"
  embedding: float[] (text-embedding-v4, 1024维)
  document:  chunk 原文
  metadata:  { document_id, knowledge_base_id, source, chunk_index, ... }
```

**设计考量**：
- MySQL 负责结构化查询（列表、统计、权限），ChromaDB 负责语义检索，各司其职
- `embedding_id` 字段关联向量库，支持增量更新和精确删除
- `message_sources` 表让每条 AI 回复都能追溯到具体文档片段和相似度分数

---

### 2. 如何实现检索？

采用 **RAG（Retrieval-Augmented Generation）** 流水线，核心在 `ragChain.ts`：

```
用户提问
  │
  ├─ 1. 向量检索 ──→ Embedding(text-embedding-v4) ──→ ChromaDB Top 3
  │     返回: ids, documents, metadatas, distances
  │
  ├─ 2. 相似度转换 ──→ score = 1 / (1 + distance)
  │     ≥ 80% 高相关 / 60-80% 中相关 / < 60% 低相关
  │
  ├─ 3. 上下文组装 ──→ System Prompt + 检索片段 + 对话历史
  │     片段格式: [来源1] 《文档名》: 内容... (相似度: 85%)
  │
  └─ 4. LLM 生成 ──→ SSE 流式输出 chunk/sources/done 事件
```

**检索策略**：
- **Top-K = 3**：平衡相关性和上下文窗口占用
- **相似度阈值**：低分结果仍保留（不丢弃），由 LLM 判断是否使用
- **来源溯源**：每个 chunk 带 `document_id`、`source`（文件名）、`chunk_index`，前端可点击查看原文
- **对话历史**：通过 `memoryService` 保留最近消息，支持多轮上下文

---

### 3. 如果要接入真实向量数据库，你会怎么改？

当前已使用 ChromaDB 作为真实向量数据库，若要替换为 Milvus/Pinecone/Weaviate 等生产级方案，改动集中在 **三层抽象**：

**① `vectorStore.ts` — 数据访问层**

```typescript
// 当前接口（已抽象）
interface VectorStore {
  addDocument(docId: string, chunks: string[], metadata: Record<string, any>[]): Promise<void>
  search(query: string, topK: number): Promise<SearchResults>
  deleteDocument(docId: string): Promise<void>
  getStats(): Promise<{ count: number }>
}
```

只需实现新适配器（如 `MilvusVectorStore`），上层无感知。改动点：
- 连接配置（URI、认证）
- Collection 创建参数（索引类型 HNSW/IVF、距离度量 COSINE/L2）
- Batch 写入策略（Milvus 单次上限 1000 条）

**② `embeddingService.ts` — 嵌入层**

当前已支持 OpenAI 兼容 API，切换模型只需改 `.env` 中的 `EMBEDDING_BASE_URL` 和 `EMBEDDING_MODEL`。注意不同模型维度不同（如 `text-embedding-v4` 输出 1024 维），**切换后需重建索引**。

**③ `ragChain.ts` — 检索逻辑层**

若新数据库支持混合检索（向量 + 全文），可增强检索：
```
Hybrid Search = Vector Search (语义) + BM25 (关键词)
         ↓ 融合排序 (RRF)
      Top-K 结果
```

**最小改动方案**：只替换 `vectorStore.ts` 一个文件，其余服务通过接口调用，无需修改。

---

### 4. 如果要支持多租户，你会怎么改？

当前是 **单租户架构**（所有用户共享一个 ChromaDB Collection），改造方案：

**① 数据库层 — 加 `tenant_id` 隔离**

```sql
-- 所有业务表加租户字段
ALTER TABLE knowledge_bases ADD COLUMN tenant_id CHAR(36) NOT NULL;
ALTER TABLE documents ADD COLUMN tenant_id CHAR(36) NOT NULL;
ALTER TABLE sessions ADD COLUMN tenant_id CHAR(36) NOT NULL;
-- ...所有查询加 WHERE tenant_id = ?

-- 新增租户表
CREATE TABLE tenants (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(255),
  plan ENUM('free', 'pro', 'enterprise'),
  quota_documents INT DEFAULT 100,
  quota_tokens INT DEFAULT 1000000,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**② 向量库层 — 两种策略**

| 方案 | 实现 | 适用场景 |
|------|------|----------|
| **Collection 隔离** | 每个租户独立 Collection (`docs_{tenantId}`) | 租户数 < 1000，强隔离需求 |
| **Metadata 过滤** | 共享 Collection，查询加 `where: { tenant_id }` | 租户数多，成本敏感 |

推荐 Collection 隔离，避免元数据过滤的性能退化和数据泄露风险。

**③ 应用层 — 中间件注入租户上下文**

```typescript
// middleware/tenant.ts
app.use((req, res, next) => {
  req.tenantId = req.user.tenantId  // 从 JWT 或 session 获取
  next()
})

// 所有 service 调用自动携带 tenantId
const kb = await knowledgeService.findAll({ tenantId: req.tenantId })
```

**④ 配额与限流**

- 文档数量 / Token 消耗 / API 调用按租户计量
- Embedding 和 LLM 调用加租户级 Rate Limit
- 存储空间按 Plan 分级限制

---

### 5. 如果这个系统上线到真实 ToB 场景，你最担心的问题是什么？

**最核心的担忧：RAG 回答的准确性和幻觉问题。**

| 风险 | 具体表现 | 应对策略 |
|------|----------|----------|
| **幻觉** | LLM 编造知识库中不存在的内容 | 严格 Prompt 约束 + 引用强制标注 + 置信度阈值 |
| **检索遗漏** | Top-3 未召回真正相关文档 | Hybrid Search（向量 + 关键词）+ Query 改写 |
| **语义漂移** | 用户问题与文档表述差异大 | Query Expansion / HyDE（假设性文档嵌入）|
| **数据安全** | 租户间知识泄露 | Collection 级隔离 + 请求级权限校验 |
| **成本失控** | 高频调用 Embedding + LLM | 缓存层（语义缓存相似问题）+ 配额限制 |
| **文档质量** | 扫描件/加密 PDF 无法解析 | 预处理质检 + OCR 兜底 + 人工审核流程 |

**最担心的一点**：用户信任 AI 回答的权威性，一旦出现错误回答被当作事实执行，在企业场景中可能造成合规、安全或决策层面的严重后果。因此系统必须做到：
1. **可溯源** — 每条回答必须标注来源文档和相似度
2. **可兜底** — 知识库无相关内容时明确拒绝，不编造
3. **可审计** — 所有对话和引用持久化，支持事后审查
