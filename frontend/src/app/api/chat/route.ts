import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { logRAGInteraction, RAGAnalyticsEntry } from '@/lib/opensearch'
import { analyzeInteraction } from '@/lib/llm-analysis'

const LANGFLOW_URL = process.env.LANGFLOW_URL || 'http://localhost:7860'
const LANGFLOW_FLOW_ID = process.env.LANGFLOW_FLOW_ID || '346acaa3-2e85-4478-8ed1-16929cdfde0a'
const LANGFLOW_API_KEY = process.env.LANGFLOW_API_KEY || ''

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const body = await request.json()
    const { message, session_id } = body
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Call Langflow API
    const langflowPayload = {
      output_type: 'chat',
      input_type: 'chat',
      input_value: message,
      session_id: session_id || uuidv4(),
    }

    // Build headers - include API key if provided
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (LANGFLOW_API_KEY) {
      headers['x-api-key'] = LANGFLOW_API_KEY
    }

    const langflowResponse = await fetch(
      `${LANGFLOW_URL}/api/v1/run/${LANGFLOW_FLOW_ID}`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(langflowPayload),
      }
    )

    // Get response as text first to check for HTML errors
    const responseText = await langflowResponse.text()
    
    // Check if response is HTML (error page)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error('Langflow returned HTML:', responseText.substring(0, 200))
      return NextResponse.json(
        { error: 'Langflow returned an error page. Check if the flow ID is correct and Langflow is configured properly.' },
        { status: 502 }
      )
    }

    if (!langflowResponse.ok) {
      console.error('Langflow error:', responseText)
      
      // Try to parse error message
      try {
        const errorData = JSON.parse(responseText)
        const errorMsg = errorData.detail || errorData.message || errorData.error || 'Unknown error'
        return NextResponse.json(
          { error: `Langflow error: ${errorMsg}` },
          { status: langflowResponse.status }
        )
      } catch {
        return NextResponse.json(
          { error: `Langflow API error: ${langflowResponse.status}` },
          { status: langflowResponse.status }
        )
      }
    }

    // Parse JSON response
    let langflowData
    try {
      langflowData = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse Langflow response:', responseText.substring(0, 500))
      return NextResponse.json(
        { error: 'Invalid JSON response from Langflow' },
        { status: 502 }
      )
    }
    const latency = Date.now() - startTime

    // Extract answer from Langflow response
    // The response structure may vary - handle common patterns
    let answer = ''
    let sources: { filename: string; relevance_score: number }[] = []
    
    if (langflowData.outputs) {
      // Handle array of outputs
      for (const output of langflowData.outputs) {
        if (output.outputs) {
          for (const innerOutput of output.outputs) {
            if (innerOutput.results?.message?.text) {
              answer = innerOutput.results.message.text
            } else if (innerOutput.results?.text) {
              answer = innerOutput.results.text
            } else if (innerOutput.message?.text) {
              answer = innerOutput.message.text
            }
          }
        }
      }
    } else if (langflowData.result) {
      answer = typeof langflowData.result === 'string' 
        ? langflowData.result 
        : langflowData.result.text || JSON.stringify(langflowData.result)
    } else if (langflowData.text) {
      answer = langflowData.text
    }

    if (!answer) {
      answer = 'No response received from the RAG system.'
    }

    // Analyze the interaction using LLM (async, don't block response)
    const interactionId = uuidv4()
    
    // Start analysis in background
    analyzeAndLog(
      interactionId,
      session_id || langflowPayload.session_id,
      message,
      answer,
      latency,
      sources
    ).catch(err => console.error('Background analysis error:', err))

    // Return immediate response
    return NextResponse.json({
      answer,
      session_id: session_id || langflowPayload.session_id,
      latency_ms: latency,
      interaction_id: interactionId,
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

// Background function to analyze and log
async function analyzeAndLog(
  id: string,
  sessionId: string,
  question: string,
  answer: string,
  latencyMs: number,
  sources: { filename: string; relevance_score: number }[]
) {
  try {
    // Run LLM analysis
    const analysis = await analyzeInteraction(question, answer)

    // Create analytics entry
    const entry: RAGAnalyticsEntry = {
      id,
      session_id: sessionId,
      question,
      answer,
      timestamp: new Date().toISOString(),
      latency_ms: latencyMs,
      quality_score: analysis.quality_score,
      quality_label: analysis.quality_label,
      needs_improvement: analysis.needs_improvement,
      improvement_reason: analysis.improvement_reason,
      category: analysis.category,
      subcategory: analysis.subcategory,
      topics: analysis.topics,
      question_type: analysis.question_type,
      question_complexity: analysis.question_complexity,
      answer_length: answer.length,
      has_citations: analysis.has_citations,
      confidence_expressed: analysis.confidence_expressed,
      sources_count: sources.length,
      sources: sources.length > 0 ? sources : undefined,
      langflow_flow_id: LANGFLOW_FLOW_ID,
    }

    // Log to OpenSearch
    await logRAGInteraction(entry)
    console.log(`Logged interaction ${id}: quality=${analysis.quality_label}, category=${analysis.category}`)

  } catch (error) {
    console.error('Error in analyzeAndLog:', error)
  }
}

