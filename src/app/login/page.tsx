'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkFirstLogin()
  }, [])

  const checkFirstLogin = async () => {
    try {
      const response = await fetch('/api/users/count')
      const data = await response.json()
      setIsFirstLogin(data.count === 0)
      if (data.count === 0) {
        setUsername('admin')
      }
    } catch (error) {
      console.error('Failed to check first login:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return  // 防止重复提交

    if (!username.trim() || !password.trim()) {
      setError('用户名和密码不能为空')
      return
    }

    if (isFirstLogin) {
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致')
        return
      }
      if (username !== 'admin') {
        setError('首次登录只能设置管理员账户')
        return
      }
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        router.push('/')
      } else {
        const data = await response.json()
        setError(data.error || '登录失败')
        setPassword('') // 清空密码输入
        setConfirmPassword('') // 清空确认密码输入
      }
    } catch (error) {
      console.error('Login failed:', error)
      setError('登录失败，请重试')
      setPassword('') // 清空密码输入
      setConfirmPassword('') // 清空确认密码输入
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white transition-theme">
            My-API
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400 transition-theme">
            {isFirstLogin ? '首次登录，请设置管理员密码' : '请登录以继续使用'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
              <div className="text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-3">
            <div>
              <label htmlFor="username" className="sr-only">
                用户名
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-theme"
                placeholder="用户名"
                disabled={isLoading || isFirstLogin}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-theme"
                placeholder={isFirstLogin ? '设置密码' : '密码'}
                disabled={isLoading}
              />
            </div>
            {isFirstLogin && (
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  确认密码
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800 transition-theme"
                  placeholder="确认密码"
                  disabled={isLoading}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-theme"
            >
              {isLoading ? '登录中...' : (isFirstLogin ? '设置密码并登录' : '登录')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 