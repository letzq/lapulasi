# 前端集成计划：Element Plus + ECharts + 统一设计风格

## 📋 项目概述

将当前前端从 Mock 数据切换到真实后端 API，同时引入 Element Plus UI 组件库和 ECharts 图表库，替换所有 emoji 图标为 Element Plus 官方图标，确保统一的企业级设计风格。

---

## 🎯 目标

1. **UI 框架**：引入 Element Plus 组件库
2. **图表库**：引入 ECharts 数据可视化
3. **图标系统**：替换所有 emoji 为 Element Plus 图标
4. **API 对接**：从 Mock 切换到真实后端 API
5. **设计统一**：使用 Design System Skills 确保风格一致

---

## 📦 依赖安装

```bash
# Element Plus
npm install element-plus @element-plus/icons-vue

# ECharts
npm install echarts vue-echarts

# HTTP 客户端
npm install axios

# 类型定义
npm install @types/node -D
```

---

## 🏗️ 实施步骤

### **阶段 1：基础架构搭建**

#### 1.1 配置 Element Plus
- 创建 `src/plugins/element.ts` 配置文件
- 配置全局组件注册
- 配置图标库
- 配置中文语言包

#### 1.2 创建 HTTP 客户端
- 创建 `src/utils/request.ts` (Axios 实例)
- 配置请求拦截器（JWT Token）
- 配置响应拦截器（错误处理）
- 配置 baseURL（开发/生产环境）

#### 1.3 创建 API 服务层
- `src/api/auth.ts` - 认证 API
- `src/api/sessions.ts` - 会话 API
- `src/api/messages.ts` - 消息 API
- `src/api/knowledge.ts` - 知识库 API
- `src/api/assets.ts` - 资产 API
- `src/api/analytics.ts` - 数据分析 API
- `src/api/rag.ts` - RAG 对话 API

---

### **阶段 2：图标系统迁移**

#### 2.1 图标映射表

| 位置 | 旧 Emoji | 新 Element Plus 图标 |
|------|----------|---------------------|
| 侧边栏 Logo | 🔄 | `<el-icon><Refresh /></el-icon>` |
| 首页 | 🏠 | `<el-icon><HomeFilled /></el-icon>` |
| 资产 | 📁 | `<el-icon><FolderOpened /></el-icon>` |
| 知识库 | 📚 | `<el-icon><Collection /></el-icon>` |
| Agents | 🤖 | `<el-icon><Avatar /></el-icon>` |
| 数据分析 | 📊 | `<el-icon><DataAnalysis /></el-icon>` |
| 设置 | ⚙️ | `<el-icon><Setting /></el-icon>` |
| 搜索 | 🔍 | `<el-icon><Search /></el-icon>` |
| 邀请 | ✉️ | `<el-icon><Message /></el-icon>` |
| 通知 | 🔔 | `<el-icon><Bell /></el-icon>` |
| 帮助 | ❓ | `<el-icon><QuestionFilled /></el-icon>` |
| 会话 | 💬 | `<el-icon><ChatDotRound /></el-icon>` |
| 消息 | 📝 | `<el-icon><EditPen /></el-icon>` |
| 用户 | 👥 | `<el-icon><User /></el-icon>` |
| 目标 | 🎯 | `<el-icon><Aim /></el-icon>` |
| 机器人 | 🤖 | `<el-icon><Monitor /></el-icon>` |

#### 2.2 需要修改的文件
- `src/views/Layout.vue` - 主布局（侧边栏、顶栏）
- `src/views/Home.vue` - 首页（统计卡片、快捷操作）
- `src/views/Agents.vue` - AI 对话页面
- `src/views/Assets.vue` - 资产管理
- `src/views/Knowledge.vue` - 知识库管理
- `src/views/Analytics.vue` - 数据分析
- `src/views/Settings.vue` - 设置页面

---

### **阶段 3：组件重构**

#### 3.1 Layout.vue 重构
```
使用 Element Plus 组件：
- el-container, el-aside, el-header, el-main
- el-menu, el-menu-item (侧边栏导航)
- el-input (搜索框)
- el-badge (通知徽章)
- el-avatar (用户头像)
- el-dropdown (用户菜单)
```

#### 3.2 Home.vue 重构
```
使用 Element Plus 组件：
- el-card (统计卡片)
- el-statistic (数值展示)
- el-table (会话列表)
- el-tag (状态标签)
- el-button (操作按钮)
- el-row, el-col (栅格布局)
```

#### 3.3 Agents.vue 重构
```
使用 Element Plus 组件：
- el-card (对话容器)
- el-input, el-input-textarea (消息输入)
- el-button (发送按钮)
- el-scrollbar (消息列表滚动)
- el-loading (加载状态)
- el-avatar (用户/AI 头像)
```

#### 3.4 Analytics.vue 重构
```
使用 ECharts 图表：
- 折线图：会话趋势
- 柱状图：消息统计
- 饼图：模型使用分布
- 仪表盘：置信度指标
```

---

### **阶段 4：API 对接**

#### 4.1 认证模块
- 登录/注册页面
- JWT Token 管理
- 路由守卫
- 自动刷新 Token

#### 4.2 会话模块
- 创建会话（POST /api/sessions）
- 获取会话列表（GET /api/sessions）
- 获取会话详情（GET /api/sessions/:id）
- 删除会话（DELETE /api/sessions/:id）

#### 4.3 消息模块
- 发送消息（POST /api/messages）
- 流式接收（SSE）
- 消息历史（GET /api/messages）

#### 4.4 知识库模块
- CRUD 操作
- 文档上传
- 向量搜索

#### 4.5 RAG 对话模块
- 流式对话（POST /api/rag/chat）
- SSE 实时接收
- 错误处理

---

### **阶段 5：ECharts 图表集成**

#### 5.1 创建图表组件
- `src/components/charts/LineChart.vue` - 折线图
- `src/components/charts/BarChart.vue` - 柱状图
- `src/components/charts/PieChart.vue` - 饼图
- `src/components/charts/GaugeChart.vue` - 仪表盘

#### 5.2 Analytics 页面图表
1. **会话趋势折线图**：展示每日会话数量
2. **消息统计柱状图**：展示消息发送量
3. **模型使用饼图**：展示不同模型的使用比例
4. **置信度仪表盘**：展示平均置信度

---

### **阶段 6：设计系统集成**

#### 6.1 使用 Design System Skills
- 调用 `/design-system` 创建设计规范
- 定义颜色系统（主色、辅色、中性色）
- 定义字体系统（字号、字重、行高）
- 定义间距系统（4px 基准）
- 定义圆角系统
- 定义阴影系统

#### 6.2 创建全局样式变量
```scss
// src/styles/variables.scss
:root {
  // 主色
  --el-color-primary: #2563eb;
  --el-color-primary-light-3: #60a5fa;
  --el-color-primary-light-5: #93bbfd;
  --el-color-primary-light-7: #bfdbfe;
  --el-color-primary-light-9: #eff6ff;
  --el-color-primary-dark-2: #1d4ed8;
  
  // 功能色
  --el-color-success: #10b981;
  --el-color-warning: #f59e0b;
  --el-color-danger: #ef4444;
  --el-color-info: #6b7280;
  
  // 中性色
  --el-text-color-primary: #1f2937;
  --el-text-color-regular: #4b5563;
  --el-text-color-secondary: #9ca3af;
  --el-text-color-placeholder: #d1d5db;
  
  // 背景色
  --el-bg-color: #ffffff;
  --el-bg-color-page: #f5f7fa;
  --el-bg-color-overlay: #ffffff;
  
  // 边框
  --el-border-color: #e5e7eb;
  --el-border-color-light: #f3f4f6;
  --el-border-color-lighter: #f9fafb;
  
  // 圆角
  --el-border-radius-base: 8px;
  --el-border-radius-small: 4px;
  --el-border-radius-large: 12px;
  
  // 阴影
  --el-box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  --el-box-shadow-light: 0 1px 2px rgba(0, 0, 0, 0.05);
  --el-box-shadow-dark: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

#### 6.3 创建设计规范文档
- 颜色使用指南
- 组件使用规范
- 图标使用规范
- 间距使用规范

---

## 📁 目录结构

```
frontend/src/
├── api/                    # API 服务层
│   ├── auth.ts
│   ├── sessions.ts
│   ├── messages.ts
│   ├── knowledge.ts
│   ├── assets.ts
│   ├── analytics.ts
│   └── rag.ts
├── components/
│   ├── charts/            # ECharts 图表组件
│   │   ├── LineChart.vue
│   │   ├── BarChart.vue
│   │   ├── PieChart.vue
│   │   └── GaugeChart.vue
│   └── common/            # 通用组件
│       ├── AppHeader.vue
│       ├── AppSidebar.vue
│       └── AppFooter.vue
├── plugins/
│   └── element.ts         # Element Plus 配置
├── styles/
│   ├── variables.scss     # 全局变量
│   ├── element.scss       # Element Plus 主题覆盖
│   └── global.scss        # 全局样式
├── utils/
│   ├── request.ts         # Axios 实例
│   ├── auth.ts            # 认证工具
│   └── format.ts          # 格式化工具
└── views/
    ├── Layout.vue         # 主布局（重构）
    ├── Home.vue           # 首页（重构）
    ├── Agents.vue         # AI 对话（重构）
    ├── Assets.vue         # 资产管理（重构）
    ├── Knowledge.vue      # 知识库（重构）
    ├── Analytics.vue      # 数据分析（重构）
    ├── Settings.vue       # 设置（重构）
    └── Login.vue          # 登录页（新增）
```

---

## 🎨 设计规范

### 颜色系统
- **主色**：#2563eb（蓝色）
- **成功**：#10b981（绿色）
- **警告**：#f59e0b（黄色）
- **危险**：#ef4444（红色）
- **信息**：#6b7280（灰色）

### 字体系统
- **主标题**：20px / 600
- **次标题**：16px / 600
- **正文**：14px / 400
- **辅助文字**：12px / 400

### 间距系统（4px 基准）
- **xs**: 4px
- **sm**: 8px
- **md**: 12px
- **lg**: 16px
- **xl**: 24px
- **2xl**: 32px

### 圆角系统
- **small**: 4px
- **base**: 8px
- **large**: 12px
- **round**: 9999px

---

## ⏱️ 时间估算

| 阶段 | 任务 | 时间 |
|------|------|------|
| 1 | 基础架构搭建 | 2 小时 |
| 2 | 图标系统迁移 | 1 小时 |
| 3 | 组件重构 | 4 小时 |
| 4 | API 对接 | 3 小时 |
| 5 | ECharts 集成 | 2 小时 |
| 6 | 设计系统集成 | 2 小时 |
| **总计** | | **14 小时** |

---

## ✅ 验收标准

1. ✅ 所有 emoji 图标替换为 Element Plus 图标
2. ✅ 使用 Element Plus 组件重构所有页面
3. ✅ ECharts 图表正常显示
4. ✅ API 对接完成，数据正常加载
5. ✅ SSE 流式对话正常工作
6. ✅ 设计风格统一，符合企业级标准
7. ✅ 响应式布局适配
8. ✅ 错误处理完善
9. ✅ 加载状态友好

---

## 🚀 开始实施

准备就绪后，按照阶段顺序逐步实施，确保每个阶段完成并测试通过后再进入下一阶段。
