import { NextResponse } from 'next/server'
import { getAnalyticsStats } from '@/lib/opensearch'

export async function GET() {
  try {
    const stats = await getAnalyticsStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Analytics stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics stats' },
      { status: 500 }
    )
  }
}

