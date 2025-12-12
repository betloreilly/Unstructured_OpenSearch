'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, BarChart3, Loader2, Bot, User, Clock, AlertCircle, CheckCircle, Lock } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    latency_ms?: number
    quality_score?: number
    category?: string
    needs_improvement?: boolean
  }
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => crypto.randomUUID())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const startTime = Date.now()
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: sessionId,
        }),
      })

      const data = await response.json()
      const latency = Date.now() - startTime

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.answer,
        timestamp: new Date(),
        metadata: {
          latency_ms: latency,
          quality_score: data.quality_score,
          category: data.category,
          needs_improvement: data.needs_improvement,
        },
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-accent to-ocean flex items-center justify-center glow-teal">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-midnight animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-semibold text-xl text-white">NovaPay Support</h1>
              <p className="text-xs text-gray-400">Powered by OpenSearch & Langflow</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all"
            >
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {messages.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-accent/20 to-ocean/20 flex items-center justify-center mx-auto mb-6 glow-teal">
                <Bot className="w-10 h-10 text-teal-accent" />
              </div>
              <h2 className="text-2xl font-display font-semibold text-white mb-3">
                Ask anything about NovaPay Banking
              </h2>
              <p className="text-gray-400 max-w-md mx-auto mb-8">
                Get help with cards, accounts, transfers, and more. All Q&A is logged to improve support quality.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  'What is the daily ATM limit in Japan?',
                  'How do I report a stolen card?',
                  'What are the wire transfer fees?',
                ].map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-sm hover:bg-white/10 hover:text-white transition-all border border-white/10"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 message-enter ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-accent to-ocean flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-ocean/40 rounded-2xl rounded-tr-md'
                        : 'glass rounded-2xl rounded-tl-md'
                    } px-5 py-4`}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose-custom">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-white">{message.content}</p>
                    )}
                    
                    {message.metadata && (
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-3 text-xs text-gray-400">
                        {message.metadata.latency_ms && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {message.metadata.latency_ms}ms
                          </span>
                        )}
                        {message.metadata.category && (
                          <span className="px-2 py-0.5 bg-ocean/30 text-teal-accent rounded-full">
                            {message.metadata.category}
                          </span>
                        )}
                        {message.metadata.quality_score !== undefined && (
                          <span className={`flex items-center gap-1 ${
                            message.metadata.quality_score >= 0.7 
                              ? 'text-green-400' 
                              : message.metadata.quality_score >= 0.4 
                                ? 'text-yellow-400' 
                                : 'text-red-400'
                          }`}>
                            {message.metadata.quality_score >= 0.7 ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <AlertCircle className="w-3 h-3" />
                            )}
                            Quality: {(message.metadata.quality_score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-coral/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-coral" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 message-enter">
                  <div className="flex-shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-accent to-ocean flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="glass rounded-2xl rounded-tl-md px-5 py-4">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-teal-accent rounded-full typing-dot" />
                      <div className="w-2 h-2 bg-teal-accent rounded-full typing-dot" />
                      <div className="w-2 h-2 bg-teal-accent rounded-full typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="glass border-t border-white/10 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about cards, limits, transfers, disputes..."
              rows={1}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 pr-14 text-white placeholder-gray-500 focus:outline-none focus:border-teal-accent/50 focus:ring-2 focus:ring-teal-accent/20 resize-none transition-all"
              style={{ minHeight: '56px', maxHeight: '200px' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-gradient-to-r from-teal-accent to-ocean flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-teal-accent/25 transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
          <p className="text-xs text-gray-500 text-center mt-2">
            All interactions are logged to OpenSearch for quality analytics
          </p>
        </div>
      </div>
    </main>
  )
}
