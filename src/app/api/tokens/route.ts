import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function GET() {
  try {
    const tokens = await prisma.token.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(tokens)
  } catch (error: unknown) {
    console.error('Failed to fetch tokens:', error)
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 })
  }
}

function generateToken(): string {
  // 生成一个类似 OpenAI 的令牌格式：sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  const randomBytesLength = 32 // 生成 32 字节的随机数据
  const randomHex = randomBytes(randomBytesLength).toString('hex')
  return `sk-${randomHex}`
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()
    const token = await prisma.token.create({
      data: {
        name,
        token: generateToken(),
      }
    })
    return NextResponse.json(token)
  } catch (error: unknown) {
    console.error('Failed to create token:', error)
    return NextResponse.json({ error: 'Failed to create token' }, { status: 500 })
  }
} 