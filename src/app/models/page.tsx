'use client'

import { useState, useEffect } from 'react'
import Modal from '@/components/Modal'
import { toast } from '@/components/ui/use-toast'

interface ModelConfig {
  id: string
  name: string
  type: string
  apiKey: string
  baseUrl?: string
  createdAt: string
  isActive: boolean
}

const MODEL_TYPES = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'openrouter', label: 'OpenRouter' },
]

const initialFormData = {
  name: '',
  type: 'openai',
  apiKey: '',
  baseUrl: '',
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelConfig[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      const data = await response.json()
      setModels(data)
    } catch (error) {
      console.error('Failed to fetch models:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.apiKey.trim()) return

    setIsLoading(true)
    try {
      const url = editingId ? `/api/models/${editingId}` : '/api/models'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      
      if (editingId) {
        setModels(models.map(model => model.id === editingId ? data : model))
      } else {
        setModels([data, ...models])
      }
      
      setFormData(initialFormData)
      setIsModalOpen(false)
      setEditingId(null)
      toast({
        title: '成功',
        description: '模型已创建',
        variant: 'default',
        className: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800',
      })
    } catch (error) {
      console.error('Failed to save model:', error)
      toast({
        title: '错误',
        description: error instanceof Error ? error.message : '创建模型失败',
        variant: 'default',
        className: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (model: ModelConfig) => {
    setFormData({
      name: model.name,
      type: model.type,
      apiKey: model.apiKey,
      baseUrl: model.baseUrl || '',
    })
    setEditingId(model.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (modelId: string) => {
    setDeletingId(modelId)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingId) return

    try {
      const response = await fetch(`/api/models/${deletingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '删除模型失败')
      }

      toast({
        title: '成功',
        description: '模型已删除',
        variant: 'default',
        className: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800',
      })
      
      setModels(models.filter(model => model.id !== deletingId))
    } catch (error) {
      console.error('Failed to delete model:', error)
      toast({
        title: '错误',
        description: error instanceof Error ? error.message : '删除模型失败',
        variant: 'default',
        className: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800',
      })
    } finally {
      setIsDeleteModalOpen(false)
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-theme">模型配置</h1>
        <button
              onClick={() => {
                setFormData(initialFormData)
                setEditingId(null)
                setIsModalOpen(true)
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:hover:bg-blue-500 transition-theme"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              添加模型
            </button>
      </div>

      <div className="space-y-4">
        {models.length === 0 ? (
          <div className="text-center py-12 px-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-theme">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">还没有配置任何模型</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">点击上方的&ldquo;添加模型&rdquo;按钮开始配置您的第一个 AI 模型</p>
          </div>
        ) : (
          models.map((model) => (
            <div
              key={model.id}
              className="p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-theme"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-theme">{model.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-sm rounded transition-theme ${
                    model.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
                  }`}>
                    {model.isActive ? '活跃' : '已禁用'}
                  </span>
                  <button
                    onClick={() => handleEdit(model)}
                    className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-theme"
                    aria-label="编辑"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(model.id)}
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-theme"
                    aria-label="删除"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 transition-theme mb-2">
                类型: {MODEL_TYPES.find(t => t.value === model.type)?.label}
              </div>
              {model.baseUrl && (
                <div className="text-sm text-gray-600 dark:text-gray-400 transition-theme mb-2">
                  URL: {model.baseUrl}
                </div>
              )}
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-theme">
                创建时间: {new Date(model.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setFormData(initialFormData)
          setEditingId(null)
          setShowApiKey(false)
        }}
        title={editingId ? "编辑模型配置" : "添加模型配置"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 transition-theme">提供商名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如：openai"
              className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-theme"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 transition-theme">模型类型</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-theme"
              disabled={isLoading}
            >
              {MODEL_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 transition-theme">API 密钥</label>
            <div className="relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="输入 API 密钥"
                className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-theme pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-theme"
                aria-label={showApiKey ? "隐藏 API 密钥" : "显示 API 密钥"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showApiKey ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 transition-theme">
              URL（可选）
            </label>
            <input
              type="text"
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              placeholder="例如：https://api.openai.com/v1"
              className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-theme"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                setFormData(initialFormData)
                setEditingId(null)
                setShowApiKey(false)
              }}
              className="px-4 py-2 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-theme"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 dark:hover:bg-blue-400 transition-theme"
              disabled={isLoading || !formData.name.trim() || !formData.apiKey.trim()}
            >
              {editingId ? '确认修改' : '确认添加'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setDeletingId(null)
        }}
        title="删除模型"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">确定要删除这个模型吗？此操作不可恢复。</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setIsDeleteModalOpen(false)
                setDeletingId(null)
              }}
              className="px-4 py-2 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-theme"
            >
              取消
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 dark:hover:bg-red-400 transition-theme"
            >
              确认删除
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
} 