import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request: Request) {
  try {
    const token = (await cookies()).get('token')?.value

    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const decoded = verify(token, 'your-secret-key') as { id: string }
    const { username, currentPassword, newPassword } = await request.json()

    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 })
    }

    // 如果要修改密码，验证当前密码
    if (currentPassword && newPassword) {
      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ error: '当前密码错误' }, { status: 400 })
      }
    }

    // 准备更新数据
    const updateData: { username?: string; password?: string } = {}
    
    if (username && username !== user.username) {
      // 检查用户名是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { username }
      })
      if (existingUser) {
        return NextResponse.json({ error: '用户名已存在' }, { status: 400 })
      }
      updateData.username = username
    }

    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 10)
    }

    // 如果没有要更新的内容
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '没有要更新的内容' }, { status: 400 })
    }

    // 更新用户信息
    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: updateData,
      select: { id: true, username: true }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
} 