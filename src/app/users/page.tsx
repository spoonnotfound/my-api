'use client'

import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'
import Modal from '@/components/Modal'

interface User {
  id: string
  username: string
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  })
  const { toast } = useToast()

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "错误",
        description: "获取用户列表失败",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.username.trim() || !formData.password.trim()) {
      toast({
        title: '错误',
        description: '用户名和密码不能为空',
        variant: 'default',
        className: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800',
      })
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: '错误',
        description: '两次输入的密码不一致',
        variant: 'default',
        className: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800',
      })
      return
    }

    setIsLoading(true)
    try {
      const url = editingId ? `/api/users/${editingId}` : '/api/users'
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '操作失败')
      }
      
      if (editingId) {
        setUsers(users.map(user => user.id === editingId ? data : user))
        toast({
          title: '成功',
          description: '用户已更新',
          variant: 'default',
          className: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800',
        })
      } else {
        setUsers([data, ...users])
        toast({
          title: '成功',
          description: '用户已创建',
          variant: 'default',
          className: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800',
        })
      }
      
      setFormData({ username: '', password: '', confirmPassword: '' })
      setIsModalOpen(false)
      setEditingId(null)
    } catch (error) {
      console.error('Failed to save user:', error)
      toast({
        title: '错误',
        description: error instanceof Error ? error.message : '操作失败',
        variant: 'default',
        className: 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-800',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setFormData({
      username: user.username,
      password: '',
      confirmPassword: '',
    })
    setEditingId(user.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('确定要删除这个用户吗？')) return

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '删除用户失败')
      }

      toast({
        title: '成功',
        description: '用户已删除',
        variant: 'default',
        className: 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800',
      })
      
      setUsers(users.filter(user => user.id !== userId))
    } catch (error) {
      console.error('Failed to delete user:', error)
      toast({
        title: '错误',
        description: error instanceof Error ? error.message : '删除用户失败',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-theme">用户管理</h1>
        <button
          onClick={() => {
            setFormData({ username: '', password: '', confirmPassword: '' })
            setEditingId(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:hover:bg-blue-500 transition-theme"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          添加用户
        </button>
      </div>

      <div className="space-y-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="p-4 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 transition-theme"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-theme">{user.username}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="p-1 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-theme"
                  aria-label="编辑"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {user.username !== 'admin' && (
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-theme"
                    aria-label="删除"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 transition-theme">
              创建时间: {new Date(user.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setFormData({ username: '', password: '', confirmPassword: '' })
          setEditingId(null)
        }}
        title={editingId ? "编辑用户" : "添加用户"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 transition-theme">用户名</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="输入用户名"
              className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-theme"
              disabled={Boolean(isLoading || (editingId && formData.username === 'admin'))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 transition-theme">
              {editingId ? '新密码' : '密码'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingId ? '不修改请留空' : '输入密码'}
              className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-theme"
              disabled={isLoading}
              required={!editingId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300 transition-theme">
              确认{editingId ? '新密码' : '密码'}
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder={editingId ? '不修改请留空' : '再次输入密码'}
              className="w-full p-2 border dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-theme"
              disabled={isLoading}
              required={!editingId}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false)
                setFormData({ username: '', password: '', confirmPassword: '' })
                setEditingId(null)
              }}
              className="px-4 py-2 border dark:border-gray-700 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-theme"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 dark:hover:bg-blue-400 transition-theme"
              disabled={isLoading || (!editingId && (!formData.username.trim() || !formData.password.trim()))}
            >
              {editingId ? '确认修改' : '确认添加'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
} 