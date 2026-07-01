<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Search, View, Edit, Delete, Document,
  DataLine, Cpu, Monitor, FolderOpened, Upload
} from '@element-plus/icons-vue'
import { getAssets, createAsset, updateAsset, deleteAsset, type Asset } from '@/api/assets'
import { getKnowledgeBases, type KnowledgeBase } from '@/api/knowledge'

const loading = ref(false)
const assets = ref<Asset[]>([])
const searchQuery = ref('')
const filterType = ref('')
const showUploadDialog = ref(false)
const uploadForm = ref({ name: '', type: 'document' as string, description: '', knowledge_base_id: '' })
const selectedFile = ref<File | null>(null)
const knowledgeBases = ref<KnowledgeBase[]>([])

// 编辑对话框
const showEditDialog = ref(false)
const editForm = ref({ id: '', name: '', description: '', status: '' })
const editLoading = ref(false)

// 查看详情对话框
const showDetailDialog = ref(false)
const detailAsset = ref<Asset | null>(null)

// 上传进度
const showProgressDialog = ref(false)
const uploadProgress = ref(0)
const uploadStep = ref('')
const uploadDetail = ref('')

onMounted(async () => {
  await Promise.all([loadAssets(), loadKnowledgeBases()])
})

watch([filterType], () => loadAssets())

const loadKnowledgeBases = async () => {
  try {
    const result = await getKnowledgeBases({ page: 1, pageSize: 100 })
    knowledgeBases.value = result.items || []
  } catch (e) { console.error(e) }
}

const loadAssets = async () => {
  loading.value = true
  try {
    const result = await getAssets({
      page: 1, pageSize: 100,
      type: filterType.value || undefined,
      search: searchQuery.value || undefined
    })
    assets.value = result.items || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleSearch = () => loadAssets()

// 查看详情
const handleView = (asset: Asset) => {
  detailAsset.value = asset
  showDetailDialog.value = true
}

// 打开编辑
const handleEdit = (asset: Asset) => {
  editForm.value = { id: asset.id, name: asset.name, description: asset.description || '', status: asset.status }
  showEditDialog.value = true
}

// 提交编辑
const handleEditSubmit = async () => {
  if (!editForm.value.name) { ElMessage.warning('请输入名称'); return }
  editLoading.value = true
  try {
    await updateAsset(editForm.value.id, {
      name: editForm.value.name,
      description: editForm.value.description,
      status: editForm.value.status as Asset['status']
    })
    ElMessage.success('更新成功')
    showEditDialog.value = false
    await loadAssets()
  } catch (e) { ElMessage.error('更新失败') }
  finally { editLoading.value = false }
}

const filteredAssets = computed(() => {
  if (!searchQuery.value) return assets.value
  const q = searchQuery.value.toLowerCase()
  return assets.value.filter(a =>
    a.name.toLowerCase().includes(q) || a.description?.toLowerCase().includes(q)
  )
})

const formatSize = (bytes?: number) => {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const formatDate = (d: string) => {
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

const typeConfig: Record<string, { icon: any; label: string; color: string; bg: string }> = {
  document: { icon: Document, label: '文档', color: '#3370ff', bg: '#f0f5ff' },
  dataset: { icon: DataLine, label: '数据集', color: '#34c759', bg: '#e6f9ec' },
  model: { icon: Cpu, label: '模型', color: '#ff9500', bg: '#fff4e6' },
  agent: { icon: Monitor, label: 'Agent', color: '#f53f3f', bg: '#fff0f0' }
}

const statusConfig: Record<string, { label: string; dot: string }> = {
  active: { label: '正常', dot: '#34c759' },
  inactive: { label: '停用', dot: '#86909c' },
  processing: { label: '处理中', dot: '#ff9500' },
  error: { label: '异常', dot: '#f53f3f' }
}

const handleDelete = async (asset: Asset) => {
  try {
    await ElMessageBox.confirm(`确定删除「${asset.name}」？`, '删除确认', {
      confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning'
    })
    await deleteAsset(asset.id)
    ElMessage.success('已删除')
    await loadAssets()
  } catch (e) { if (e !== 'cancel') ElMessage.error('删除失败') }
}

const handleUpload = () => {
  uploadForm.value = { name: '', type: 'document', description: '', knowledge_base_id: '' }
  selectedFile.value = null
  showUploadDialog.value = true
}

const handleFileChange = (file: any) => {
  selectedFile.value = file.raw
  if (!uploadForm.value.name) uploadForm.value.name = file.name
}

const handleSubmitUpload = async () => {
  if (!uploadForm.value.name) { ElMessage.warning('请输入资产名称'); return }
  if (!selectedFile.value) { ElMessage.warning('请选择文件'); return }

  // 关闭上传对话框，打开进度对话框
  showUploadDialog.value = false
  showProgressDialog.value = true
  uploadProgress.value = 0
  uploadStep.value = 'uploading'
  uploadDetail.value = '上传文件中...'

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('name', uploadForm.value.name)
    formData.append('type', uploadForm.value.type)
    if (uploadForm.value.description) formData.append('description', uploadForm.value.description)
    if (uploadForm.value.knowledge_base_id) formData.append('knowledge_base_id', uploadForm.value.knowledge_base_id)

    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'
    const authStore = await import('@/stores/auth').then(m => m.useAuthStore())

    const response = await fetch(`${baseURL}/assets/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authStore.token}` },
      body: formData
    })

    if (!response.ok) {
      throw new Error(`上传失败: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('无法读取响应')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            if (data.step === 'complete') {
              uploadProgress.value = 100
              uploadStep.value = 'done'
              uploadDetail.value = `处理完成: ${data.chunkCount} 个片段`
              ElMessage.success(`上传成功，${data.chunkCount} 个片段`)
              await loadAssets()
              return
            } else if (data.step === 'error') {
              throw new Error(data.detail || '处理失败')
            } else {
              uploadProgress.value = data.progress || 0
              uploadStep.value = data.step || ''
              uploadDetail.value = data.detail || ''
            }
          } catch (e: any) {
            if (e.message && !e.message.includes('JSON')) throw e
          }
        }
      }
    }
  } catch (e: any) {
    ElMessage.error(e.message || '上传失败')
  } finally {
    setTimeout(() => { showProgressDialog.value = false }, 1500)
  }
}

const filterOptions = [
  { value: '', label: '全部类型' },
  { value: 'document', label: '文档' },
  { value: 'dataset', label: '数据集' },
  { value: 'model', label: '模型' },
  { value: 'agent', label: 'Agent' }
]
</script>

<template>
  <div class="page" v-loading="loading">
    <!-- 标题行 -->
    <div class="page-top">
      <div>
        <h1 class="page-title">资产管理</h1>
        <p class="page-desc">管理文档、数据集、模型和 Agent</p>
      </div>
      <el-button type="primary" @click="handleUpload">
        <el-icon><Upload /></el-icon>上传资产
      </el-button>
    </div>

    <!-- 搜索 + 筛选工具栏 -->
    <div class="toolbar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索资产名称或描述..."
        class="toolbar-search"
        clearable
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <div class="toolbar-filters">
        <el-segmented v-model="filterType" :options="filterOptions" />
      </div>
    </div>

    <!-- 列表 -->
    <div class="list-container" v-if="filteredAssets.length > 0">
      <div class="list-header">
        <span class="col-name">名称</span>
        <span class="col-type">类型</span>
        <span class="col-size">大小</span>
        <span class="col-status">状态</span>
        <span class="col-date">更新时间</span>
        <span class="col-actions">操作</span>
      </div>
      <div
        v-for="asset in filteredAssets"
        :key="asset.id"
        class="list-row"
      >
        <div class="col-name">
          <div class="asset-icon-sm" :style="{ backgroundColor: typeConfig[asset.type]?.bg, color: typeConfig[asset.type]?.color }">
            <el-icon :size="16"><component :is="typeConfig[asset.type]?.icon || FolderOpened" /></el-icon>
          </div>
          <div class="asset-name-cell">
            <span class="asset-name-text">{{ asset.name }}</span>
            <span class="asset-desc-text" v-if="asset.description">{{ asset.description }}</span>
          </div>
        </div>
        <div class="col-type">
          <span class="type-badge" :style="{ color: typeConfig[asset.type]?.color, backgroundColor: typeConfig[asset.type]?.bg }">
            {{ typeConfig[asset.type]?.label || asset.type }}
          </span>
        </div>
        <div class="col-size">{{ formatSize(asset.fileSize) }}</div>
        <div class="col-status">
          <span class="status-dot" :style="{ backgroundColor: statusConfig[asset.status]?.dot }"></span>
          {{ statusConfig[asset.status]?.label || asset.status }}
        </div>
        <div class="col-date">{{ formatDate(asset.updatedAt) }}</div>
        <div class="col-actions">
          <button class="action-btn" title="查看" @click="handleView(asset)"><el-icon :size="15"><View /></el-icon></button>
          <button class="action-btn" title="编辑" @click="handleEdit(asset)"><el-icon :size="15"><Edit /></el-icon></button>
          <button class="action-btn action-btn-danger" title="删除" @click="handleDelete(asset)"><el-icon :size="15"><Delete /></el-icon></button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="filteredAssets.length === 0 && !loading">
      <el-icon :size="48" class="empty-icon"><FolderOpened /></el-icon>
      <p class="empty-title">暂无资产</p>
      <p class="empty-desc">上传文档、数据集或其他资源开始管理</p>
      <el-button type="primary" @click="handleUpload">
        <el-icon><Upload /></el-icon>上传资产
      </el-button>
    </div>

    <!-- 上传对话框 -->
    <el-dialog v-model="showUploadDialog" title="上传资产" width="480px">
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="uploadForm.name" placeholder="资产名称" />
        </el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="uploadForm.type" style="width: 100%">
            <el-option label="文档" value="document" />
            <el-option label="数据集" value="dataset" />
            <el-option label="模型" value="model" />
            <el-option label="Agent" value="agent" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="uploadForm.type === 'document'" label="知识库">
          <el-select v-model="uploadForm.knowledge_base_id" placeholder="选择知识库（可选）" clearable style="width: 100%">
            <el-option v-for="kb in knowledgeBases" :key="kb.id" :label="kb.name" :value="kb.id" />
          </el-select>
          <div class="form-hint">选择后文档将自动切片并添加到知识库</div>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="uploadForm.description" type="textarea" :rows="2" placeholder="可选描述" />
        </el-form-item>
        <el-form-item label="文件">
          <el-upload drag :auto-upload="false" :on-change="handleFileChange" :limit="1" style="width: 100%">
            <el-icon :size="32" style="color: #c9cdd4; margin-bottom: 8px"><Upload /></el-icon>
            <div style="font-size: 14px; color: #646a73">拖拽文件到此处，或<em style="color: #3370ff; font-style: normal">点击选择</em></div>
            <template #tip>
              <div style="font-size: 12px; color: #c9cdd4; margin-top: 4px">支持 PDF、Word、Excel、TXT 格式</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmitUpload">确定上传</el-button>
      </template>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog v-model="showEditDialog" title="编辑资产" width="440px">
      <el-form :model="editForm" label-width="70px">
        <el-form-item label="名称" required>
          <el-input v-model="editForm.name" placeholder="资产名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" :rows="2" placeholder="可选描述" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="editForm.status" style="width: 100%">
            <el-option label="正常" value="active" />
            <el-option label="停用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleEditSubmit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="资产详情" width="480px">
      <div class="detail-content" v-if="detailAsset">
        <div class="detail-header">
          <div class="detail-icon" :style="{ backgroundColor: typeConfig[detailAsset.type]?.bg, color: typeConfig[detailAsset.type]?.color }">
            <el-icon :size="24"><component :is="typeConfig[detailAsset.type]?.icon || FolderOpened" /></el-icon>
          </div>
          <div>
            <h3 class="detail-name">{{ detailAsset.name }}</h3>
            <span class="type-badge" :style="{ color: typeConfig[detailAsset.type]?.color, backgroundColor: typeConfig[detailAsset.type]?.bg }">
              {{ typeConfig[detailAsset.type]?.label }}
            </span>
          </div>
        </div>
        <div class="detail-fields">
          <div class="detail-row" v-if="detailAsset.description">
            <span class="detail-label">描述</span>
            <span class="detail-value">{{ detailAsset.description }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">状态</span>
            <span class="detail-value">
              <span class="status-dot" :style="{ backgroundColor: statusConfig[detailAsset.status]?.dot }"></span>
              {{ statusConfig[detailAsset.status]?.label }}
            </span>
          </div>
          <div class="detail-row" v-if="detailAsset.fileSize">
            <span class="detail-label">文件大小</span>
            <span class="detail-value">{{ formatSize(detailAsset.fileSize) }}</span>
          </div>
          <div class="detail-row" v-if="detailAsset.mimeType">
            <span class="detail-label">文件类型</span>
            <span class="detail-value">{{ detailAsset.mimeType }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">创建时间</span>
            <span class="detail-value">{{ formatDate(detailAsset.createdAt) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">更新时间</span>
            <span class="detail-value">{{ formatDate(detailAsset.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 上传进度对话框 -->
    <el-dialog v-model="showProgressDialog" title="处理中" width="400px" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="uploadStep === 'done' || uploadStep === 'error'">
      <div class="progress-content">
        <el-progress :percentage="uploadProgress" :stroke-width="8" :status="uploadStep === 'error' ? 'exception' : uploadStep === 'done' ? 'success' : undefined" />
        <div class="progress-info">
          <div class="progress-steps">
            <span :class="{ active: uploadStep === 'uploading' || uploadStep === 'saving' }">上传</span>
            <span :class="{ active: uploadStep === 'parsing' }">解析</span>
            <span :class="{ active: uploadStep === 'chunking' }">切片</span>
            <span :class="{ active: uploadStep === 'vectorizing' }">向量化</span>
            <span :class="{ active: uploadStep === 'done' }">完成</span>
          </div>
          <p class="progress-detail">{{ uploadDetail }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped>
.page { max-width: 1200px; }

.page-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  color: #1f2329;
  margin: 0;
  line-height: 1.3;
}

.page-desc {
  font-size: 13px;
  color: #8f959e;
  margin: 4px 0 0;
}

/* 工具栏 */
.toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.toolbar-search {
  width: 320px;
}

:deep(.toolbar-search .el-input__wrapper) {
  background: #ffffff;
  border-radius: 8px;
}

.toolbar-filters {
  flex: 1;
}

:deep(.el-segmented) {
  background: #f2f3f5;
  border-radius: 8px;
  padding: 2px;
}

:deep(.el-segmented__item) {
  border-radius: 6px;
  font-size: 13px;
  height: 30px;
}

:deep(.el-segmented__item.is-selected) {
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

/* 列表 */
.list-container {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.list-header {
  display: grid;
  grid-template-columns: 1fr 100px 100px 90px 120px 100px;
  align-items: center;
  padding: 10px 20px;
  background: #f7f8fa;
  font-size: 12px;
  font-weight: 500;
  color: #8f959e;
  border-bottom: 1px solid #f0f0f0;
}

.list-row {
  display: grid;
  grid-template-columns: 1fr 100px 100px 90px 120px 100px;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #f7f8fa;
  transition: background 0.12s;
}

.list-row:last-child { border-bottom: none; }
.list-row:hover { background: #f7f8fa; }

.col-name {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.asset-icon-sm {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.asset-name-cell {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.asset-name-text {
  font-size: 14px;
  font-weight: 500;
  color: #1f2329;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-desc-text {
  font-size: 12px;
  color: #8f959e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.type-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.col-size, .col-date {
  font-size: 13px;
  color: #646a73;
}

.col-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4e5969;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.col-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: #8f959e;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s;
}

.action-btn:hover {
  background: #f0f5ff;
  color: #3370ff;
}

.action-btn-danger:hover {
  background: #fff0f0;
  color: #f53f3f;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon { color: #dcdfe6; margin-bottom: 16px; }
.empty-title { font-size: 16px; font-weight: 500; color: #1f2329; margin: 0 0 8px; }
.empty-desc { font-size: 13px; color: #8f959e; margin: 0 0 24px; }

.form-hint { font-size: 12px; color: #8f959e; margin-top: 4px; }

:deep(.el-upload) { width: 100%; }
:deep(.el-upload-dragger) { width: 100%; padding: 32px; }

/* 详情对话框 */
.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.detail-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2329;
  margin: 0 0 6px;
}

.detail-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.detail-label {
  width: 70px;
  flex-shrink: 0;
  font-size: 13px;
  color: #8f959e;
}

.detail-value {
  font-size: 13px;
  color: #1f2329;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 进度对话框 */
.progress-content {
  padding: 8px 0;
}

.progress-info {
  margin-top: 20px;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.progress-steps span {
  font-size: 12px;
  color: #c9cdd4;
  transition: color 0.2s;
}

.progress-steps span.active {
  color: #3370ff;
  font-weight: 500;
}

.progress-detail {
  font-size: 13px;
  color: #646a73;
  text-align: center;
  margin: 0;
}
</style>
