<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { Monitor, User, Lock } from '@element-plus/icons-vue'

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
    <div class="login-card">
      <!-- Logo -->
      <div class="login-logo">
        <div class="logo-icon">
          <el-icon :size="24"><Monitor /></el-icon>
        </div>
      </div>

      <!-- 标题 -->
      <h1 class="login-title">{{ isRegister ? '创建账户' : '登录' }}</h1>
      <p class="login-subtitle">{{ isRegister ? '注册以开始使用 Enterprise Workspace' : '欢迎回来，请登录您的账户' }}</p>

      <!-- 表单 -->
      <el-form :model="form" class="login-form" @submit.prevent="isRegister ? handleRegister() : handleLogin()">
        <el-form-item v-if="isRegister">
          <el-input
            v-model="form.name"
            placeholder="姓名"
            size="large"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="form.email"
            placeholder="邮箱"
            size="large"
            type="email"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="form.password"
            placeholder="密码"
            size="large"
            type="password"
            show-password
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="submit-btn"
            :loading="loading"
            @click="isRegister ? handleRegister() : handleLogin()"
          >
            {{ isRegister ? '注册' : '登录' }}
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 切换 -->
      <div class="form-footer">
        <span class="toggle-text">
          {{ isRegister ? '已有账户？' : '没有账户？' }}
          <el-button type="primary" link @click="toggleMode">
            {{ isRegister ? '立即登录' : '立即注册' }}
          </el-button>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7f8fa;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: #ffffff;
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.login-logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3370ff, #5b8def);
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.login-title {
  font-size: 22px;
  font-weight: 600;
  color: #1f2329;
  text-align: center;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #8f959e;
  text-align: center;
  margin: 0 0 32px 0;
}

.login-form {
  width: 100%;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
}

.form-footer {
  text-align: center;
  margin-top: 24px;
}

.toggle-text {
  font-size: 14px;
  color: #8f959e;
}

@media (max-width: 480px) {
  .login-card {
    padding: 32px 24px;
  }
}
</style>
