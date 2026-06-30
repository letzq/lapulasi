<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const activeTab = ref('general')
const tabs = [
  { id: 'general', label: 'General', icon: '⚙️' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'security', label: 'Security', icon: '🔒' },
  { id: 'api', label: 'API Keys', icon: '🔑' }
]
</script>

<template>
  <div class="settings-page">
    <div class="settings-header">
      <button class="back-btn" @click="router.back()">← Back</button>
      <h1>Settings</h1>
    </div>
    <div class="settings-layout">
      <div class="settings-sidebar">
        <nav class="tabs-nav">
          <button v-for="tab in tabs" :key="tab.id" class="tab-btn" :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
            <span>{{ tab.icon }}</span><span>{{ tab.label }}</span>
          </button>
        </nav>
        <div class="sidebar-footer"><button class="logout-btn" @click="authStore.logout(); router.push('/')">🚪 Logout</button></div>
      </div>
      <div class="settings-content">
        <div v-if="activeTab === 'general'" class="settings-section">
          <h2>General Settings</h2><p class="section-desc">Manage your workspace preferences</p>
          <div class="setting-item"><div class="setting-info"><div class="setting-label">Language</div><div class="setting-desc">Select your preferred language</div></div><select class="setting-select"><option>English</option><option>中文</option></select></div>
          <div class="setting-item"><div class="setting-info"><div class="setting-label">Theme</div><div class="setting-desc">Choose your preferred theme</div></div><select class="setting-select"><option>Light</option><option>Dark</option><option>System</option></select></div>
          <div class="setting-item"><div class="setting-info"><div class="setting-label">Default Model</div><div class="setting-desc">Select the default AI model</div></div><select class="setting-select"><option>GPT-4-Enterprise</option><option>Claude-3-Enterprise</option></select></div>
        </div>
        <div v-if="activeTab === 'profile'" class="settings-section">
          <h2>Profile</h2><p class="section-desc">Manage your personal information</p>
          <div class="profile-form">
            <div class="form-group"><label>Name</label><input type="text" :value="authStore.currentUser?.name" readonly /></div>
            <div class="form-group"><label>Email</label><input type="email" :value="authStore.currentUser?.email" readonly /></div>
            <div class="form-group"><label>Role</label><input type="text" :value="authStore.currentUser?.role" readonly /></div>
          </div>
        </div>
        <div v-if="activeTab === 'notifications'" class="settings-section">
          <h2>Notifications</h2><p class="section-desc">Configure notification preferences</p>
          <div class="setting-item"><div class="setting-info"><div class="setting-label">Email Notifications</div><div class="setting-desc">Receive email notifications</div></div><label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label></div>
          <div class="setting-item"><div class="setting-info"><div class="setting-label">Browser Notifications</div><div class="setting-desc">Receive browser push notifications</div></div><label class="toggle"><input type="checkbox" checked /><span class="toggle-slider"></span></label></div>
        </div>
        <div v-if="activeTab === 'security'" class="settings-section">
          <h2>Security</h2><p class="section-desc">Manage your security settings</p>
          <div class="setting-item"><div class="setting-info"><div class="setting-label">Two-Factor Authentication</div><div class="setting-desc">Add extra security to your account</div></div><button class="btn btn-secondary">Enable</button></div>
          <div class="setting-item"><div class="setting-info"><div class="setting-label">Change Password</div><div class="setting-desc">Update your account password</div></div><button class="btn btn-secondary">Change</button></div>
        </div>
        <div v-if="activeTab === 'api'" class="settings-section">
          <h2>API Keys</h2><p class="section-desc">Manage your API keys</p>
          <div class="api-keys-list">
            <div class="api-key-item"><div><div class="api-key-name">Production Key</div><div class="api-key-value">sk-••••••••••••••••••••••••</div></div><div class="api-key-actions"><button class="btn-icon">📋</button><button class="btn-icon">🗑️</button></div></div>
            <div class="api-key-item"><div><div class="api-key-name">Development Key</div><div class="api-key-value">sk-dev-••••••••••••••••••••</div></div><div class="api-key-actions"><button class="btn-icon">📋</button><button class="btn-icon">🗑️</button></div></div>
          </div>
          <button class="btn btn-primary">+ Generate New Key</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page { max-width: 1000px; margin: 0 auto; padding: 24px; }
.settings-header { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
.back-btn { padding: 8px 12px; background: transparent; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 14px; color: var(--text-secondary); }
.back-btn:hover { background-color: var(--bg-tertiary); color: var(--text-primary); }
.settings-header h1 { font-size: 28px; font-weight: 700; }
.settings-layout { display: flex; gap: 24px; }
.settings-sidebar { width: 200px; flex-shrink: 0; }
.tabs-nav { display: flex; flex-direction: column; gap: 4px; padding: 8px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
.tab-btn { display: flex; align-items: center; gap: 10px; padding: 10px 12px; background: transparent; border: none; border-radius: var(--radius-md); font-size: 14px; color: var(--text-secondary); text-align: left; cursor: pointer; }
.tab-btn:hover { background-color: var(--bg-tertiary); color: var(--text-primary); }
.tab-btn.active { background-color: var(--color-primary); color: white; }
.sidebar-footer { margin-top: 16px; padding: 8px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
.logout-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 10px; background: transparent; border: none; border-radius: var(--radius-md); font-size: 14px; color: #dc2626; }
.logout-btn:hover { background-color: #fee2e2; }
.settings-content { flex: 1; min-width: 0; }
.settings-section { padding: 24px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
.settings-section h2 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
.section-desc { font-size: 14px; color: var(--text-secondary); margin-bottom: 24px; }
.setting-item { display: flex; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid var(--border-color); }
.setting-item:last-child { border-bottom: none; }
.setting-label { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
.setting-desc { font-size: 13px; color: var(--text-secondary); }
.setting-select { padding: 8px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 14px; min-width: 150px; }
.profile-form { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-size: 14px; font-weight: 500; }
.form-group input { padding: 10px 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 14px; background-color: var(--bg-tertiary); }
.toggle { position: relative; display: inline-block; width: 48px; height: 24px; cursor: pointer; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border-color); border-radius: var(--radius-full); transition: background-color 0.2s; }
.toggle-slider::before { content: ''; position: absolute; width: 20px; height: 20px; left: 2px; bottom: 2px; background-color: white; border-radius: 50%; transition: transform 0.2s; }
.toggle input:checked + .toggle-slider { background-color: var(--color-primary); }
.toggle input:checked + .toggle-slider::before { transform: translateX(24px); }
.api-keys-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.api-key-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background-color: var(--bg-tertiary); border-radius: var(--radius-md); }
.api-key-name { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
.api-key-value { font-size: 13px; font-family: var(--font-mono); color: var(--text-secondary); }
.api-key-actions { display: flex; gap: 4px; }
</style>
