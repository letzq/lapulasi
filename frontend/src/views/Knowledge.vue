<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Collection, Plus, Document, Upload, Delete, Search, FolderOpened } from '@element-plus/icons-vue'
import { getKnowledgeBases, createKnowledgeBase, deleteKnowledgeBase, getKnowledgeBaseDocuments, uploadToKnowledgeBase, type KnowledgeBase, type Document as KBDocument } from '@/api/knowledge'

const loading = ref(false)
const knowledgeBases = ref<KnowledgeBase[]>([])
const showCreateDialog = ref(false)
const searchQuery = ref('')
const newKB = ref({ name: '', description: '' })

// 文档列表
const showDocsDialog = ref(false)
const docsLoading = ref(false)
const docsList = ref<KBDocument[]>([])
const docsKBName = ref('')

// 上传文档
const showUploadDialog = ref(false)
const uploadKBId = ref('')
const uploadKBName = ref('')
const uploadFile = ref<File | null>(null)
const uploadLoading = ref(false)

onMounted(() => loadKnowledgeBases())

const loadKnowledgeBases = async () => {
  loading.value = true
  try {
    const result = await getKnowledgeBases({ page: 1, pageSize: 50 })
    knowledgeBases.value = result.items
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const filteredKBs = computed(() => {
  if (!searchQuery.value) return knowledgeBases.value
  const q = searchQuery.value.toLowerCase()
  return knowledgeBases.value.filter(kb =>
    kb.name.toLowerCase().includes(q) || kb.description?.toLowerCase().includes(q)
  )
})

const handleCreate = async () => {
  if (!newKB.value.name.trim()) { ElMessage.warning('请输入知识库名称'); return }
  try {
    await createKnowledgeBase(newKB.value)
    ElMessage.success('创建成功')
    showCreateDialog.value = false
    newKB.value = { name: '', description: '' }
    await loadKnowledgeBases()
  } catch (e) { ElMessage.error('创建失败') }
}

const handleDelete = async (kb: KnowledgeBase) => {
  try {
    await ElMessageBox.confirm(`确定删除知识库「${kb.name}」？所有文档将一并删除。`, '删除确认', {
      confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning'
    })
    await deleteKnowledgeBase(kb.id)
    ElMessage.success('已删除')
    await loadKnowledgeBases()
  } catch (e) { if (e !== 'cancel') ElMessage.error('删除失败') }
}

const formatDate = (d: string) => {
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' })
}

// 查看文档
const handleViewDocs = async (kb: KnowledgeBase) => {
  docsKBName.value = kb.name
  showDocsDialog.value = true
  docsLoading.value = true
  try {
    const result = await getKnowledgeBaseDocuments(kb.id)
    docsList.value = Array.isArray(result) ? result : (result as any).data || []
  } catch (e) { console.error(e); docsList.value = [] }
  finally { docsLoading.value = false }
}

// 打开上传
const handleUpload = (kb: KnowledgeBase) => {
  uploadKBId.value = kb.id
  uploadKBName.value = kb.name
  uploadFile.value = null
  showUploadDialog.value = true
}

// 提交上传
const handleUploadSubmit = async () => {
  if (!uploadFile.value) { ElMessage.warning('请选择文件'); return }
  uploadLoading.value = true
  try {
    const result = await uploadToKnowledgeBase(uploadKBId.value, uploadFile.value)
    ElMessage.success(`上传成功${result.chunkCount ? `，已切分为 ${result.chunkCount} 个片段` : ''}`)
    showUploadDialog.value = false
    await loadKnowledgeBases()
  } catch (e) { ElMessage.error('上传失败') }
  finally { uploadLoading.value = false }
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const statusConfig: Record<string, { label: string; dot: string }> = {
  active: { label: '正常', dot: '#34c759' },
  indexing: { label: '索引中', dot: '#ff9500' },
  error: { label: '异常', dot: '#f53f3f' }
}
</script>

<template>
  <div class="page" v-loading="loading">
    <!-- 标题行 -->
    <div class="page-top">
      <div>
        <h1 class="page-title">知识库</h1>
        <p class="page-desc">管理和组织您的知识文档</p>
      </div>
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>创建知识库
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="toolbar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索知识库名称或描述..."
        class="toolbar-search"
        clearable
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <span class="toolbar-count" v-if="filteredKBs.length > 0">{{ filteredKBs.length }} 个知识库</span>
    </div>

    <!-- 知识库网格 -->
    <div class="kb-grid" v-if="filteredKBs.length > 0">
      <div
        v-for="kb in filteredKBs"
        :key="kb.id"
        class="kb-card"
      >
        <!-- 卡片头部 -->
        <div class="kb-card-top">
          <div class="kb-icon">
            <el-icon :size="20"><Collection /></el-icon>
          </div>
          <div class="kb-status">
            <span class="status-dot" :style="{ backgroundColor: statusConfig[kb.status]?.dot }"></span>
            <span class="status-text">{{ statusConfig[kb.status]?.label }}</span>
          </div>
        </div>

        <!-- 卡片内容 -->
        <h3 class="kb-name">{{ kb.name }}</h3>
        <p class="kb-desc">{{ kb.description || '暂无描述' }}</p>

        <!-- 统计 -->
        <div class="kb-stats">
          <div class="kb-stat">
            <el-icon :size="14"><Document /></el-icon>
            <span class="kb-stat-value">{{ kb.documentCount }}</span>
            <span class="kb-stat-label">文档</span>
          </div>
          <div class="kb-stat">
            <span class="kb-stat-label">更新于 {{ formatDate(kb.updatedAt) }}</span>
          </div>
        </div>

        <!-- 操作 -->
        <div class="kb-card-actions">
          <button class="card-action-btn" @click="handleViewDocs(kb)">
            <el-icon :size="14"><Document /></el-icon>查看文档
          </button>
          <button class="card-action-btn" @click="handleUpload(kb)">
            <el-icon :size="14"><Upload /></el-icon>上传
          </button>
          <button class="card-action-btn card-action-danger" @click.stop="handleDelete(kb)">
            <el-icon :size="14"><Delete /></el-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-if="filteredKBs.length === 0 && !loading">
      <el-icon :size="48" class="empty-icon"><FolderOpened /></el-icon>
      <p class="empty-title">{{ searchQuery ? '未找到匹配的知识库' : '暂无知识库' }}</p>
      <p class="empty-desc">{{ searchQuery ? '尝试其他关键词' : '创建知识库来组织和管理您的文档' }}</p>
      <el-button v-if="!searchQuery" type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>创建知识库
      </el-button>
    </div>

    <!-- 创建对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建知识库" width="440px">
      <el-form :model="newKB" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="newKB.name" placeholder="知识库名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newKB.description" type="textarea" :rows="3" placeholder="可选描述" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>

    <!-- 文档列表对话框 -->
    <el-dialog v-model="showDocsDialog" :title="`${docsKBName} — 文档列表`" width="560px">
      <div v-loading="docsLoading">
        <div class="docs-list" v-if="docsList.length > 0">
          <div v-for="doc in docsList" :key="doc.id" class="doc-item">
            <div class="doc-icon">
              <el-icon :size="16"><Document /></el-icon>
            </div>
            <div class="doc-info">
              <span class="doc-name">{{ doc.name }}</span>
              <span class="doc-meta">{{ doc.chunkCount }} 个片段 · {{ formatFileSize(doc.fileSize) }} · {{ formatDate(doc.createdAt) }}</span>
            </div>
            <span class="doc-status" :class="doc.status">{{ doc.status === 'active' ? '正常' : doc.status === 'processing' ? '处理中' : '异常' }}</span>
          </div>
        </div>
        <div class="docs-empty" v-else-if="!docsLoading">
          <el-icon :size="32"><Document /></el-icon>
          <p>暂无文档</p>
        </div>
      </div>
    </el-dialog>

    <!-- 上传文档对话框 -->
    <el-dialog v-model="showUploadDialog" :title="`上传文档到 ${uploadKBName}`" width="440px">
      <el-upload
        drag
        :auto-upload="false"
        :on-change="(f: any) => uploadFile = f.raw"
        :limit="1"
        style="width: 100%"
      >
        <el-icon :size="32" style="color: #c9cdd4; margin-bottom: 8px"><Upload /></el-icon>
        <div style="font-size: 14px; color: #646a73">拖拽文件到此处，或<em style="color: #3370ff; font-style: normal">点击选择</em></div>
        <template #tip>
          <div style="font-size: 12px; color: #c9cdd4; margin-top: 4px">支持 PDF、Word、Excel、TXT 格式，最大 50MB</div>
        </template>
      </el-upload>
      <div v-if="uploadFile" class="upload-file-info">
        <el-icon><Document /></el-icon>
        <span>{{ uploadFile.name }}</span>
      </div>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" :loading="uploadLoading" @click="handleUploadSubmit">确定上传</el-button>
      </template>
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
  margin-bottom: 20px;
}

.toolbar-search {
  width: 320px;
}

:deep(.toolbar-search .el-input__wrapper) {
  background: #ffffff;
  border-radius: 8px;
}

.toolbar-count {
  font-size: 13px;
  color: #8f959e;
}

/* 网格 */
.kb-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.kb-card {
  background: #ffffff;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.15s ease;
  cursor: default;
}

.kb-card:hover {
  border-color: #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.kb-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.kb-icon {
  width: 40px;
  height: 40px;
  background: #f0f5ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3370ff;
}

.kb-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #8f959e;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.kb-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
  margin: 0 0 8px;
  line-height: 1.3;
}

.kb-desc {
  font-size: 13px;
  color: #646a73;
  line-height: 1.6;
  margin: 0 0 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.kb-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-top: 1px solid #f5f6f7;
  margin-bottom: 12px;
}

.kb-stat {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #8f959e;
}

.kb-stat-value {
  font-weight: 600;
  color: #1f2329;
}

.kb-stat-label {
  color: #8f959e;
}

.kb-card-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  font-size: 12px;
  color: #646a73;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.12s;
}

.card-action-btn:hover {
  background: #f0f5ff;
  color: #3370ff;
}

.card-action-danger:hover {
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

/* 文档列表 */
.docs-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  transition: background 0.12s;
}

.doc-item:hover {
  background: #f7f8fa;
}

.doc-icon {
  width: 32px;
  height: 32px;
  background: #f0f5ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3370ff;
  flex-shrink: 0;
}

.doc-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.doc-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2329;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-meta {
  font-size: 12px;
  color: #8f959e;
  margin-top: 2px;
}

.doc-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
}

.doc-status.active { background: #e6f9ec; color: #34c759; }
.doc-status.processing { background: #fff4e6; color: #ff9500; }
.doc-status.error { background: #fff0f0; color: #f53f3f; }

.docs-empty {
  text-align: center;
  padding: 40px;
  color: #c9cdd4;
}

.docs-empty p {
  margin: 8px 0 0;
  font-size: 14px;
  color: #8f959e;
}

.upload-file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #f7f8fa;
  border-radius: 8px;
  font-size: 13px;
  color: #1f2329;
}
</style>
