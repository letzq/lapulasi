# RAG 知识库系统开发任务计划

## 📋 项目概述

实现完整的 RAG（检索增强生成）系统，包括：
- 资产向量化存储到知识库
- RAG 检索与来源标注
- 对话记忆功能
- 使用统计记录

## ✅ 已完成任务

### 阶段 1：文档处理服务优化 ✅
- [x] 支持 PDF 文件解析（使用 pdf-parse 库）
- [x] 支持 Word 文件解析（使用 mammoth 库）
- [x] 支持 Excel 文件解析（使用 xlsx 库）
- [x] 支持 TXT、Markdown 文件解析
- [x] 优化文本分块策略

### 阶段 2：向量化服务完善 ✅
- [x] 创建嵌入服务（embeddingService.ts）
- [x] 增强向量存储服务

### 阶段 3：RAG 链优化 ✅
- [x] 创建记忆服务（memoryService.ts）
- [x] 创建使用统计服务（statsService.ts）
- [x] 优化 RAG 提示词模板
- [x] 实现来源标注
- [x] 支持置信度输出

### 阶段 4：API 路由更新 ✅
- [x] 更新 RAG 路由（支持文档上传和向量化）
- [x] 更新分析路由（使用真实统计数据）

### 阶段 5：前端界面优化 ✅
- [x] 更新 Message 接口（支持来源信息）
- [x] 更新 RAG API（返回事件对象）
- [x] 更新 Agents.vue（显示来源和置信度）

---

## 🎯 核心功能

### 1. 资产向量化流程
```
用户上传文档 → 文档解析 → 文本分块 → 向量化 → 存储到 ChromaDB + MySQL
```

### 2. RAG 检索流程
```
用户提问 → 向量检索相关文档 → 构建上下文 → 调用 LLM → 返回答案（含来源、置信度）
```

### 3. 记忆功能
```
对话历史 → 保存到数据库 → 下次对话时加载历史 → 作为上下文传给 LLM
```

---

## 📝 开发任务清单

### **阶段 1：文档处理服务优化** (2小时)

#### 任务 1.1：增强文档解析能力
- [ ] 支持 PDF 文件解析（使用 pdf-parse 库）
- [ ] 支持 Word 文件解析（使用 mammoth 库）
- [ ] 支持 TXT、Markdown 文件解析
- [ ] 支持 Excel 文件解析（使用 xlsx 库）

**文件**：`backend/src/services/documentProcessor.ts`

```typescript
// 需要安装的依赖
// npm install pdf-parse mammoth xlsx
```

#### 任务 1.2：优化文本分块策略
- [ ] 实现基于语义的分块（按段落、标题分割）
- [ ] 支持自定义分块大小和重叠度
- [ ] 保留文档结构信息（页码、章节）

---

### **阶段 2：向量化服务完善** (1.5小时)

#### 任务 2.1：增强向量存储服务
- [ ] 支持批量添加文档分块
- [ ] 支持按知识库 ID 过滤搜索
- [ ] 支持更新文档分块
- [ ] 添加错误处理和重试机制

**文件**：`backend/src/services/vectorStore.ts`

#### 任务 2.2：实现嵌入服务
- [ ] 集成小米模型的嵌入 API
- [ ] 或使用本地嵌入模型（如 transformers.js）
- [ ] 支持批量嵌入计算

**文件**：`backend/src/services/embeddingService.ts`（新建）

---

### **阶段 3：RAG 链优化** (2小时)

#### 任务 3.1：增强 RAG 检索
- [ ] 实现混合检索（向量 + 关键词）
- [ ] 支持多知识库检索
- [ ] 实现检索结果去重和排序
- [ ] 添加检索结果过滤（置信度阈值）

**文件**：`backend/src/services/ragChain.ts`

#### 任务 3.2：优化提示词模板
- [ ] 设计专业的 RAG 提示词
- [ ] 支持来源引用格式
- [ ] 支持置信度输出
- [ ] 支持多轮对话上下文

```typescript
const RAG_PROMPT = `
你是一个智能助手，基于提供的上下文回答用户的问题。

重要规则：
1. 只根据提供的上下文回答问题
2. 如果上下文中没有相关信息，请说明你不确定
3. 回答要准确、简洁、有帮助
4. 使用中文回答
5. 在回答末尾标注来源文档和置信度

上下文：
{context}

对话历史：
{history}

问题：{question}

回答：`
```

#### 任务 3.3：实现来源标注
- [ ] 从检索结果中提取来源信息
- [ ] 计算每个来源的置信度
- [ ] 格式化来源引用

**返回格式**：
```typescript
interface RAGResponse {
  answer: string
  sources: {
    document_id: string
    document_name: string
    chunk_content: string
    relevance: number
    page?: number
  }[]
  confidence: number
}
```

---

### **阶段 4：对话记忆功能** (1.5小时)

#### 任务 4.1：实现对话历史管理
- [ ] 保存对话历史到数据库
- [ ] 加载最近 N 轮对话历史
- [ ] 支持对话历史压缩（避免 token 过长）

**文件**：`backend/src/services/memoryService.ts`（新建）

```typescript
export class MemoryService {
  // 获取对话历史
  async getHistory(sessionId: string, maxRounds = 10): Promise<Message[]>
  
  // 格式化历史为上下文
  formatHistory(messages: Message[]): string
  
  // 压缩历史（保留关键信息）
  compressHistory(messages: Message[]): string
}
```

#### 任务 4.2：集成记忆到 RAG 链
- [ ] 在 RAG 提示词中加入对话历史
- [ ] 实现上下文窗口管理
- [ ] 支持长期记忆（跨会话）

---

### **阶段 5：使用统计功能** (1小时)

#### 任务 5.1：实现统计服务
- [ ] 记录每日会话数
- [ ] 记录每日消息数
- [ ] 记录 Token 使用量
- [ ] 记录 API 调用次数

**文件**：`backend/src/services/statsService.ts`（新建）

```typescript
export class StatsService {
  // 记录使用统计
  async recordUsage(userId: string, data: {
    sessions?: number
    messages?: number
    tokens?: number
    apiCalls?: number
  }): Promise<void>
  
  // 获取统计数据
  async getStats(userId: string, startDate: Date, endDate: Date): Promise<UsageStat[]>
}
```

#### 任务 5.2：在关键位置调用统计
- [ ] 创建会话时记录
- [ ] 发送消息时记录
- [ ] 调用 RAG 时记录
- [ ] 更新 analytics 路由

---

### **阶段 6：API 路由更新** (1.5小时)

#### 任务 6.1：更新 RAG 路由
- [ ] 完善文档上传流程（解析 → 分块 → 向量化 → 保存）
- [ ] 完善 RAG 对话流程（检索 → 构建上下文 → 调用 LLM → 返回）
- [ ] 添加来源和置信度到响应

**文件**：`backend/src/routes/rag.ts`

#### 任务 6.2：更新知识库路由
- [ ] 支持知识库与文档关联
- [ ] 支持知识库统计信息
- [ ] 支持知识库搜索

**文件**：`backend/src/routes/knowledge.ts`

#### 任务 6.3：更新分析路由
- [ ] 返回真实的使用统计数据
- [ ] 支持按时间范围查询
- [ ] 支持按用户查询

**文件**：`backend/src/routes/analytics.ts`

---

### **阶段 7：前端界面优化** (2小时)

#### 任务 7.1：优化 AI 对话界面
- [ ] 显示来源文档信息
- [ ] 显示置信度指标
- [ ] 支持展开查看来源详情
- [ ] 显示对话记忆状态

**文件**：`frontend/src/views/Agents.vue`

```vue
<!-- 来源显示组件 -->
<div class="message-sources" v-if="msg.sources?.length">
  <div class="source-header">
    <el-icon><Document /></el-icon>
    <span>参考来源 ({{ msg.sources.length }})</span>
  </div>
  <div class="source-list">
    <div v-for="source in msg.sources" :key="source.document_id" class="source-item">
      <div class="source-name">{{ source.document_name }}</div>
      <div class="source-content">{{ source.chunk_content }}</div>
      <div class="source-relevance">
        相关度: {{ Math.round(source.relevance * 100) }}%
      </div>
    </div>
  </div>
</div>
```

#### 任务 7.2：优化知识库管理界面
- [ ] 支持上传文档到知识库
- [ ] 显示文档处理状态
- [ ] 显示向量化进度
- [ ] 支持文档预览

**文件**：`frontend/src/views/Knowledge.vue`

#### 任务 7.3：优化数据分析界面
- [ ] 显示真实的使用统计
- [ ] 添加 Token 使用趋势图
- [ ] 添加知识库使用统计

**文件**：`frontend/src/views/Analytics.vue`

---

### **阶段 8：测试与优化** (1小时)

#### 任务 8.1：功能测试
- [ ] 测试文档上传和向量化
- [ ] 测试 RAG 检索准确性
- [ ] 测试来源标注正确性
- [ ] 测试记忆功能
- [ ] 测试使用统计

#### 任务 8.2：性能优化
- [ ] 优化向量检索速度
- [ ] 优化文档处理速度
- [ ] 添加缓存机制
- [ ] 优化数据库查询

---

## 📊 数据库表结构

### 已有表
- `users` - 用户表
- `sessions` - 会话表
- `messages` - 消息表
- `knowledge_bases` - 知识库表
- `documents` - 文档表
- `document_chunks` - 文档分块表
- `message_sources` - 消息来源表
- `usage_stats` - 使用统计表

### 需要更新的表
- `documents` - 添加 `processed_at` 字段
- `document_chunks` - 确保 `embedding_id` 字段正确使用
- `messages` - 添加 `sources` JSON 字段

---

## 🔧 技术实现细节

### 1. 文档处理流程

```typescript
// 1. 上传文档
const file = req.file
const documentId = uuidv4()

// 2. 保存文档信息到数据库
await execute(
  'INSERT INTO documents (id, knowledge_base_id, user_id, name, file_path, file_size, mime_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
  [documentId, knowledgeBaseId, userId, file.originalname, file.path, file.size, file.mimetype, 'processing']
)

// 3. 解析文档
const chunks = await documentProcessor.processFile(file.path, file.mimetype)

// 4. 保存分块到数据库
for (const chunk of chunks) {
  const chunkId = uuidv4()
  await execute(
    'INSERT INTO document_chunks (id, document_id, content, chunk_index, tokens) VALUES (?, ?, ?, ?, ?)',
    [chunkId, documentId, chunk.content, chunk.metadata.chunk_index, chunk.content.length / 4]
  )
}

// 5. 向量化并存储到 ChromaDB
await vectorStoreService.addDocument(
  documentId,
  chunks.map(c => c.content),
  chunks.map(c => c.metadata)
)

// 6. 更新文档状态
await execute(
  'UPDATE documents SET status = ?, chunk_count = ?, processed_at = NOW() WHERE id = ?',
  ['active', chunks.length, documentId]
)
```

### 2. RAG 检索流程

```typescript
// 1. 获取用户问题
const { session_id, content } = req.body

// 2. 加载对话历史
const history = await memoryService.getHistory(session_id, 10)
const historyText = memoryService.formatHistory(history)

// 3. 向量检索
const searchResults = await vectorStoreService.search(content, 5)

// 4. 构建上下文
const context = searchResults.documents[0].join('\n\n')

// 5. 构建来源信息
const sources = searchResults.metadatas[0].map((meta, i) => ({
  document_id: meta.document_id,
  document_name: meta.source,
  chunk_content: searchResults.documents[0][i].substring(0, 200),
  relevance: 1 - (searchResults.distances[0][i] || 0)
}))

// 6. 调用 LLM
const prompt = RAG_PROMPT
  .replace('{context}', context)
  .replace('{history}', historyText)
  .replace('{question}', content)

const response = await callLLM(prompt)

// 7. 计算置信度
const confidence = sources.reduce((sum, s) => sum + s.relevance, 0) / sources.length

// 8. 保存消息和来源
const messageId = uuidv4()
await execute(
  'INSERT INTO messages (id, session_id, role, content, confidence) VALUES (?, ?, ?, ?, ?)',
  [messageId, session_id, 'assistant', response, confidence]
)

for (const source of sources) {
  await execute(
    'INSERT INTO message_sources (id, message_id, document_id, title, content, relevance) VALUES (?, ?, ?, ?, ?, ?)',
    [uuidv4(), messageId, source.document_id, source.document_name, source.chunk_content, source.relevance]
  )
}
```

### 3. 记忆功能实现

```typescript
export class MemoryService {
  async getHistory(sessionId: string, maxRounds = 10): Promise<Message[]> {
    const messages = await query(
      `SELECT * FROM messages 
       WHERE session_id = ? 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [sessionId, maxRounds * 2] // 每轮包含用户和AI消息
    )
    return messages.reverse() // 按时间正序
  }
  
  formatHistory(messages: Message[]): string {
    return messages.map(m => {
      const role = m.role === 'user' ? '用户' : 'AI'
      return `${role}: ${m.content}`
    }).join('\n\n')
  }
}
```

---

## ⏱️ 时间估算

| 阶段 | 任务 | 时间 |
|------|------|------|
| 1 | 文档处理服务优化 | 2 小时 |
| 2 | 向量化服务完善 | 1.5 小时 |
| 3 | RAG 链优化 | 2 小时 |
| 4 | 对话记忆功能 | 1.5 小时 |
| 5 | 使用统计功能 | 1 小时 |
| 6 | API 路由更新 | 1.5 小时 |
| 7 | 前端界面优化 | 2 小时 |
| 8 | 测试与优化 | 1 小时 |
| **总计** | | **12.5 小时** |

---

## 🎯 验收标准

### 功能验收
- [ ] 用户可以上传文档到知识库
- [ ] 文档自动进行向量化处理
- [ ] 用户提问时能检索到相关文档
- [ ] AI 回复包含来源文档信息
- [ ] AI 回复包含置信度指标
- [ ] 对话历史能够被记住
- [ ] 使用统计数据正确记录

### 性能验收
- [ ] 文档处理时间 < 30秒/文档
- [ ] RAG 检索时间 < 2秒
- [ ] 支持并发 10 个用户

### 质量验收
- [ ] 代码无 TypeScript 编译错误
- [ ] 所有 API 接口正常工作
- [ ] 前端界面显示正常
- [ ] 错误处理完善

---

## 📌 注意事项

1. **ChromaDB 连接**：确保远程 ChromaDB 服务可用
2. **小米模型 API**：确保 API Key 有效
3. **文件大小限制**：上传文件限制 50MB
4. **并发处理**：文档处理可能耗时较长，建议异步处理
5. **错误处理**：每个步骤都需要完善的错误处理

---

## 🚀 开始实施

按照阶段顺序逐步实施，确保每个阶段完成并测试通过后再进入下一阶段。
