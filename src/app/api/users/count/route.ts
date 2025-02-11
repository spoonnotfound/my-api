import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const count = await prisma.user.count()
    return NextResponse.json({ count })
  } catch (error) {
    console.error('Failed to get user count:', error)
    return NextResponse.json({ error: '获取用户数量失败' }, { status: 500 })
  }
} 