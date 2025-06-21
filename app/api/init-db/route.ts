import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check if we're in development or if a secret is provided
    const { secret } = await request.json()
    
    if (process.env.NODE_ENV === 'production' && secret !== 'init-db-secret-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Test database connection
    await prisma.$connect()
    
    // Try to create a test query to ensure tables exist
    const userCount = await prisma.user.count()
    
    return NextResponse.json({
      message: 'Database initialized successfully',
      userCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database initialization error:', error)
    return NextResponse.json({
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 