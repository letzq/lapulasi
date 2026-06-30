<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { mockApi } from '@/mock/api'
import type { Asset } from '@/types'

const assets = ref<Asset[]>([])
const loading = ref(false)
const searchQuery = ref('')
const filterType = ref('')

onMounted(async () => { loading.value = true; try { const r = await mockApi.assets.getAll(); assets.value = r.items } finally { loading.value = false } })

const filtered = () => assets.value.filter(a => {
  const matchSearch = !searchQuery.value || a.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || a.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  const matchType = !filterType.value || a.type === filterType.value
  return matchSearch && matchType
})

const formatSize = (b?: number) => { if (!b) return '-'; if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'; return (b / 1048576).toFixed(1) + ' MB' }
const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const getTypeIcon = (t: Asset['type']) => ({ document: '📄', dataset: '📊', model: '🤖', agent: '🔄' })[t]
const getStatusClass = (s: Asset['status']) => ({ active: 'badge-success', inactive: '', processing: 'badge-warning' })[s]
</script>

<template>
  <div class="assets-page">
    <div class="page-header"><div><h1>Assets</h1><p>Manage your documents, datasets, models, and agents</p></div><button class="btn btn-primary">+ Upload Asset</button></div>
    <div class="filters-bar">
      <div class="search-box"><span>🔍</span><input v-model="searchQuery" type="text" placeholder="Search assets..." /></div>
      <select v-model="filterType" class="filter-select"><option value="">All Types</option><option value="document">Documents</option><option value="dataset">Datasets</option><option value="model">Models</option><option value="agent">Agents</option></select>
    </div>
    <div class="assets-grid">
      <div v-for="asset in filtered()" :key="asset.id" class="asset-card">
        <div class="asset-icon">{{ getTypeIcon(asset.type) }}</div>
        <div class="asset-content">
          <div class="asset-header"><h3>{{ asset.name }}</h3><span :class="['badge', getStatusClass(asset.status)]">{{ asset.status }}</span></div>
          <p class="asset-desc">{{ asset.description || 'No description' }}</p>
          <div class="asset-meta"><span>{{ asset.type }}</span><span>{{ formatSize(asset.size) }}</span><span>{{ formatDate(asset.updatedAt) }}</span></div>
        </div>
        <div class="asset-actions"><button class="btn-icon">👁️</button><button class="btn-icon">✏️</button><button class="btn-icon">🗑️</button></div>
      </div>
      <div v-if="filtered().length === 0 && !loading" class="empty-state"><div class="empty-icon">📁</div><h3>No assets found</h3><p>Upload your first asset</p></div>
    </div>
  </div>
</template>

<style scoped>
.assets-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
.page-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.page-header p { font-size: 16px; color: var(--text-secondary); }
.filters-bar { display: flex; gap: 16px; margin-bottom: 24px; }
.search-box { flex: 1; display: flex; align-items: center; gap: 8px; padding: 10px 16px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
.search-box input { flex: 1; background: transparent; border: none; outline: none; font-size: 14px; }
.filter-select { padding: 10px 16px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 14px; min-width: 150px; }
.assets-grid { display: flex; flex-direction: column; gap: 12px; }
.asset-card { display: flex; align-items: center; gap: 16px; padding: 16px 20px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
.asset-card:hover { border-color: var(--color-primary); }
.asset-icon { width: 48px; height: 48px; background-color: var(--bg-tertiary); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 24px; }
.asset-content { flex: 1; min-width: 0; }
.asset-header { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
.asset-header h3 { font-size: 16px; font-weight: 600; margin: 0; }
.asset-desc { font-size: 13px; color: var(--text-secondary); margin: 0 0 8px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.asset-meta { display: flex; gap: 16px; font-size: 12px; color: var(--text-tertiary); }
.asset-actions { display: flex; gap: 4px; }
.empty-state { display: flex; flex-direction: column; align-items: center; padding: 60px 20px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
.empty-icon { font-size: 48px; margin-bottom: 16px; }
.empty-state h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
.empty-state p { font-size: 14px; color: var(--text-secondary); }
</style>
