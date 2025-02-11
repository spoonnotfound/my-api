import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(
  req: NextRequest,
  { params }: Props
) {
  const { id } = await params
  try {
    await prisma.modelConfig.delete({
      where: {
        id
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete model:', error)
    return NextResponse.json(
      { error: 'Failed to delete model' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: Props
) {
  const { id } = await params
  try {
    const data = await req.json()
    const model = await prisma.modelConfig.update({
      where: {
        id
      },
      data
    })
    return NextResponse.json(model)
  } catch (error) {
    console.error('Failed to update model:', error)
    return NextResponse.json(
      { error: 'Failed to update model' },
      { status: 500 }
    )
  }
} 