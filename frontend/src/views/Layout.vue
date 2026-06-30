<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const searchQuery = ref('')

const menuItems = [
  { id: 'home', label: 'Home', icon: '🏠', path: '/home' },
  { id: 'assets', label: 'Assets', icon: '📁', path: '/assets' },
  { id: 'knowledge', label: 'Knowledge', icon: '📚', path: '/knowledge' },
  { id: 'agents', label: 'Agents', icon: '🤖', path: '/agents' },
  { id: 'analytics', label: 'Analytics', icon: '📊', path: '/analytics' }
]

const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/')
const navigateTo = (path: string) => router.push(path)
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">🔄</div>
          <div class="logo-text">
            <div class="logo-title">Enterprise</div>
            <div class="logo-subtitle">Workspace</div>
            <div class="logo-desc">AI Operations</div>
          </div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <button v-for="item in menuItems" :key="item.id" class="nav-item" :class="{ active: isActive(item.path) }" @click="navigateTo(item.path)">
          <span class="nav-icon">{{ item.icon }}</span>
          <span class="nav-label">{{ item.label }}</span>
        </button>
      </nav>
      <div class="sidebar-footer">
        <button class="nav-item" @click="router.push('/settings')">
          <span class="nav-icon">⚙️</span>
          <span class="nav-label">Settings</span>
        </button>
        <button class="new-asset-btn">+ New Asset</button>
      </div>
    </aside>

    <div class="main-content">
      <header class="top-bar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input v-model="searchQuery" type="text" class="search-input" placeholder="Search KnowledgeCenter..." />
        </div>
        <div class="top-bar-actions">
          <button class="btn-icon"><span>✉️</span><span class="action-text">Invite</span></button>
          <button class="btn-icon">🔔</button>
          <button class="btn-icon">❓</button>
          <div class="user-avatar">
            <img v-if="authStore.currentUser?.avatar" :src="authStore.currentUser.avatar" :alt="authStore.currentUser.name" />
            <span v-else>{{ authStore.currentUser?.name?.charAt(0) || 'U' }}</span>
          </div>
        </div>
      </header>
      <main class="page-content"><router-view /></main>
    </div>
  </div>
</template>

<style scoped>
.layout { display: flex; height: 100vh; background-color: var(--bg-secondary); }
.sidebar { width: 200px; background-color: var(--bg-primary); border-right: 1px solid var(--border-color); display: flex; flex-direction: column; flex-shrink: 0; }
.sidebar-header { padding: 20px; border-bottom: 1px solid var(--border-color); }
.logo { display: flex; align-items: center; gap: 12px; }
.logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #2563eb, #3b82f6); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; color: white; }
.logo-title, .logo-subtitle { font-size: 16px; font-weight: 700; color: var(--text-primary); line-height: 1.2; }
.logo-desc { font-size: 12px; color: var(--text-secondary); }
.sidebar-nav { flex: 1; padding: 12px; overflow-y: auto; }
.nav-item { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 16px; margin-bottom: 4px; background: transparent; border: none; border-radius: var(--radius-md); color: var(--text-secondary); font-size: 14px; font-weight: 500; text-align: left; cursor: pointer; transition: all 0.2s ease; }
.nav-item:hover { background-color: var(--bg-tertiary); color: var(--text-primary); }
.nav-item.active { background-color: var(--color-primary); color: white; }
.nav-icon { font-size: 18px; }
.sidebar-footer { padding: 12px; border-top: 1px solid var(--border-color); }
.new-asset-btn { width: 100%; padding: 12px; margin-top: 8px; background-color: var(--color-primary); color: white; border: none; border-radius: var(--radius-md); font-size: 14px; font-weight: 600; cursor: pointer; }
.new-asset-btn:hover { background-color: var(--color-primary-hover); }
.main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.top-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; background-color: var(--bg-primary); border-bottom: 1px solid var(--border-color); }
.search-box { display: flex; align-items: center; gap: 8px; padding: 8px 16px; background-color: var(--bg-tertiary); border-radius: var(--radius-full); width: 400px; }
.search-icon { color: var(--text-tertiary); }
.search-input { flex: 1; background: transparent; border: none; outline: none; font-size: 14px; color: var(--text-primary); }
.search-input::placeholder { color: var(--text-tertiary); }
.top-bar-actions { display: flex; align-items: center; gap: 8px; }
.action-text { font-size: 14px; font-weight: 500; color: var(--color-primary); }
.user-avatar { width: 36px; height: 36px; border-radius: var(--radius-full); background-color: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; margin-left: 8px; cursor: pointer; }
.user-avatar img { width: 100%; height: 100%; border-radius: var(--radius-full); object-fit: cover; }
.page-content { flex: 1; overflow-y: auto; padding: 24px; }
</style>
