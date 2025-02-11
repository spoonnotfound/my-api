import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { sign } from 'jsonwebtoken'
import { getJwtSecret } from '@/lib/config'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: '用户名和密码不能为空' }, { status: 400 })
    }

    let user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      // 如果用户不存在，创建新用户
      try {
        const hashedPassword = await bcrypt.hash(password, 10)
        user = await prisma.user.create({
          data: {
            username,
            password: hashedPassword
          }
        })
      } catch (error) {
        console.error('Failed to create user:', error)
        return NextResponse.json({ error: '创建用户失败' }, { status: 500 })
      }
    } else {
      // 如果用户存在，验证密码
      try {
        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
          return NextResponse.json({ error: '密码错误' }, { status: 401 })
        }
      } catch (error) {
        console.error('Password comparison failed:', error)
        return NextResponse.json({ error: '密码验证失败' }, { status: 500 })
      }
    }

    // 生成 JWT token
    try {
      const token = sign({ id: user.id }, getJwtSecret(), {
        expiresIn: '7d'
      })
      
      // 设置 cookie
      const cookieStore = await cookies()
      cookieStore.set('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      })

      return NextResponse.json({
        id: user.id,
        username: user.username
      })
    } catch (error) {
      console.error('Token generation or cookie setting failed:', error)
      return NextResponse.json({ error: '登录失败' }, { status: 500 })
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: '登录失败' }, { status: 500 })
  }
} 