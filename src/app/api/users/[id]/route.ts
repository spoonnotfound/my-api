import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 不允许删除 admin 用户
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    if (user.username === 'admin') {
      return NextResponse.json({ error: '不能删除管理员用户' }, { status: 403 })
    }

    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json({ error: '删除用户失败' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: '密码不能为空' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { password: hashedPassword },
      select: { id: true, username: true }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Failed to update user password:', error)
    return NextResponse.json({ error: '更新密码失败' }, { status: 500 })
  }
} 