<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { User, Lock, ArrowRight } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const loading = ref(false)
const isRegister = ref(false)

const form = reactive({
  email: '',
  password: '',
  name: ''
})

const handleLogin = async () => {
  if (!form.email || !form.password) {
    ElMessage.warning('请输入邮箱和密码')
    return
  }
  loading.value = true
  try {
    await authStore.login({ email: form.email, password: form.password })
    ElMessage.success('登录成功')
    router.push((route.query.redirect as string) || '/home')
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!form.email || !form.password || !form.name) {
    ElMessage.warning('请填写必填字段')
    return
  }
  loading.value = true
  try {
    await authStore.register({ email: form.email, password: form.password, name: form.name })
    ElMessage.success('注册成功')
    router.push((route.query.redirect as string) || '/home')
  } catch (error: any) {
    ElMessage.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}

const toggleMode = () => {
  isRegister.value = !isRegister.value
  form.email = ''
  form.password = ''
  form.name = ''
}
</script>

<template>
  <div class="login-page">
    <!-- Left: Brand Panel -->
    <div class="brand-panel">
      <div class="brand-content">
        <div class="brand-logo">
          <div class="logo-mark">
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="white" fill-opacity="0.15"/>
              <path d="M8 16C8 11.5817 11.5817 8 16 8V8C20.4183 8 24 11.5817 24 16V16C24 20.4183 20.4183 24 16 24V24C11.5817 24 8 20.4183 8 16V16Z" stroke="white" stroke-width="2"/>
              <path d="M12 16L15 19L20 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="logo-text">Enterprise Workspace</span>
        </div>

        <h1 class="brand-headline">
          智能知识<br/>
          <span class="headline-accent">驱动企业效率</span>
        </h1>

        <p class="brand-desc">
          基于 RAG 技术的新一代企业知识管理平台，<br/>
          让 AI 成为每一位员工的专属知识助手。
        </p>

        <div class="brand-features">
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 20 20" fill="none"><path d="M10 2L12.09 7.26L18 8.27L14 12.14L14.81 18.02L10 15.27L5.19 18.02L6 12.14L2 8.27L7.91 7.26L10 2Z" fill="currentColor"/></svg>
            </div>
            <div>
              <div class="feature-title">智能问答</div>
              <div class="feature-desc">基于企业知识库的精准回答</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 20 20" fill="none"><path d="M3 4H17V6H3V4ZM3 9H17V11H3V9ZM3 14H12V16H3V14Z" fill="currentColor"/></svg>
            </div>
            <div>
              <div class="feature-title">文档管理</div>
              <div class="feature-desc">多格式文档智能解析入库</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg viewBox="0 0 20 20" fill="none"><path d="M10 2C5.58 2 2 5.58 2 10C2 14.42 5.58 18 10 18C14.42 18 18 14.42 18 10C18 5.58 14.42 2 10 2ZM10 16C6.69 16 4 13.31 4 10C4 6.69 6.69 4 10 4C13.31 4 16 6.69 16 10C16 13.31 13.31 16 10 16ZM10.5 5H9V11L14.25 14.15L15 12.92L10.5 10.25V5Z" fill="currentColor"/></svg>
            </div>
            <div>
              <div class="feature-title">实时分析</div>
              <div class="feature-desc">数据洞察与使用分析看板</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Decorative grid -->
      <div class="grid-decoration">
        <div class="grid-line" v-for="i in 6" :key="'h'+i" :style="{ top: `${i * 16.66}%` }"></div>
        <div class="grid-line vertical" v-for="i in 6" :key="'v'+i" :style="{ left: `${i * 16.66}%` }"></div>
      </div>

      <!-- Glow accent -->
      <div class="glow-orb glow-1"></div>
      <div class="glow-orb glow-2"></div>
    </div>

    <!-- Right: Form Panel -->
    <div class="form-panel">
      <div class="form-wrapper">
        <!-- Mobile logo -->
        <div class="mobile-logo">
          <div class="logo-mark small">
            <svg viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#3370ff"/>
              <path d="M8 16C8 11.58 11.58 8 16 8C20.42 8 24 11.58 24 16C24 20.42 20.42 24 16 24C11.58 24 8 20.42 8 16Z" stroke="white" stroke-width="2"/>
              <path d="M12 16L15 19L20 13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <!-- Header -->
        <div class="form-header">
          <h2 class="form-title">{{ isRegister ? '创建账户' : '欢迎回来' }}</h2>
          <p class="form-subtitle">{{ isRegister ? '注册以开始使用 Enterprise Workspace' : '登录您的账户以继续' }}</p>
        </div>

        <!-- Form -->
        <el-form
          :model="form"
          class="login-form"
          @submit.prevent="isRegister ? handleRegister() : handleLogin()"
        >
          <div class="input-group" v-if="isRegister">
            <label class="input-label">姓名</label>
            <el-input
              v-model="form.name"
              placeholder="请输入您的姓名"
              size="large"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="input-group">
            <label class="input-label">邮箱地址</label>
            <el-input
              v-model="form.email"
              placeholder="name@company.com"
              size="large"
              type="email"
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </div>

          <div class="input-group">
            <label class="input-label">密码</label>
            <el-input
              v-model="form.password"
              placeholder="请输入密码"
              size="large"
              type="password"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </div>

          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loading"
            @click="isRegister ? handleRegister() : handleLogin()"
          >
            <span>{{ isRegister ? '创建账户' : '登录' }}</span>
            <el-icon class="btn-arrow"><ArrowRight /></el-icon>
          </el-button>
        </el-form>

        <!-- Divider -->
        <div class="form-divider">
          <span>或</span>
        </div>

        <!-- Switch mode -->
        <div class="form-footer">
          <span class="toggle-text">
            {{ isRegister ? '已有账户？' : '没有账户？' }}
            <button class="toggle-btn" @click="toggleMode">
              {{ isRegister ? '立即登录' : '立即注册' }}
            </button>
          </span>
        </div>

        <!-- Terms -->
        <p class="terms-text">
          登录即表示您同意我们的<a href="#">服务条款</a>和<a href="#">隐私政策</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  background: #f7f8fa;
}

/* ===== Brand Panel ===== */
.brand-panel {
  position: relative;
  width: 52%;
  min-height: 100vh;
  background: linear-gradient(160deg, #1a1f36 0%, #0d1224 40%, #0a1628 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 60px;
}

.brand-content {
  position: relative;
  z-index: 2;
  max-width: 520px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 56px;
}

.logo-mark {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-mark.small {
  width: 36px;
  height: 36px;
}

.logo-mark svg {
  width: 100%;
  height: 100%;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: -0.02em;
}

.brand-headline {
  font-size: 48px;
  font-weight: 700;
  line-height: 1.15;
  color: #ffffff;
  margin: 0 0 24px 0;
  letter-spacing: -0.03em;
}

.headline-accent {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-desc {
  font-size: 16px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 56px 0;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  flex-shrink: 0;
}

.feature-icon svg {
  width: 20px;
  height: 20px;
}

.feature-title {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 4px;
}

.feature-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

/* ===== Grid Decoration ===== */
.grid-decoration {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.grid-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.03);
}

.grid-line.vertical {
  top: 0;
  bottom: 0;
  width: 1px;
  height: auto;
}

/* ===== Glow Effects ===== */
.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  z-index: 1;
}

.glow-1 {
  width: 400px;
  height: 400px;
  background: rgba(59, 130, 246, 0.12);
  top: -100px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.glow-2 {
  width: 300px;
  height: 300px;
  background: rgba(139, 92, 246, 0.1);
  bottom: -50px;
  left: -50px;
  animation: float 10s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(30px, -20px); }
}

/* ===== Form Panel ===== */
.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #ffffff;
}

.form-wrapper {
  width: 100%;
  max-width: 420px;
}

.mobile-logo {
  display: none;
  margin-bottom: 32px;
}

/* ===== Form Header ===== */
.form-header {
  margin-bottom: 40px;
}

.form-title {
  font-size: 28px;
  font-weight: 700;
  color: #1f2329;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.form-subtitle {
  font-size: 15px;
  color: #8f959e;
  margin: 0;
}

/* ===== Form ===== */
.login-form {
  width: 100%;
}

.input-group {
  margin-bottom: 24px;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #1f2329;
  margin-bottom: 8px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding: 4px 12px;
  box-shadow: 0 0 0 1px #e0e3e8;
  transition: all 0.2s;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px #3370ff;
}

.login-form :deep(.el-input__inner) {
  font-size: 14px;
  height: 40px;
}

.login-form :deep(.el-input__prefix) {
  color: #8f959e;
}

.submit-btn {
  width: 100%;
  height: 48px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 8px;
  background: #3370ff;
  border-color: #3370ff;
  transition: all 0.2s;
}

.submit-btn:hover {
  background: #2860e1;
  border-color: #2860e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(51, 112, 255, 0.3);
}

.btn-arrow {
  margin-left: 6px;
  transition: transform 0.2s;
}

.submit-btn:hover .btn-arrow {
  transform: translateX(3px);
}

/* ===== Divider ===== */
.form-divider {
  display: flex;
  align-items: center;
  margin: 28px 0;
  gap: 16px;
}

.form-divider::before,
.form-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e8e9eb;
}

.form-divider span {
  font-size: 13px;
  color: #b0b5bd;
}

/* ===== Footer ===== */
.form-footer {
  text-align: center;
  margin-bottom: 24px;
}

.toggle-text {
  font-size: 14px;
  color: #8f959e;
}

.toggle-btn {
  background: none;
  border: none;
  color: #3370ff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  transition: color 0.2s;
}

.toggle-btn:hover {
  color: #2860e1;
}

.terms-text {
  text-align: center;
  font-size: 12px;
  color: #b0b5bd;
  line-height: 1.6;
}

.terms-text a {
  color: #8f959e;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.terms-text a:hover {
  color: #3370ff;
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .brand-panel {
    display: none;
  }

  .mobile-logo {
    display: flex;
  }

  .form-panel {
    padding: 32px 24px;
  }
}

@media (max-width: 480px) {
  .form-wrapper {
    max-width: 100%;
  }

  .form-title {
    font-size: 24px;
  }
}
</style>
