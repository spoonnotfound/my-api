import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const token = (await cookies()).get('token')?.value

    if (!token) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }

    const decoded = verify(token, 'your-secret-key') as { id: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, username: true }
    })

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ error: '验证失败' }, { status: 401 })
  }
} 