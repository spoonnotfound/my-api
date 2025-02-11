import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(
  req: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params
    // 不允许删除 admin 用户
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    if (user.username === 'admin') {
      return NextResponse.json({ error: '不能删除管理员用户' }, { status: 403 })
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete user:', error)
    return NextResponse.json({ error: '删除用户失败' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: Props
) {
  try {
    const { id } = await params
    const { password } = await req.json()

    if (!password) {
      return NextResponse.json({ error: '密码不能为空' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 })
    }

    // 如果是 admin 用户，不允许修改密码
    if (user.username === 'admin') {
      return NextResponse.json({ error: '不能修改管理员密码' }, { status: 403 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json({ error: '更新用户失败' }, { status: 500 })
  }
} 