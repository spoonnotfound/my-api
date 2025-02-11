import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const models = await prisma.modelConfig.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(models)
  } catch (error: unknown) {
    console.error('Failed to fetch models:', error)
    return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const model = await prisma.modelConfig.create({
      data
    })
    return NextResponse.json(model)
  } catch (error: unknown) {
    console.error('Failed to create model:', error)
    return NextResponse.json({ error: 'Failed to create model' }, { status: 500 })
  }
} 