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
  Plus,
  Check,
  Message,
  Monitor
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const activeTab = ref('general')

const tabs = [
  { id: 'general', label: '通用', icon: Setting },
  { id: 'profile', label: '账号', icon: User },
  { id: 'notifications', label: '通知', icon: Bell },
  { id: 'security', label: '安全', icon: Lock },
  { id: 'api', label: 'API', icon: Key }
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
  browser: true,
  weeklyReport: false
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

// 获取用户头像首字
const avatarText = computed(() => {
  const name = currentUser.value?.name || currentUser.value?.email || 'U'
  return name.charAt(0).toUpperCase()
})

// 角色中文映射
const roleLabel = computed(() => {
  const map: Record<string, string> = { admin: '管理员', user: '普通用户', viewer: '只读用户' }
  return map[currentUser.value?.role || 'user'] || '用户'
})
</script>

<template>
  <div class="settings-page">
    <!-- 用户身份卡 -->
    <div class="identity-card">
      <div class="identity-left">
        <div class="avatar-circle">
          {{ avatarText }}
        </div>
        <div class="identity-info">
          <h2 class="identity-name">{{ currentUser?.name || '用户' }}</h2>
          <p class="identity-email">{{ currentUser?.email || '' }}</p>
        </div>
      </div>
      <div class="identity-right">
        <span class="role-badge">{{ roleLabel }}</span>
        <el-button class="back-btn" @click="router.back()">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回</span>
        </el-button>
      </div>
    </div>

    <!-- 水平标签栏 -->
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-item"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <el-icon><component :is="tab.icon" /></el-icon>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">

      <!-- 通用设置 -->
      <div v-if="activeTab === 'general'" class="section">
        <div class="section-header">
          <h3>通用设置</h3>
          <p>管理工作区偏好</p>
        </div>
        <div class="setting-rows">
          <div class="setting-row">
            <div class="setting-label">
              <span class="label-text">界面语言</span>
              <span class="label-desc">选择系统显示语言</span>
            </div>
            <el-select v-model="settings.language" class="setting-control" size="default">
              <el-option label="中文" value="zh" />
              <el-option label="English" value="en" />
            </el-select>
          </div>
          <div class="setting-row">
            <div class="setting-label">
              <span class="label-text">外观主题</span>
              <span class="label-desc">选择浅色或深色模式</span>
            </div>
            <el-segmented v-model="settings.theme" :options="[
              { label: '浅色', value: 'light' },
              { label: '深色', value: 'dark' },
              { label: '跟随系统', value: 'system' }
            ]" />
          </div>
          <div class="setting-row">
            <div class="setting-label">
              <span class="label-text">默认模型</span>
              <span class="label-desc">新建对话时使用的 AI 模型</span>
            </div>
            <el-select v-model="settings.defaultModel" class="setting-control" size="default">
              <el-option label="小米模型" value="xiaomi-model" />
              <el-option label="GPT-4" value="gpt-4" />
              <el-option label="Claude-3" value="claude-3" />
            </el-select>
          </div>
        </div>
        <div class="section-footer">
          <el-button type="primary" @click="handleSaveGeneral">
            <el-icon><Check /></el-icon>
            保存设置
          </el-button>
        </div>
      </div>

      <!-- 账号信息 -->
      <div v-if="activeTab === 'profile'" class="section">
        <div class="section-header">
          <h3>账号信息</h3>
          <p>查看和管理个人资料</p>
        </div>
        <div class="profile-grid">
          <div class="profile-field">
            <span class="field-label">用户名</span>
            <span class="field-value">{{ currentUser?.name || '—' }}</span>
          </div>
          <div class="profile-field">
            <span class="field-label">邮箱地址</span>
            <span class="field-value">{{ currentUser?.email || '—' }}</span>
          </div>
          <div class="profile-field">
            <span class="field-label">账号角色</span>
            <span class="field-value">
              <span class="role-tag">{{ roleLabel }}</span>
            </span>
          </div>
          <div class="profile-field">
            <span class="field-label">账号状态</span>
            <span class="field-value">
              <span class="status-dot"></span>
              正常
            </span>
          </div>
        </div>
      </div>

      <!-- 通知设置 -->
      <div v-if="activeTab === 'notifications'" class="section">
        <div class="section-header">
          <h3>通知设置</h3>
          <p>选择你希望接收的通知方式</p>
        </div>
        <div class="toggle-cards">
          <div class="toggle-card">
            <div class="toggle-icon">
              <el-icon :size="20"><Message /></el-icon>
            </div>
            <div class="toggle-info">
              <span class="toggle-title">邮件通知</span>
              <span class="toggle-desc">系统消息和预警发送到邮箱</span>
            </div>
            <el-switch v-model="notifications.email" />
          </div>
          <div class="toggle-card">
            <div class="toggle-icon">
              <el-icon :size="20"><Monitor /></el-icon>
            </div>
            <div class="toggle-info">
              <span class="toggle-title">浏览器通知</span>
              <span class="toggle-desc">通过浏览器推送实时消息</span>
            </div>
            <el-switch v-model="notifications.browser" />
          </div>
          <div class="toggle-card">
            <div class="toggle-icon">
              <el-icon :size="20"><DocumentCopy /></el-icon>
            </div>
            <div class="toggle-info">
              <span class="toggle-title">周报摘要</span>
              <span class="toggle-desc">每周发送使用情况汇总</span>
            </div>
            <el-switch v-model="notifications.weeklyReport" />
          </div>
        </div>
      </div>

      <!-- 安全设置 -->
      <div v-if="activeTab === 'security'" class="section">
        <div class="section-header">
          <h3>安全设置</h3>
          <p>保护你的账户安全</p>
        </div>
        <div class="action-cards">
          <div class="action-card">
            <div class="action-icon">
              <el-icon :size="22"><Lock /></el-icon>
            </div>
            <div class="action-info">
              <span class="action-title">双重认证</span>
              <span class="action-desc">为账户添加额外安全保障</span>
            </div>
            <el-button type="primary" plain size="default">启用</el-button>
          </div>
          <div class="action-card">
            <div class="action-icon">
              <el-icon :size="22"><Key /></el-icon>
            </div>
            <div class="action-info">
              <span class="action-title">修改密码</span>
              <span class="action-desc">定期更换密码以确保安全</span>
            </div>
            <el-button type="primary" plain size="default" @click="handleChangePassword">修改</el-button>
          </div>
          <div class="action-card">
            <div class="action-icon danger">
              <el-icon :size="22"><SwitchButton /></el-icon>
            </div>
            <div class="action-info">
              <span class="action-title">退出登录</span>
              <span class="action-desc">退出当前设备的登录状态</span>
            </div>
            <el-button type="danger" plain size="default" @click="handleLogout">退出</el-button>
          </div>
        </div>
      </div>

      <!-- API 密钥 -->
      <div v-if="activeTab === 'api'" class="section">
        <div class="section-header">
          <div class="section-header-row">
            <div>
              <h3>API 密钥</h3>
              <p>管理 API 访问密钥</p>
            </div>
            <el-button type="primary" size="default">
              <el-icon><Plus /></el-icon>
              生成新密钥
            </el-button>
          </div>
        </div>
        <div class="key-list">
          <div class="key-item">
            <div class="key-status"></div>
            <div class="key-info">
              <span class="key-name">生产环境密钥</span>
              <span class="key-value">sk-prod-••••••••••••••••</span>
            </div>
            <div class="key-actions">
              <el-button type="primary" link @click="handleCopyKey('sk-prod-key')">
                <el-icon><DocumentCopy /></el-icon>
              </el-button>
              <el-button type="danger" link>
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <div class="key-item">
            <div class="key-status"></div>
            <div class="key-info">
              <span class="key-name">开发环境密钥</span>
              <span class="key-value">sk-dev-••••••••••••••••</span>
            </div>
            <div class="key-actions">
              <el-button type="primary" link @click="handleCopyKey('sk-dev-key')">
                <el-icon><DocumentCopy /></el-icon>
              </el-button>
              <el-button type="danger" link>
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密码对话框 -->
    <el-dialog v-model="showPasswordDialog" title="修改密码" width="420px" class="password-dialog">
      <el-form label-width="80px">
        <el-form-item label="旧密码">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入旧密码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="至少 6 位" />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="再次输入新密码" />
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
  max-width: 860px;
  margin: 0 auto;
  padding-bottom: 40px;
}

/* 身份卡 */
.identity-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%);
  border-radius: 16px;
  margin-bottom: 24px;
}

.identity-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.5px;
  flex-shrink: 0;
}

.identity-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}

.identity-email {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.identity-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  background: white;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #d0d8ff;
}

.back-btn {
  border: 1px solid var(--border-color);
  background: white;
}

.back-btn:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* 标签栏 */
.tab-bar {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg-secondary);
  border-radius: 12px;
  margin-bottom: 24px;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  background: transparent;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: all 0.2s ease;
}

.tab-item:hover {
  color: var(--color-text-primary);
  background: rgba(255, 255, 255, 0.6);
}

.tab-item.active {
  color: var(--color-primary);
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  font-weight: 600;
}

/* 内容区域 */
.content-area {
  min-height: 400px;
}

/* 通用 section */
.section {
  animation: fadeSlideIn 0.25s ease;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-header {
  margin-bottom: 24px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 4px;
  letter-spacing: -0.3px;
}

.section-header p {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0;
}

.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.section-footer {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color-light);
}

/* 通用设置 - 行 */
.setting-rows {
  display: flex;
  flex-direction: column;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0;
  border-bottom: 1px solid var(--border-color-light);
}

.setting-row:last-child {
  border-bottom: none;
}

.setting-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.label-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.label-desc {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

.setting-control {
  width: 200px;
}

/* 账号信息 - 网格 */
.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--border-color-light);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color-light);
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px 24px;
  background: white;
}

.field-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-placeholder);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-value {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-tag {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-primary);
  background: #f0f4ff;
  padding: 2px 10px;
  border-radius: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52c41a;
  display: inline-block;
}

/* 通知设置 - 卡片 */
.toggle-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toggle-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: white;
  border: 1px solid var(--border-color-light);
  border-radius: 12px;
  transition: border-color 0.2s;
}

.toggle-card:hover {
  border-color: var(--color-primary-light);
}

.toggle-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.toggle-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.toggle-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.toggle-desc {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

/* 安全设置 - 操作卡 */
.action-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  background: white;
  border: 1px solid var(--border-color-light);
  border-radius: 12px;
  transition: border-color 0.2s;
}

.action-card:hover {
  border-color: var(--color-primary-light);
}

.action-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #f0f4ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.action-icon.danger {
  background: #fff2f0;
  color: #ff4d4f;
}

.action-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.action-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.action-desc {
  font-size: 12px;
  color: var(--color-text-placeholder);
}

/* API 密钥 */
.key-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.key-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  background: white;
  border: 1px solid var(--border-color-light);
  border-radius: 12px;
}

.key-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52c41a;
  flex-shrink: 0;
}

.key-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.key-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.key-value {
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--color-text-placeholder);
  letter-spacing: 0.3px;
}

.key-actions {
  display: flex;
  gap: 4px;
}

/* 密码对话框 */
.password-dialog :deep(.el-dialog__header) {
  padding: 20px 24px 16px;
}

.password-dialog :deep(.el-dialog__body) {
  padding: 0 24px 8px;
}

.password-dialog :deep(.el-dialog__footer) {
  padding: 12px 24px 20px;
}

/* 响应式 */
@media (max-width: 640px) {
  .identity-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .identity-right {
    width: 100%;
    justify-content: space-between;
  }

  .tab-bar {
    overflow-x: auto;
  }

  .tab-item {
    padding: 10px 12px;
    font-size: 13px;
    white-space: nowrap;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }

  .setting-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .setting-control {
    width: 100%;
  }
}
</style>
