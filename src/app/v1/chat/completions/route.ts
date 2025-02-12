import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import axios from 'axios'

async function validateToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false
  const dbToken = await prisma.token.findFirst({
    where: {
      token,
      isActive: true
    }
  })
  return !!dbToken
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    const isValid = await validateToken(token)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { model, stream = false } = body

    if (!model || !model.includes('@')) {
      return NextResponse.json({ 
        error: 'Invalid model format. Expected format: provider/model_name' 
      }, { status: 400 })
    }

    const [provider, modelName] = model.split('@')

    const modelConfig = await prisma.modelConfig.findFirst({
      where: {
        AND: [
          { provider: provider },
          { isActive: true }
        ]
      }
    })

    if (!modelConfig) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
    }

    const baseUrl = modelConfig.baseUrl || 'https://api.openai.com/v1'
    const headers = {
      'Authorization': `Bearer ${modelConfig.apiKey}`,
      'Content-Type': 'application/json'
    }

    const requestBody = {
      ...body,
      model: modelName,
      stream
    }

    if (stream) {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const error = await response.json()
        return NextResponse.json(error, { status: response.status })
      }

      const encoder = new TextEncoder()
      const decoder = new TextDecoder()
      let counter = 0

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body?.getReader()
          if (!reader) {
            controller.close()
            return
          }

          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                break
              }

              const chunk = decoder.decode(value)
              const lines = chunk.split('\n')
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') {
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                  } else {
                    try {
                      const parsed = JSON.parse(data)
                      parsed.id = `chatcmpl-${counter}`
                      counter += 1
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify(parsed)}\n\n`))
                    } catch (error) {
                      console.error('Error parsing SSE message:', error)
                    }
                  }
                }
              }
            }
          } catch (error) {
            console.error('Error reading stream:', error)
            controller.error(error)
          } finally {
            reader.releaseLock()
            controller.close()
          }
        }
      })

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        }
      })
    } else {
      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        requestBody,
        { headers }
      )
      return NextResponse.json(response.data)
    }
  } catch (error: unknown) {
    console.error('Chat completion error:', error)
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 