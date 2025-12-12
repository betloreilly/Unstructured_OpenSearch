import { NextRequest, NextResponse } from 'next/server'
import { getQuestionsNeedingImprovement } from '@/lib/opensearch'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    
    const questions = await getQuestionsNeedingImprovement(limit)
    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Needs improvement API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions needing improvement' },
      { status: 500 }
    )
  }
}

