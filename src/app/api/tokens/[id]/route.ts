import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(
  request: Request,
  { params }: Props
) {
  try {
    const { id } = await params
    await prisma.token.delete({
      where: {
        id: id
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete token:', error)
    return NextResponse.json(
      { error: 'Failed to delete token' },
      { status: 500 }
    )
  }
} 