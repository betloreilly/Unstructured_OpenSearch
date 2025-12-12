'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Tag, 
  HelpCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
  XCircle,
  Zap,
  MessageSquare,
  BarChart3,
  Lightbulb,
  FileText,
  Target,
  AlertCircle,
  LogOut
} from 'lucide-react'

interface NeedsImprovementEntry {
  id: string
  question: string
  answer: string
  timestamp: string
  quality_score: number
  quality_label: string
  improvement_reason?: string
  category?: string
  question_type?: string
  question_complexity?: string
  latency_ms?: number
}

interface Stats {
  total_queries: number
  avg_latency: number
  quality_distribution: { good: number; fair: number; poor: number }
  top_categories: { name: string; count: number }[]
}

export default function AnalyticsPage() {
  const [needsImprovement, setNeedsImprovement] = useState<NeedsImprovementEntry[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check')
        if (res.ok) {
          setAuthenticated(true)
        } else {
          setAuthenticated(false)
          router.push('/login')
        }
      } catch {
        setAuthenticated(false)
        router.push('/login')
      }
    }
    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const [improvementRes, statsRes] = await Promise.all([
        fetch('/api/analytics/needs-improvement?limit=50'),
        fetch('/api/analytics/stats'),
      ])

      if (improvementRes.ok) {
        const data = await improvementRes.json()
        setNeedsImprovement(data.questions || [])
      }

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated) {
      fetchData()
    }
  }, [authenticated])

  const qualityColor = (score: number) => {
    if (score >= 0.7) return 'text-green-400'
    if (score >= 0.4) return 'text-yellow-400'
    return 'text-red-400'
  }

  const qualityBg = (score: number) => {
    if (score >= 0.7) return 'bg-green-400/20'
    if (score >= 0.4) return 'bg-yellow-400/20'
    return 'bg-red-400/20'
  }

  const getQualityPercentage = () => {
    if (!stats || stats.total_queries === 0) return 0
    return Math.round((stats.quality_distribution.good / stats.total_queries) * 100)
  }

  const getImprovementRate = () => {
    if (!stats || stats.total_queries === 0) return 0
    return Math.round((stats.quality_distribution.poor / stats.total_queries) * 100)
  }

  // Show loading while checking auth
  if (authenticated === null) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 animate-spin text-teal-accent mx-auto mb-4" />
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </main>
    )
  }

  // Redirect if not authenticated (handled by useEffect, but just in case)
  if (!authenticated) {
    return null
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Chat</span>
            </Link>
            <div className="h-6 w-px bg-white/20" />
            <h1 className="font-display font-semibold text-xl text-white">
              RAG Analytics
            </h1>
            <span className="px-2 py-1 bg-teal-accent/20 text-teal-accent text-xs rounded-full">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            <a
              href="http://localhost:5601/goto/ae609fc1332e4912988652588405074b"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-accent/20 text-teal-accent hover:bg-teal-accent/30 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>OpenSearch Dashboards</span>
            </a>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading && !stats ? (
          <div className="text-center py-20 text-gray-400">
            <RefreshCw className="w-10 h-10 animate-spin mx-auto mb-4" />
            <p>Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Main Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <MessageSquare className="w-4 h-4" />
                  Total Queries
                </div>
                <div className="text-3xl font-display font-bold text-white">
                  {stats?.total_queries || 0}
                </div>
                <p className="text-xs text-gray-500 mt-1">All time interactions</p>
              </div>

              <div className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  <Clock className="w-4 h-4" />
                  Avg Response Time
                </div>
                <div className="text-3xl font-display font-bold text-white">
                  {stats?.avg_latency ? stats.avg_latency.toFixed(0) : 0}
                  <span className="text-lg text-gray-400">ms</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.avg_latency && stats.avg_latency < 2000 ? '✓ Good performance' : '⚠ Consider optimization'}
                </p>
              </div>

              <div className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 text-green-400 text-sm mb-2">
                  <CheckCircle className="w-4 h-4" />
                  Quality Rate
                </div>
                <div className="text-3xl font-display font-bold text-green-400">
                  {getQualityPercentage()}%
                </div>
                <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-400 rounded-full transition-all"
                    style={{ width: `${getQualityPercentage()}%` }}
                  />
                </div>
              </div>

              <div className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 text-amber-400 text-sm mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Needs Improvement
                </div>
                <div className="text-3xl font-display font-bold text-amber-400">
                  {needsImprovement.length}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {getImprovementRate()}% of total queries
                </p>
              </div>
            </div>

            {/* Quality Breakdown & Categories */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Quality Distribution */}
              <div className="glass rounded-xl p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-accent" />
                  Quality Distribution
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Good
                      </span>
                      <span className="text-gray-400">{stats?.quality_distribution.good || 0}</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-400 rounded-full"
                        style={{ width: `${stats ? (stats.quality_distribution.good / Math.max(stats.total_queries, 1)) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-yellow-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Fair
                      </span>
                      <span className="text-gray-400">{stats?.quality_distribution.fair || 0}</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${stats ? (stats.quality_distribution.fair / Math.max(stats.total_queries, 1)) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-400 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Poor
                      </span>
                      <span className="text-gray-400">{stats?.quality_distribution.poor || 0}</span>
                    </div>
                    <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-400 rounded-full"
                        style={{ width: `${stats ? (stats.quality_distribution.poor / Math.max(stats.total_queries, 1)) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Categories */}
              <div className="glass rounded-xl p-5">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-teal-accent" />
                  Top Question Categories
                </h2>
                {stats && stats.top_categories.length > 0 ? (
                  <div className="space-y-3">
                    {stats.top_categories.slice(0, 5).map((cat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-ocean/50 flex items-center justify-center text-teal-accent font-semibold text-sm">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-white font-medium">{cat.name}</span>
                            <span className="text-gray-400">{cat.count}</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                            <div 
                              className="h-full bg-teal-accent/60 rounded-full"
                              style={{ width: `${(cat.count / Math.max(stats.top_categories[0]?.count || 1, 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No categories recorded yet.</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass rounded-xl p-5 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                Recommendations to Improve RAG Quality
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-teal-accent" />
                    <h3 className="font-medium text-white">Add Documents</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Questions flagged as "not found" indicate knowledge gaps. Add docs for these topics.
                  </p>
                  {needsImprovement.length > 0 && (
                    <div className="mt-2 px-2 py-1 bg-amber-400/10 rounded text-amber-400 text-xs">
                      {needsImprovement.length} questions need better sources
                    </div>
                  )}
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-teal-accent" />
                    <h3 className="font-medium text-white">Improve Chunking</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Complex questions with low scores may need better document chunking for context.
                  </p>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4 text-teal-accent" />
                    <h3 className="font-medium text-white">Tune Retrieval</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Adjust hybrid search weights (BM25 vs vector) based on your content type.
                  </p>
                  {stats && stats.avg_latency > 3000 && (
                    <div className="mt-2 px-2 py-1 bg-amber-400/10 rounded text-amber-400 text-xs">
                      High latency detected - consider optimization
                    </div>
                  )}
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-4 h-4 text-teal-accent" />
                    <h3 className="font-medium text-white">Refine Prompts</h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Update Langflow prompts to better handle edge cases from poor responses.
                  </p>
                </div>
              </div>
            </div>

            {/* Questions Needing Improvement */}
            <div className="glass rounded-xl p-5 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Questions Needing Improvement
                <span className="ml-2 px-2 py-0.5 bg-amber-400/20 text-amber-400 text-sm rounded-full">
                  {needsImprovement.length}
                </span>
              </h2>

              {needsImprovement.length === 0 ? (
                <div className="text-center py-10">
                  <CheckCircle className="w-12 h-12 text-green-400/50 mx-auto mb-3" />
                  <p className="text-gray-400">No questions flagged for improvement!</p>
                  <p className="text-gray-500 text-sm mt-1">
                    All responses are meeting quality standards.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {needsImprovement.map((entry) => (
                    <div 
                      key={entry.id}
                      className="bg-white/5 rounded-lg overflow-hidden border border-white/5"
                    >
                      <button
                        onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                        className="w-full px-4 py-3 flex items-start gap-4 text-left hover:bg-white/5 transition-colors"
                      >
                        <div className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium ${qualityBg(entry.quality_score)} ${qualityColor(entry.quality_score)}`}>
                          {(entry.quality_score * 100).toFixed(0)}%
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium line-clamp-2">
                            {entry.question}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-400 flex-wrap">
                            {entry.category && (
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {entry.category}
                              </span>
                            )}
                            {entry.question_type && (
                              <span className="px-1.5 py-0.5 bg-white/10 rounded text-xs">
                                {entry.question_type}
                              </span>
                            )}
                            {entry.question_complexity && (
                              <span className="px-1.5 py-0.5 bg-white/10 rounded text-xs">
                                {entry.question_complexity}
                              </span>
                            )}
                            <span className="text-gray-500">
                              {new Date(entry.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {expandedId === entry.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>

                      {expandedId === entry.id && (
                        <div className="px-4 pb-4 border-t border-white/10 pt-4 space-y-4">
                          <div>
                            <label className="text-xs text-gray-500 uppercase tracking-wide">
                              Answer Given
                            </label>
                            <p className="text-gray-300 mt-1 text-sm whitespace-pre-wrap bg-black/20 p-3 rounded-lg">
                              {entry.answer}
                            </p>
                          </div>
                          
                          {entry.improvement_reason && (
                            <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-lg">
                              <label className="text-xs text-amber-400 uppercase tracking-wide flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Why Improvement Needed
                              </label>
                              <p className="text-amber-400/90 mt-1 text-sm">
                                {entry.improvement_reason}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-4 text-sm text-gray-400">
                            {entry.latency_ms && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {entry.latency_ms}ms
                              </span>
                            )}
                            <span className={`flex items-center gap-1 ${qualityColor(entry.quality_score)}`}>
                              Quality: {entry.quality_label}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Embedded OpenSearch Dashboard */}
            <div className="glass rounded-xl p-5">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-accent" />
                OpenSearch Analytics Dashboard
              </h2>
              <div className="rounded-lg overflow-hidden bg-white">
                <iframe 
                  src="http://localhost:5601/app/dashboards#/view/d4ef20a0-d742-11f0-8c94-2f00b6262e2d?embed=true&_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-15h,to:now))&_a=(description:'',filters:!(),fullScreenMode:!f,options:(hidePanelTitles:!f,useMargins:!t),query:(language:kuery,query:''),timeRestore:!f,title:'RAG%20Analytics%20Dashboard',viewMode:view)&show-time-filter=true" 
                  height="500"
                  width="100%"
                  className="border-0"
                  title="RAG Analytics Dashboard"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
