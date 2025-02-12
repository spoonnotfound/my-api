import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface ModelConfigData {
  provider: string
  apiKey: string
  baseUrl?: string | null
  isActive?: boolean
  modelType?: string | null
}

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
    const data = await request.json() as ModelConfigData
    
    // 验证必需的字段
    if (!data.provider) {
      return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
    }
    if (!data.apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 })
    }

    const model = await prisma.modelConfig.create({
      data: {
        provider: data.provider,
        apiKey: data.apiKey,
        baseUrl: data.baseUrl ?? null,
        isActive: data.isActive ?? true,
        modelType: data.modelType ?? null
      }
    })
    return NextResponse.json(model)
  } catch (error: unknown) {
    console.error('Failed to create model:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create model' }, { status: 500 })
  }
} 