<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { mockApi } from '@/mock/api'
import type { KnowledgeBase } from '@/types'

const knowledgeBases = ref<KnowledgeBase[]>([])
const loading = ref(false)

onMounted(async () => { loading.value = true; try { const r = await mockApi.knowledgeBases.getAll(); knowledgeBases.value = r.items } finally { loading.value = false } })

const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const getStatusClass = (s: KnowledgeBase['status']) => ({ active: 'badge-success', indexing: 'badge-warning', error: 'badge-error' })[s]
</script>

<template>
  <div class="knowledge-page">
    <div class="page-header"><div><h1>Knowledge Bases</h1><p>Manage your knowledge repositories</p></div><button class="btn btn-primary">+ Create Knowledge Base</button></div>
    <div class="kb-grid">
      <div v-for="kb in knowledgeBases" :key="kb.id" class="kb-card">
        <div class="kb-header"><div class="kb-icon">📚</div><div class="kb-info"><h3>{{ kb.name }}</h3><span :class="['badge', getStatusClass(kb.status)]">{{ kb.status }}</span></div></div>
        <p class="kb-desc">{{ kb.description }}</p>
        <div class="kb-stats"><div class="stat"><div class="stat-value">{{ kb.documentCount }}</div><div class="stat-label">Documents</div></div><div class="stat"><div class="stat-value">{{ formatDate(kb.lastUpdated) }}</div><div class="stat-label">Last Updated</div></div></div>
        <div class="kb-actions"><button class="btn btn-secondary">View Documents</button><button class="btn btn-secondary">Upload</button><button class="btn-icon">⚙️</button></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.knowledge-page { max-width: 1200px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
.page-header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
.page-header p { font-size: 16px; color: var(--text-secondary); }
.kb-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
.kb-card { padding: 24px; background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
.kb-card:hover { border-color: var(--color-primary); box-shadow: var(--shadow-md); }
.kb-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
.kb-icon { width: 48px; height: 48px; background-color: var(--bg-tertiary); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 24px; }
.kb-info { flex: 1; display: flex; align-items: center; justify-content: space-between; }
.kb-info h3 { font-size: 18px; font-weight: 600; margin: 0; }
.kb-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin-bottom: 20px; }
.kb-stats { display: flex; gap: 32px; padding: 16px 0; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); margin-bottom: 16px; }
.kb-stats .stat-value { font-size: 16px; font-weight: 600; }
.kb-stats .stat-label { font-size: 12px; color: var(--text-secondary); }
.kb-actions { display: flex; gap: 8px; }
.kb-actions .btn { flex: 1; }
</style>
