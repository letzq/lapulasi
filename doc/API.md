# Enterprise Workspace API 文档

## 基础信息

- **Base URL**: `http://localhost:8000/api`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (JWT)

---

## 通用响应结构

### 成功响应

```json
{
  "success": true,
  "data": { ... }
}
```

### 分页响应

```json
{
  "items": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": "Error message"
}
```

---

## 认证 API

### 1. 用户登录

**POST** `/auth/login`

**请求体**:

```json
{
  "email": "string",
  "password": "string"
}
```

**请求示例**:

```json
{
  "email": "zhangsan@enterprise.com",
  "password": "password"
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-001",
      "name": "张三",
      "email": "zhangsan@enterprise.com",
      "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-06-29T00:00:00.000Z"
    },
    "token": "jwt-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

**错误响应** (401):

```json
{
  "success": false,
  "data": {
    "user": null,
    "token": ""
  },
  "error": "Invalid credentials"
}
```

---

### 2. 用户注册

**POST** `/auth/register`

**请求体**:

```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**请求示例**:

```json
{
  "name": "李四",
  "email": "lisi@enterprise.com",
  "password": "password123"
}
```

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "user-xxxxxxxx",
    "name": "李四",
    "email": "lisi@enterprise.com",
    "role": "user",
    "createdAt": "2024-06-29T10:00:00.000Z",
    "updatedAt": "2024-06-29T10:00:00.000Z"
  }
}
```

**错误响应** (400):

```json
{
  "success": false,
  "data": null,
  "error": "Email already exists"
}
```

---

### 3. 退出登录

**POST** `/auth/logout`

**请求头**:

```
Authorization: Bearer <token>
```

**成功响应** (200):

```json
{
  "success": true,
  "data": null
}
```

---

### 4. 获取用户信息

**GET** `/auth/profile`

**请求头**:

```
Authorization: Bearer <token>
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "user-001",
    "name": "张三",
    "email": "zhangsan@enterprise.com",
    "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-06-29T00:00:00.000Z"
  }
}
```

**错误响应** (401):

```json
{
  "success": false,
  "error": "Unauthorized"
}
```

---

## 会话 API

### 5. 获取会话列表

**GET** `/sessions`

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |

**请求示例**:

```
GET /api/sessions?page=1&pageSize=10
```

**成功响应** (200):

```json
{
  "items": [
    {
      "id": "session-001",
      "userId": "user-001",
      "model": "GPT-4-Enterprise",
      "title": "Q3 Compliance Discussion",
      "latency": 1.2,
      "tokens": 428,
      "status": "active",
      "createdAt": "2024-06-29T10:00:00.000Z",
      "updatedAt": "2024-06-29T10:42:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

### 6. 获取单个会话

**GET** `/sessions/:id`

**路径参数**:

| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 会话 ID |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "session-001",
    "userId": "user-001",
    "model": "GPT-4-Enterprise",
    "title": "Q3 Compliance Discussion",
    "latency": 1.2,
    "tokens": 428,
    "status": "active",
    "createdAt": "2024-06-29T10:00:00.000Z",
    "updatedAt": "2024-06-29T10:42:00.000Z"
  }
}
```

**错误响应** (404):

```json
{
  "success": false,
  "error": "Session not found"
}
```

---

### 7. 创建会话

**POST** `/sessions`

**请求体**:

```json
{
  "model": "string",
  "title": "string"
}
```

**请求示例**:

```json
{
  "model": "GPT-4-Enterprise",
  "title": "New Discussion"
}
```

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "session-xxxxxxxx",
    "userId": "user-001",
    "model": "GPT-4-Enterprise",
    "title": "New Discussion",
    "latency": 0,
    "tokens": 0,
    "status": "active",
    "createdAt": "2024-06-29T11:00:00.000Z",
    "updatedAt": "2024-06-29T11:00:00.000Z"
  }
}
```

---

### 8. 更新会话

**PATCH** `/sessions/:id`

**路径参数**:

| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 会话 ID |

**请求体**:

```json
{
  "model": "string",
  "title": "string"
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "session-001",
    "model": "GPT-4-Enterprise",
    "title": "Updated Title",
    "latency": 1.2,
    "tokens": 428,
    "status": "active",
    "createdAt": "2024-06-29T10:00:00.000Z",
    "updatedAt": "2024-06-29T11:00:00.000Z"
  }
}
```

---

### 9. 删除会话

**DELETE** `/sessions/:id`

**路径参数**:

| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 会话 ID |

**成功响应** (200):

```json
{
  "success": true,
  "data": null
}
```

**错误响应** (404):

```json
{
  "success": false,
  "error": "Session not found"
}
```

---

## 消息 API

### 10. 获取会话消息

**GET** `/sessions/:sessionId/messages`

**路径参数**:

| 参数 | 类型 | 描述 |
|------|------|------|
| sessionId | string | 会话 ID |

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 50 | 每页数量 |

**成功响应** (200):

```json
{
  "items": [
    {
      "id": "msg-001",
      "sessionId": "session-001",
      "role": "user",
      "content": "Can you summarize the Q3 compliance requirements?",
      "timestamp": "2024-06-29T10:40:00.000Z"
    },
    {
      "id": "msg-002",
      "sessionId": "session-001",
      "role": "assistant",
      "content": "Based on the provided corporate policies...",
      "timestamp": "2024-06-29T10:42:00.000Z",
      "confidence": 0.94,
      "sources": [
        {
          "id": "src-001",
          "title": "Corporate Security Policy v2.3",
          "content": "Section 4.2: Data Encryption Standards",
          "relevance": 0.98
        }
      ],
      "metadata": {
        "model": "GPT-4-Enterprise",
        "tokens": 285,
        "latency": 1.2
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### 11. 发送消息

**POST** `/sessions/:sessionId/messages`

**路径参数**:

| 参数 | 类型 | 描述 |
|------|------|------|
| sessionId | string | 会话 ID |

**请求体**:

```json
{
  "content": "string"
}
```

**请求示例**:

```json
{
  "content": "What are the current API rate limits?"
}
```

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "msg-xxxxxxxx",
    "sessionId": "session-001",
    "role": "assistant",
    "content": "Here are the current API rate limits:\n\n- **Standard APIs:** 1,000 requests/minute\n- **Premium APIs:** 5,000 requests/minute",
    "timestamp": "2024-06-29T11:00:00.000Z",
    "confidence": 0.92,
    "sources": [
      {
        "id": "src-xxxxxxxx",
        "title": "API Documentation",
        "content": "Rate limiting section",
        "relevance": 0.95
      }
    ],
    "metadata": {
      "model": "GPT-4-Enterprise",
      "tokens": 120,
      "latency": 0.9
    }
  }
}
```

**错误响应** (400):

```json
{
  "success": false,
  "error": "Content is required"
}
```

---

### 12. 重新生成回复

**POST** `/sessions/:sessionId/messages/:messageId/regenerate`

**路径参数**:

| 参数 | 类型 | 描述 |
|------|------|------|
| sessionId | string | 会话 ID |
| messageId | string | 消息 ID |

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "msg-xxxxxxxx",
    "sessionId": "session-001",
    "role": "assistant",
    "content": "Regenerated response content...",
    "timestamp": "2024-06-29T11:05:00.000Z",
    "confidence": 0.89,
    "sources": [...],
    "metadata": {
      "model": "GPT-4-Enterprise",
      "tokens": 150,
      "latency": 1.1
    }
  }
}
```

---

### 13. 删除消息

**DELETE** `/sessions/:sessionId/messages/:messageId`

**路径参数**:

| 参数 | 类型 | 描述 |
|------|------|------|
| sessionId | string | 会话 ID |
| messageId | string | 消息 ID |

**成功响应** (200):

```json
{
  "success": true,
  "data": null
}
```

---

## 资产 API

### 14. 获取资产列表

**GET** `/assets`

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |
| type | string | 否 | - | 资产类型: document, dataset, model, agent |
| status | string | 否 | - | 状态: active, inactive, processing |
| search | string | 否 | - | 搜索关键词 |

**成功响应** (200):

```json
{
  "items": [
    {
      "id": "asset-001",
      "name": "Corporate Security Policy",
      "type": "document",
      "status": "active",
      "description": "Enterprise security policy document v2.3",
      "size": 2048576,
      "filePath": "/uploads/policy.pdf",
      "userId": "user-001",
      "createdAt": "2024-06-01T10:00:00.000Z",
      "updatedAt": "2024-06-15T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 15,
    "totalPages": 2
  }
}
```

---

### 15. 获取单个资产

**GET** `/assets/:id`

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "asset-001",
    "name": "Corporate Security Policy",
    "type": "document",
    "status": "active",
    "description": "Enterprise security policy document v2.3",
    "size": 2048576,
    "userId": "user-001",
    "createdAt": "2024-06-01T10:00:00.000Z",
    "updatedAt": "2024-06-15T14:30:00.000Z"
  }
}
```

---

### 16. 创建资产

**POST** `/assets`

**请求体**:

```json
{
  "name": "string",
  "type": "document | dataset | model | agent",
  "description": "string"
}
```

**请求示例**:

```json
{
  "name": "New Policy Document",
  "type": "document",
  "description": "Updated company policy"
}
```

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "asset-xxxxxxxx",
    "name": "New Policy Document",
    "type": "document",
    "status": "active",
    "description": "Updated company policy",
    "userId": "user-001",
    "createdAt": "2024-06-29T11:00:00.000Z",
    "updatedAt": "2024-06-29T11:00:00.000Z"
  }
}
```

---

### 17. 更新资产

**PATCH** `/assets/:id`

**请求体**:

```json
{
  "name": "string",
  "description": "string",
  "status": "active | inactive | processing"
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "asset-001",
    "name": "Updated Policy Document",
    "status": "active",
    "updatedAt": "2024-06-29T11:00:00.000Z"
  }
}
```

---

### 18. 删除资产

**DELETE** `/assets/:id`

**成功响应** (200):

```json
{
  "success": true,
  "data": null
}
```

---

## Agent API

### 19. 获取 Agent 列表

**GET** `/agents`

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |
| search | string | 否 | - | 搜索关键词 |

**成功响应** (200):

```json
{
  "items": [
    {
      "id": "agent-001",
      "name": "Knowledge Agent",
      "description": "Retrieval-Augmented Generation agent for enterprise knowledge bases.",
      "model": "GPT-4-Enterprise",
      "status": "active",
      "capabilities": ["document-retrieval", "citation", "summarization"],
      "createdBy": "user-001",
      "createdAt": "2024-06-01T10:00:00.000Z",
      "updatedAt": "2024-06-29T09:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 20. 获取单个 Agent

**GET** `/agents/:id`

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "agent-001",
    "name": "Knowledge Agent",
    "description": "Retrieval-Augmented Generation agent for enterprise knowledge bases.",
    "model": "GPT-4-Enterprise",
    "status": "active",
    "capabilities": ["document-retrieval", "citation", "summarization"],
    "createdBy": "user-001",
    "createdAt": "2024-06-01T10:00:00.000Z",
    "updatedAt": "2024-06-29T09:00:00.000Z"
  }
}
```

---

### 21. 创建 Agent

**POST** `/agents`

**请求体**:

```json
{
  "name": "string",
  "description": "string",
  "model": "string",
  "capabilities": ["string"]
}
```

**请求示例**:

```json
{
  "name": "Customer Support Agent",
  "description": "Handles customer inquiries and support tickets",
  "model": "GPT-4-Enterprise",
  "capabilities": ["customer-support", "ticket-routing", "sentiment-analysis"]
}
```

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "agent-xxxxxxxx",
    "name": "Customer Support Agent",
    "description": "Handles customer inquiries and support tickets",
    "model": "GPT-4-Enterprise",
    "status": "active",
    "capabilities": ["customer-support", "ticket-routing", "sentiment-analysis"],
    "createdBy": "user-001",
    "createdAt": "2024-06-29T11:00:00.000Z",
    "updatedAt": "2024-06-29T11:00:00.000Z"
  }
}
```

---

### 22. 与 Agent 对话

**POST** `/agents/:id/chat`

**路径参数**:

| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | Agent ID |

**请求体**:

```json
{
  "message": "string",
  "sessionId": "string"
}
```

**请求示例**:

```json
{
  "message": "What is our return policy?",
  "sessionId": "session-001"
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "msg-xxxxxxxx",
    "sessionId": "session-001",
    "role": "assistant",
    "content": "Our return policy allows returns within 30 days of purchase...",
    "confidence": 0.91,
    "metadata": {
      "model": "GPT-4-Enterprise",
      "tokens": 85,
      "latency": 1.0
    },
    "createdAt": "2024-06-29T11:00:00.000Z"
  }
}
```

---

### 23. 更新 Agent

**PATCH** `/agents/:id`

**请求体**:

```json
{
  "name": "string",
  "description": "string",
  "model": "string",
  "capabilities": ["string"],
  "status": "active | inactive | training"
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "agent-001",
    "name": "Updated Agent Name",
    "status": "active",
    "updatedAt": "2024-06-29T11:00:00.000Z"
  }
}
```

---

### 24. 删除 Agent

**DELETE** `/agents/:id`

**成功响应** (200):

```json
{
  "success": true,
  "data": null
}
```

---

## 知识库 API

### 25. 获取知识库列表

**GET** `/knowledge-bases`

**查询参数**:

| 参数 | 类型 | 必填 | 默认值 | 描述 |
|------|------|------|--------|------|
| page | number | 否 | 1 | 页码 |
| pageSize | number | 否 | 10 | 每页数量 |
| search | string | 否 | - | 搜索关键词 |

**成功响应** (200):

```json
{
  "items": [
    {
      "id": "kb-001",
      "name": "Corporate Policies",
      "description": "Enterprise policies, guidelines, and compliance documents",
      "documentCount": 45,
      "lastUpdated": "2024-06-28T16:00:00.000Z",
      "status": "active",
      "createdBy": "user-001",
      "createdAt": "2024-05-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 8,
    "totalPages": 1
  }
}
```

---

### 26. 获取单个知识库

**GET** `/knowledge-bases/:id`

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "kb-001",
    "name": "Corporate Policies",
    "description": "Enterprise policies, guidelines, and compliance documents",
    "documentCount": 45,
    "lastUpdated": "2024-06-28T16:00:00.000Z",
    "status": "active",
    "createdBy": "user-001",
    "createdAt": "2024-05-01T10:00:00.000Z"
  }
}
```

---

### 27. 创建知识库

**POST** `/knowledge-bases`

**请求体**:

```json
{
  "name": "string",
  "description": "string"
}
```

**请求示例**:

```json
{
  "name": "Product Documentation",
  "description": "All product-related documentation and guides"
}
```

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "kb-xxxxxxxx",
    "name": "Product Documentation",
    "description": "All product-related documentation and guides",
    "documentCount": 0,
    "lastUpdated": "2024-06-29T11:00:00.000Z",
    "status": "active",
    "createdBy": "user-001",
    "createdAt": "2024-06-29T11:00:00.000Z"
  }
}
```

---

### 28. 上传文档到知识库

**POST** `/knowledge-bases/:id/documents`

**路径参数**:

| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 知识库 ID |

**请求体** (multipart/form-data):

```
files: File[]
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "uploaded": 3,
    "message": "Documents uploaded successfully. Indexing in progress."
  }
}
```

---

### 29. 更新知识库

**PATCH** `/knowledge-bases/:id`

**请求体**:

```json
{
  "name": "string",
  "description": "string"
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "id": "kb-001",
    "name": "Updated Knowledge Base",
    "description": "Updated description",
    "lastUpdated": "2024-06-29T11:00:00.000Z"
  }
}
```

---

### 30. 删除知识库

**DELETE** `/knowledge-bases/:id`

**成功响应** (200):

```json
{
  "success": true,
  "data": null
}
```

---

## 分析 API

### 31. 获取概览数据

**GET** `/analytics/overview`

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "totalSessions": 1256,
    "totalMessages": 4892,
    "averageLatency": 1.1,
    "averageConfidence": 0.92,
    "activeUsers": 89,
    "topModels": [
      {
        "model": "GPT-4-Enterprise",
        "usage": 756
      },
      {
        "model": "Claude-3-Enterprise",
        "usage": 500
      }
    ]
  }
}
```

---

### 32. 获取使用统计

**GET** `/analytics/usage`

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "daily": [
      {
        "date": "2024-06-23",
        "sessions": 145,
        "messages": 567
      },
      {
        "date": "2024-06-24",
        "sessions": 189,
        "messages": 723
      },
      {
        "date": "2024-06-25",
        "sessions": 167,
        "messages": 645
      },
      {
        "date": "2024-06-26",
        "sessions": 201,
        "messages": 789
      },
      {
        "date": "2024-06-27",
        "sessions": 178,
        "messages": 698
      },
      {
        "date": "2024-06-28",
        "sessions": 156,
        "messages": 612
      },
      {
        "date": "2024-06-29",
        "sessions": 67,
        "messages": 258
      }
    ]
  }
}
```

---

### 33. 自定义查询

**POST** `/analytics/query`

**请求体**:

```json
{
  "startDate": "string",
  "endDate": "string",
  "metrics": ["string"]
}
```

**请求示例**:

```json
{
  "startDate": "2024-06-23",
  "endDate": "2024-06-29",
  "metrics": ["sessions", "messages"]
}
```

**成功响应** (200):

```json
{
  "success": true,
  "data": {
    "startDate": "2024-06-23",
    "endDate": "2024-06-29",
    "metrics": ["sessions", "messages"],
    "data": [
      {
        "date": "2024-06-23",
        "sessions": 145,
        "messages": 567
      }
    ]
  }
}
```

---

## 健康检查

### 34. 服务器健康检查

**GET** `/health`

**成功响应** (200):

```json
{
  "status": "ok",
  "timestamp": "2024-06-29T11:00:00.000Z"
}
```

---

## 数据类型定义

### User

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}
```

### Session

```typescript
interface Session {
  id: string;
  userId: string;
  model: string;
  title?: string;
  latency: number;
  tokens: number;
  status: 'active' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}
```

### Message

```typescript
interface Message {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  confidence?: number;
  metadata?: MessageMetadata;
  createdAt: Date;
}

interface Source {
  id: string;
  title: string;
  url?: string;
  content: string;
  relevance: number;
}

interface MessageMetadata {
  model?: string;
  tokens?: number;
  latency?: number;
}
```

### Asset

```typescript
interface Asset {
  id: string;
  name: string;
  type: 'document' | 'dataset' | 'model' | 'agent';
  status: 'active' | 'inactive' | 'processing';
  description?: string;
  size?: number;
  filePath?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Agent

```typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  model: string;
  status: 'active' | 'inactive' | 'training';
  capabilities: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### KnowledgeBase

```typescript
interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documentCount: number;
  lastUpdated: Date;
  status: 'active' | 'indexing' | 'error';
  createdBy: string;
  createdAt: Date;
}
```

### Pagination

```typescript
interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
```

---

## 错误码

| HTTP 状态码 | 描述 |
|-------------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 / Token 无效 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 示例：完整对话流程

### 1. 登录获取 Token

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "zhangsan@enterprise.com", "password": "password"}'
```

### 2. 创建新会话

```bash
curl -X POST http://localhost:8000/api/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"model": "GPT-4-Enterprise", "title": "My Chat"}'
```

### 3. 发送消息

```bash
curl -X POST http://localhost:8000/api/sessions/session-xxx/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"content": "Hello, can you help me?"}'
```

### 4. 获取消息列表

```bash
curl -X GET http://localhost:8000/api/sessions/session-xxx/messages \
  -H "Authorization: Bearer <token>"
```
