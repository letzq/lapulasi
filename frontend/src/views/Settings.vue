<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { changePassword } from '@/api/auth'
import { ElMessage } from 'element-plus'
import {
  Setting,
  User,
  Bell,
  Lock,
  Key,
  ArrowLeft,
  SwitchButton,
  DocumentCopy,
  Delete,
  Plus
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const activeTab = ref('general')

const tabs = [
  { id: 'general', label: '通用设置', icon: Setting },
  { id: 'profile', label: '个人信息', icon: User },
  { id: 'notifications', label: '通知设置', icon: Bell },
  { id: 'security', label: '安全设置', icon: Lock },
  { id: 'api', label: 'API 密钥', icon: Key }
]

const currentUser = computed(() => authStore.currentUser)

// 通用设置
const settings = ref({
  language: 'zh',
  theme: 'light',
  defaultModel: 'xiaomi-model'
})

// 通知设置
const notifications = ref({
  email: true,
  browser: true
})

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}

const handleSaveGeneral = () => {
  ElMessage.success('设置已保存')
}

// 修改密码
const showPasswordDialog = ref(false)
const passwordForm = ref({ oldPassword: '', newPassword: '', confirmPassword: '' })
const passwordLoading = ref(false)

const handleChangePassword = () => {
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  showPasswordDialog.value = true
}

const handleSubmitPassword = async () => {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  if (passwordForm.value.newPassword.length < 6) {
    ElMessage.error('新密码长度不能少于6位')
    return
  }
  passwordLoading.value = true
  try {
    await changePassword({
      oldPassword: passwordForm.value.oldPassword,
      newPassword: passwordForm.value.newPassword
    })
    ElMessage.success('密码修改成功')
    showPasswordDialog.value = false
  } catch (error) {
    ElMessage.error('密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}

const handleCopyKey = (key: string) => {
  navigator.clipboard.writeText(key)
  ElMessage.success('已复制到剪贴板')
}
</script>

<template>
  <div class="settings-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-button class="back-btn" @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回</span>
      </el-button>
      <h1>设置</h1>
    </div>

    <div class="settings-layout">
      <!-- 侧边栏导航 -->
      <div class="settings-sidebar">
        <el-menu
          :default-active="activeTab"
          class="settings-menu"
        >
          <el-menu-item
            v-for="tab in tabs"
            :key="tab.id"
            :index="tab.id"
            @click="activeTab = tab.id"
          >
            <el-icon><component :is="tab.icon" /></el-icon>
            <span>{{ tab.label }}</span>
          </el-menu-item>
        </el-menu>

        <div class="sidebar-footer">
          <el-button type="danger" plain class="logout-btn" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="settings-content">
        <!-- 通用设置 -->
        <el-card v-if="activeTab === 'general'" class="settings-card" shadow="never">
          <template #header>
            <h2>通用设置</h2>
            <p class="section-desc">管理您的工作区偏好设置</p>
          </template>
          <el-form label-width="120px" class="settings-form">
            <el-form-item label="语言">
              <el-select v-model="settings.language" style="width: 200px">
                <el-option label="中文" value="zh" />
                <el-option label="English" value="en" />
              </el-select>
            </el-form-item>
            <el-form-item label="主题">
              <el-radio-group v-model="settings.theme">
                <el-radio value="light">浅色</el-radio>
                <el-radio value="dark">深色</el-radio>
                <el-radio value="system">跟随系统</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="默认模型">
              <el-select v-model="settings.defaultModel" style="width: 200px">
                <el-option label="小米模型" value="xiaomi-model" />
                <el-option label="GPT-4" value="gpt-4" />
                <el-option label="Claude-3" value="claude-3" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveGeneral">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 个人信息 -->
        <el-card v-if="activeTab === 'profile'" class="settings-card" shadow="never">
          <template #header>
            <h2>个人信息</h2>
            <p class="section-desc">管理您的个人资料</p>
          </template>
          <el-form label-width="120px" class="settings-form">
            <el-form-item label="用户名">
              <el-input :value="currentUser?.username" disabled />
            </el-form-item>
            <el-form-item label="姓名">
              <el-input :value="currentUser?.name" disabled />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input :value="currentUser?.email" disabled />
            </el-form-item>
            <el-form-item label="角色">
              <el-tag>{{ currentUser?.role || 'user' }}</el-tag>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 通知设置 -->
        <el-card v-if="activeTab === 'notifications'" class="settings-card" shadow="never">
          <template #header>
            <h2>通知设置</h2>
            <p class="section-desc">配置您的通知偏好</p>
          </template>
          <div class="notification-settings">
            <div class="notification-item">
              <div class="notification-info">
                <h3>邮件通知</h3>
                <p>接收邮件通知提醒</p>
              </div>
              <el-switch v-model="notifications.email" />
            </div>
            <div class="notification-item">
              <div class="notification-info">
                <h3>浏览器通知</h3>
                <p>接收浏览器推送通知</p>
              </div>
              <el-switch v-model="notifications.browser" />
            </div>
          </div>
        </el-card>

        <!-- 安全设置 -->
        <el-card v-if="activeTab === 'security'" class="settings-card" shadow="never">
          <template #header>
            <h2>安全设置</h2>
            <p class="section-desc">管理您的账户安全</p>
          </template>
          <div class="security-settings">
            <div class="security-item">
              <div class="security-info">
                <h3>双重认证</h3>
                <p>为您的账户添加额外安全保障</p>
              </div>
              <el-button type="primary" plain>启用</el-button>
            </div>
            <div class="security-item">
              <div class="security-info">
                <h3>修改密码</h3>
                <p>更新您的账户密码</p>
              </div>
              <el-button type="primary" plain @click="handleChangePassword">修改</el-button>
            </div>
          </div>
        </el-card>

        <!-- API 密钥 -->
        <el-card v-if="activeTab === 'api'" class="settings-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div>
                <h2>API 密钥</h2>
                <p class="section-desc">管理您的 API 访问密钥</p>
              </div>
              <el-button type="primary">
                <el-icon><Plus /></el-icon>
                <span>生成新密钥</span>
              </el-button>
            </div>
          </template>
          <div class="api-keys-list">
            <div class="api-key-item">
              <div class="api-key-info">
                <h3>生产环境密钥</h3>
                <p class="api-key-value">sk-••••••••••••••••••••••••</p>
              </div>
              <div class="api-key-actions">
                <el-button type="primary" link @click="handleCopyKey('sk-prod-key')">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
                <el-button type="danger" link>
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="api-key-item">
              <div class="api-key-info">
                <h3>开发环境密钥</h3>
                <p class="api-key-value">sk-dev-••••••••••••••••••••</p>
              </div>
              <div class="api-key-actions">
                <el-button type="primary" link @click="handleCopyKey('sk-dev-key')">
                  <el-icon><DocumentCopy /></el-icon>
                </el-button>
                <el-button type="danger" link>
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px">
      <el-form label-width="80px">
        <el-form-item label="旧密码">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入旧密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码（至少6位）" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showPasswordDialog = false">取消</el-button>
        <el-button type="primary" :loading="passwordLoading" @click="handleSubmitPassword">确认修改</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 1000px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.back-btn {
  border: 1px solid var(--border-color);
  background: transparent;
}

.back-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.settings-layout {
  display: flex;
  gap: 24px;
}

.settings-sidebar {
  width: 200px;
  flex-shrink: 0;
}

.settings-menu {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
  overflow: hidden;
}

.settings-menu :deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
}

.sidebar-footer {
  margin-top: 16px;
}

.logout-btn {
  width: 100%;
}

.settings-content {
  flex: 1;
  min-width: 0;
}

.settings-card {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color-light);
}

.settings-card :deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color-light);
}

.settings-card :deep(.el-card__body) {
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.settings-card h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
}

.section-desc {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.settings-form {
  max-width: 500px;
}

/* 通知设置 */
.notification-settings {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color-light);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-info h3 {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
}

.notification-info p {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* 安全设置 */
.security-settings {
  display: flex;
  flex-direction: column;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color-light);
}

.security-item:last-child {
  border-bottom: none;
}

.security-info h3 {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
}

.security-info p {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

/* API 密钥 */
.api-keys-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.api-key-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.api-key-info h3 {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin: 0 0 4px 0;
}

.api-key-value {
  font-size: 13px;
  font-family: var(--font-family-mono);
  color: var(--color-text-secondary);
  margin: 0;
}

.api-key-actions {
  display: flex;
  gap: 4px;
}
</style>
