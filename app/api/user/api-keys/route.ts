import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const apiKeys = await prisma.apiKey.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        provider: true,
        keyValue: true,
      }
    })

    // Convert to object format for easier access
    const keysObject = apiKeys.reduce((acc, key) => {
      acc[key.provider] = key.keyValue
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json({ apiKeys: keysObject })

  } catch (error) {
    console.error('Error fetching API keys:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { provider, keyValue } = await request.json()

    if (!provider || !keyValue) {
      return NextResponse.json(
        { error: 'Provider and keyValue are required' },
        { status: 400 }
      )
    }

    // Upsert API key
    const apiKey = await prisma.apiKey.upsert({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: provider,
        }
      },
      update: {
        keyValue: keyValue,
      },
      create: {
        userId: session.user.id,
        provider: provider,
        keyValue: keyValue,
      }
    })

    return NextResponse.json({ 
      message: 'API key saved successfully',
      apiKey: {
        provider: apiKey.provider,
        keyValue: apiKey.keyValue,
      }
    })

  } catch (error) {
    console.error('Error saving API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get('provider')

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      )
    }

    await prisma.apiKey.delete({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider: provider,
        }
      }
    })

    return NextResponse.json({ 
      message: 'API key deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting API key:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 