/*
 * Element Plus 配置
 * 按需导入 + 图标注册
 */

import type { App } from 'vue'

// Element Plus 样式
import 'element-plus/dist/index.css'

// 完整导入 Element Plus
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

export function setupElementPlus(app: App) {
  // 注册所有图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  // 使用 Element Plus
  app.use(ElementPlus, {
    locale: zhCn,
    size: 'default'
  })
}

// 导出常用组件（方便直接使用）
export {
  ElMessage,
  ElMessageBox,
  ElNotification,
  ElLoading
} from 'element-plus'
