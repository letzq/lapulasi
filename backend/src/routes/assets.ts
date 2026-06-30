import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import type { Asset } from '../types/index.js'

const router = Router()

// Mock 资产数据
const mockAssets: Asset[] = [
  {
    id: 'asset-001',
    name: 'Corporate Security Policy',
    type: 'document',
    status: 'active',
    description: 'Enterprise security policy document v2.3',
    size: 2048576,
    userId: 'user-001',
    createdAt: new Date('2024-06-01T10:00:00Z'),
    updatedAt: new Date('2024-06-15T14:30:00Z')
  },
  {
    id: 'asset-002',
    name: 'Q3 Compliance Guidelines',
    type: 'document',
    status: 'active',
    description: 'Quarterly compliance requirements and guidelines',
    size: 1536000,
    userId: 'user-001',
    createdAt: new Date('2024-06-10T09:00:00Z'),
    updatedAt: new Date('2024-06-20T11:45:00Z')
  },
  {
    id: 'asset-003',
    name: 'Customer Database',
    type: 'dataset',
    status: 'active',
    description: 'Production customer data snapshot',
    size: 104857600,
    userId: 'user-001',
    createdAt: new Date('2024-05-15T08:00:00Z'),
    updatedAt: new Date('2024-06-28T16:00:00Z')
  },
  {
    id: 'asset-004',
    name: 'GPT-4 Enterprise',
    type: 'model',
    status: 'active',
    description: 'Enterprise-grade GPT-4 model deployment',
    userId: 'user-001',
    createdAt: new Date('2024-04-01T12:00:00Z'),
    updatedAt: new Date('2024-06-25T10:00:00Z')
  },
  {
    id: 'asset-005',
    name: 'Knowledge Agent',
    type: 'agent',
    status: 'active',
    description: 'RAG-based knowledge retrieval agent',
    userId: 'user-001',
    createdAt: new Date('2024-06-01T10:00:00Z'),
    updatedAt: new Date('2024-06-29T09:00:00Z')
  }
]

// GET /api/assets
router.get('/', (req, res) => {
  const { page = 1, pageSize = 10, type, status, search } = req.query
  const pageNum = Number(page)
  const size = Number(pageSize)

  let filtered = [...mockAssets]

  if (type) {
    filtered = filtered.filter(a => a.type === type)
  }
  if (status) {
    filtered = filtered.filter(a => a.status === status)
  }
  if (search) {
    const searchStr = String(search).toLowerCase()
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(searchStr) ||
      a.description?.toLowerCase().includes(searchStr)
    )
  }

  const start = (pageNum - 1) * size
  const end = start + size
  const items = filtered.slice(start, end)
  const total = filtered.length

  res.json({
    items,
    pagination: {
      page: pageNum,
      pageSize: size,
      total,
      totalPages: Math.ceil(total / size)
    }
  })
})

// GET /api/assets/:id
router.get('/:id', (req, res) => {
  const asset = mockAssets.find(a => a.id === req.params.id)
  if (!asset) {
    res.status(404).json({ success: false, error: 'Asset not found' })
    return
  }
  res.json({ success: true, data: asset })
})

// POST /api/assets
router.post('/', (req, res) => {
  const { name, type, description } = req.body

  const newAsset: Asset = {
    id: `asset-${uuidv4().slice(0, 8)}`,
    name,
    type,
    description,
    status: 'active',
    userId: 'user-001',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  mockAssets.unshift(newAsset)

  res.status(201).json({ success: true, data: newAsset })
})

// PATCH /api/assets/:id
router.patch('/:id', (req, res) => {
  const asset = mockAssets.find(a => a.id === req.params.id)
  if (!asset) {
    res.status(404).json({ success: false, error: 'Asset not found' })
    return
  }

  const { name, description, status } = req.body
  if (name) asset.name = name
  if (description) asset.description = description
  if (status) asset.status = status
  asset.updatedAt = new Date()

  res.json({ success: true, data: asset })
})

// DELETE /api/assets/:id
router.delete('/:id', (req, res) => {
  const index = mockAssets.findIndex(a => a.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ success: false, error: 'Asset not found' })
    return
  }

  mockAssets.splice(index, 1)

  res.json({ success: true, data: null })
})

export default router
