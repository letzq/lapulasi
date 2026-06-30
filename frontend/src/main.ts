import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { setupElementPlus } from './plugins/element'

// 全局样式
import './styles/global.scss'

const app = createApp(App)

// 状态管理
app.use(createPinia())

// 路由
app.use(router)

// Element Plus
setupElementPlus(app)

app.mount('#app')
