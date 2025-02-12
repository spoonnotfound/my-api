'use client'

import { useState, useEffect } from 'react'
import { toast } from '@/components/ui/use-toast'
import ReactMarkdown from 'react-markdown'

interface Model {
  id: string
  name: string
  description?: string
  context_length?: number
  pricing?: {
    prompt: string
    completion: string
  }
  reasoning?: string
}

interface ModelConfig {
  id: string
  provider: string
  apiKey: string
  baseUrl?: string
  createdAt: string
  isActive: boolean
}

export default function AvailableModelsPage() {
  const [providers, setProviders] = useState<ModelConfig[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('')
  const [models, setModels] = useState<Model[]>([])
  const [filteredModels, setFilteredModels] = useState<Model[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const itemsPerPage = 10

  useEffect(() => {
    fetchProviders()
  }, [])

  useEffect(() => {
    const filtered = models.filter(model => 
      model.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredModels(filtered)
    setCurrentPage(1)
  }, [searchQuery, models])

  const totalPages = Math.ceil(filteredModels.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentModels = filteredModels.slice(startIndex, endIndex)

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/models')
      const data = await response.json()
      setProviders(data)
      if (data.length > 0) {
        setSelectedProvider(data[0].provider)
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error)
      toast({
        title: '错误',
        description: '获取提供商列表失败',
        variant: 'default',
        className: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800',
      })
    }
  }

  const fetchModels = async (provider: string) => {
    setIsLoading(true)
    try {
      const selectedConfig = providers.find(p => p.provider === provider)
      if (!selectedConfig) {
        throw new Error('提供商配置不存在')
      }

      const baseUrl = selectedConfig.baseUrl || 'https://api.openai.com/v1'
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${selectedConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        ...(provider === 'openrouter' && {
          body: JSON.stringify({
            include_reasoning: true
          }),
          method: 'POST'
        })
      })

      if (!response.ok) {
        throw new Error('获取模型列表失败')
      }

      const data = await response.json()
      setModels(data.data || data.models || [])
    } catch (error) {
      console.error('Failed to fetch models:', error)
      toast({
        title: '错误',
        description: error instanceof Error ? error.message : '获取模型列表失败',
        variant: 'default',
        className: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800',
      })
      setModels([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedProvider) {
      fetchModels(selectedProvider)
    }
  }, [selectedProvider])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-theme">模型列表</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索模型..."
              className="w-64 p-2 pr-8 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-theme"
            />
            <svg
              className="absolute right-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-theme"
            disabled={isLoading}
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.provider}>
                {provider.provider}
              </option>
            ))}
          </select>
          <button
            onClick={() => fetchModels(selectedProvider)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 dark:hover:bg-blue-400 transition-theme"
            disabled={isLoading || !selectedProvider}
          >
            刷新
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="text-center py-12 px-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-theme">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? '没有找到匹配的模型' : '没有找到可用模型'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? '请尝试其他搜索关键词' : '请检查提供商配置或选择其他提供商'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {currentModels.map((model) => (
                <div
                  key={model.id}
                  className="p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-theme"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {model.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {model.id}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(model.id)
                          toast({
                            title: "成功",
                            description: "ID 已复制到剪贴板",
                            variant: "default",
                            className: "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800",
                          })
                        }}
                        className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-theme"
                        aria-label="复制 ID"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {model.description && (
                    <div className="prose prose-sm dark:prose-invert max-w-none mb-2">
                      <ReactMarkdown className="text-xs text-gray-500 dark:text-gray-400">
                        {model.description}
                      </ReactMarkdown>
                    </div>
                  )}
                  {model.reasoning && (
                    <div className="prose prose-sm dark:prose-invert max-w-none mb-2">
                      <div className="text-xs text-blue-500 dark:text-blue-400 font-medium mb-1">推理过程：</div>
                      <ReactMarkdown className="text-xs text-gray-500 dark:text-gray-400">
                        {model.reasoning}
                      </ReactMarkdown>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {model.context_length && (
                      <div className="text-gray-600 dark:text-gray-400">
                        上下文长度: {model.context_length.toLocaleString()}
                      </div>
                    )}
                    {model.pricing && (
                      <div className="text-gray-600 dark:text-gray-400">
                        价格: {model.pricing.prompt} / {model.pricing.completion}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 分页控制 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-theme"
                >
                  上一页
                </button>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  第 {currentPage} 页，共 {totalPages} 页
                </span>
                <button
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-theme"
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 