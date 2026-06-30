# Enterprise Workspace - AI Operations

基于 Vite + Vue 3 + TypeScript 构建的 AI 知识中心对话界面。

## 功能特性

- 🤖 **智能对话** - 与 Knowledge Agent 进行多轮对话
- 📁 **资产管理** - 上传和管理文档、数据集、模型
- 📚 **知识库** - 创建和管理知识库
- 📊 **数据分析** - 查看使用统计和性能指标
- ⚙️ **系统设置** - 个性化配置

## 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite
- **类型系统**: TypeScript
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios
- **样式**: CSS Variables + Scoped CSS

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
├── api/              # API 接口定义
├── assets/           # 静态资源
├── components/       # 公共组件
├── mock/             # Mock 数据和 API
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── types/            # TypeScript 类型定义
├── views/            # 页面组件
├── App.vue           # 根组件
└── main.ts           # 入口文件
```

## Mock 数据

项目使用 Mock 数据进行本地开发，无需后端服务即可运行。

### Mock API

- `src/mock/data.ts` - Mock 数据定义
- `src/mock/api.ts` - Mock API 实现

### 支持的功能

- 用户认证（自动登录）
- 会话管理
- 消息发送和接收
- 资产 CRUD 操作
- 知识库管理
- 使用统计

## 页面

- **Home** - 概览和快速操作
- **Assets** - 资产管理
- **Knowledge** - 知识库管理
- **Agents** - AI 对话界面
- **Analytics** - 数据分析
- **Settings** - 系统设置

## 开发说明

### 添加新页面

1. 在 `src/views/` 创建 Vue 组件
2. 在 `src/router/index.ts` 添加路由配置
3. 在 `src/views/Layout.vue` 的 `menuItems` 中添加菜单项

### 添加新 API

1. 在 `src/api/types.ts` 定义请求和响应类型
2. 在 `src/api/index.ts` 添加 API 方法
3. 在 `src/mock/api.ts` 添加 Mock 实现

## License

ISC
