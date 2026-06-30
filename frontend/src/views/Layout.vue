<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import {
  HomeFilled,
  FolderOpened,
  Collection,
  ChatDotRound,
  DataAnalysis,
  Monitor,
  Search,
  Bell,
  User,
  Setting,
  SwitchButton,
  Plus,
  Expand,
  Fold
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const searchQuery = ref('')
const isCollapsed = ref(false)

const menuItems = [
  { id: 'home', label: '首页', icon: HomeFilled, path: '/home' },
  { id: 'assets', label: '资产管理', icon: FolderOpened, path: '/assets' },
  { id: 'knowledge', label: '知识库', icon: Collection, path: '/knowledge' },
  { id: 'agents', label: 'AI 对话', icon: ChatDotRound, path: '/agents' },
  { id: 'analytics', label: '数据分析', icon: DataAnalysis, path: '/analytics' }
]

const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/')
const navigateTo = (path: string) => router.push(path)
const currentUser = computed(() => authStore.currentUser)

const handleLogout = () => {
  authStore.logout()
  ElMessage.success('已退出登录')
  router.push('/login')
}
</script>

<template>
  <el-container class="layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapsed ? '64px' : '220px'" class="sidebar">
      <div class="sidebar-header">
        <div class="logo" :class="{ collapsed: isCollapsed }">
          <div class="logo-icon">
            <el-icon :size="20"><Monitor /></el-icon>
          </div>
          <div v-show="!isCollapsed" class="logo-text">
            <div class="logo-title">Enterprise</div>
            <div class="logo-subtitle">Workspace</div>
          </div>
        </div>
      </div>

      <el-scrollbar class="sidebar-menu-wrapper">
        <div class="menu-list">
          <div
            v-for="item in menuItems"
            :key="item.id"
            class="menu-item"
            :class="{ active: isActive(item.path) }"
            @click="navigateTo(item.path)"
          >
            <div class="menu-item-bar" v-if="isActive(item.path)"></div>
            <el-icon class="menu-item-icon"><component :is="item.icon" /></el-icon>
            <span v-show="!isCollapsed" class="menu-item-label">{{ item.label }}</span>
          </div>
        </div>
      </el-scrollbar>

      <div class="sidebar-footer">
        <el-button
          class="new-chat-btn"
          @click="navigateTo('/agents')"
        >
          <el-icon><Plus /></el-icon>
          <span v-if="!isCollapsed">新建对话</span>
        </el-button>
      </div>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶栏 -->
      <el-header class="header">
        <div class="header-left">
          <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
            <el-icon :size="18"><Fold v-if="!isCollapsed" /><Expand v-else /></el-icon>
          </button>
          <el-input
            v-model="searchQuery"
            placeholder="搜索知识中心..."
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="header-right">
          <button class="header-icon-btn">
            <el-icon :size="18"><Bell /></el-icon>
          </button>

          <el-dropdown trigger="click">
            <div class="user-info">
              <el-avatar :size="32" class="user-avatar">
                {{ currentUser?.name?.charAt(0) || 'U' }}
              </el-avatar>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item @click="navigateTo('/settings')">
                  <el-icon><Setting /></el-icon>
                  <span>设置</span>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 页面内容 -->
      <el-main class="page-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  height: 100vh;
  overflow: hidden;
}

/* ========== 侧边栏（白色） ========== */
.sidebar {
  background-color: #ffffff;
  border-right: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
}

.sidebar-header {
  padding: 16px;
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}

.logo.collapsed {
  justify-content: center;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3370ff, #5b8def);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.logo-text {
  white-space: nowrap;
}

.logo-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2329;
  line-height: 1.2;
}

.logo-subtitle {
  font-size: 11px;
  color: #8f959e;
}

/* ========== 菜单 ========== */
.sidebar-menu-wrapper {
  flex: 1;
  overflow: hidden;
}

.menu-list {
  padding: 4px 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 40px;
  padding: 0 12px;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  color: #646a73;
  font-size: 14px;
  transition: all 0.15s ease;
  margin-bottom: 2px;
}

.menu-item:hover {
  background-color: #f5f6f7;
  color: #1f2329;
}

.menu-item.active {
  background-color: #f0f5ff;
  color: #3370ff;
  font-weight: 500;
}

.menu-item-bar {
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background-color: #3370ff;
  border-radius: 0 2px 2px 0;
}

.menu-item-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.menu-item-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ========== 侧边栏底部 ========== */
.sidebar-footer {
  padding: 12px;
  flex-shrink: 0;
}

.new-chat-btn {
  width: 100%;
  height: 36px;
  background: #ffffff;
  border: 1px solid #3370ff;
  color: #3370ff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.15s ease;
}

.new-chat-btn:hover {
  background: #f0f5ff;
}

/* ========== 顶栏 ========== */
.main-container {
  background-color: #f7f8fa;
}

.header {
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px !important;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #646a73;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.collapse-btn:hover {
  background-color: #f5f6f7;
  color: #1f2329;
}

.search-input {
  width: 280px;
}

:deep(.search-input .el-input__wrapper) {
  background-color: #f5f6f7;
  border-radius: 9999px;
  box-shadow: none !important;
}

:deep(.search-input .el-input__wrapper:hover),
:deep(.search-input .el-input__wrapper.is-focus) {
  background-color: #ffffff;
  box-shadow: 0 0 0 1px #3370ff inset !important;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #646a73;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.header-icon-btn:hover {
  background-color: #f5f6f7;
  color: #1f2329;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: background-color 0.15s ease;
}

.user-info:hover {
  background-color: #f5f6f7;
}

.user-avatar {
  background-color: #3370ff;
  color: white;
  font-weight: 600;
  font-size: 13px;
}

.page-content {
  padding: 24px;
  overflow-y: auto;
}
</style>
