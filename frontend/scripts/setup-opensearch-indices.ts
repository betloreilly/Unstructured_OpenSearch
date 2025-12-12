/**
 * Setup script for OpenSearch indices and dashboard objects
 * Run with: npm run setup-opensearch
 */

import { Client } from '@opensearch-project/opensearch'

const OPENSEARCH_URL = process.env.OPENSEARCH_URL || 'http://localhost:9200'
const DASHBOARDS_URL = process.env.OPENSEARCH_DASHBOARDS_URL || 'http://localhost:5601'

const client = new Client({
  node: OPENSEARCH_URL,
  ssl: { rejectUnauthorized: false },
})

// RAG Analytics Index Schema
const RAG_ANALYTICS_INDEX = 'rag_analytics'
const RAG_ANALYTICS_SCHEMA = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
  },
  mappings: {
    properties: {
      id: { type: 'keyword' },
      session_id: { type: 'keyword' },
      question: {
        type: 'text',
        fields: { keyword: { type: 'keyword', ignore_above: 512 } },
      },
      answer: {
        type: 'text',
        fields: { keyword: { type: 'keyword', ignore_above: 2048 } },
      },
      timestamp: { type: 'date' },
      latency_ms: { type: 'integer' },
      quality_score: { type: 'float' },
      quality_label: { type: 'keyword' },
      needs_improvement: { type: 'boolean' },
      improvement_reason: { type: 'text' },
      category: { type: 'keyword' },
      subcategory: { type: 'keyword' },
      topics: { type: 'keyword' },
      question_type: { type: 'keyword' },
      question_complexity: { type: 'keyword' },
      answer_length: { type: 'integer' },
      has_citations: { type: 'boolean' },
      confidence_expressed: { type: 'boolean' },
      sources_count: { type: 'integer' },
      sources: {
        type: 'nested',
        properties: {
          filename: { type: 'keyword' },
          relevance_score: { type: 'float' },
        },
      },
      user_rating: { type: 'integer' },
      user_feedback: { type: 'text' },
      model_used: { type: 'keyword' },
      langflow_flow_id: { type: 'keyword' },
    },
  },
}

// Index Pattern for Dashboards
const INDEX_PATTERN = {
  attributes: {
    title: 'rag_analytics',
    timeFieldName: 'timestamp',
    fields: '[]',
  },
}

// Dashboard Visualizations
const VISUALIZATIONS = [
  {
    id: 'rag-quality-pie',
    type: 'visualization',
    attributes: {
      title: 'Answer Quality Distribution',
      visState: JSON.stringify({
        title: 'Answer Quality Distribution',
        type: 'pie',
        params: {
          type: 'pie',
          addTooltip: true,
          addLegend: true,
          legendPosition: 'right',
          isDonut: true,
        },
        aggs: [
          {
            id: '1',
            enabled: true,
            type: 'count',
            schema: 'metric',
          },
          {
            id: '2',
            enabled: true,
            type: 'terms',
            schema: 'segment',
            params: {
              field: 'quality_label',
              size: 5,
              order: 'desc',
              orderBy: '1',
            },
          },
        ],
      }),
      uiStateJSON: '{}',
      description: 'Distribution of answer quality ratings',
      kibanaSavedObjectMeta: {
        searchSourceJSON: JSON.stringify({
          index: 'rag_analytics',
          query: { query: '', language: 'kuery' },
          filter: [],
        }),
      },
    },
  },
  {
    id: 'rag-categories-bar',
    type: 'visualization',
    attributes: {
      title: 'Questions by Category',
      visState: JSON.stringify({
        title: 'Questions by Category',
        type: 'histogram',
        params: {
          type: 'histogram',
          addTooltip: true,
          addLegend: true,
        },
        aggs: [
          {
            id: '1',
            enabled: true,
            type: 'count',
            schema: 'metric',
          },
          {
            id: '2',
            enabled: true,
            type: 'terms',
            schema: 'segment',
            params: {
              field: 'category',
              size: 10,
              order: 'desc',
              orderBy: '1',
            },
          },
        ],
      }),
      uiStateJSON: '{}',
      description: 'Distribution of questions by category',
      kibanaSavedObjectMeta: {
        searchSourceJSON: JSON.stringify({
          index: 'rag_analytics',
          query: { query: '', language: 'kuery' },
          filter: [],
        }),
      },
    },
  },
  {
    id: 'rag-latency-line',
    type: 'visualization',
    attributes: {
      title: 'Response Latency Over Time',
      visState: JSON.stringify({
        title: 'Response Latency Over Time',
        type: 'line',
        params: {
          type: 'line',
          addTooltip: true,
          addLegend: true,
        },
        aggs: [
          {
            id: '1',
            enabled: true,
            type: 'avg',
            schema: 'metric',
            params: { field: 'latency_ms' },
          },
          {
            id: '2',
            enabled: true,
            type: 'date_histogram',
            schema: 'segment',
            params: {
              field: 'timestamp',
              interval: 'auto',
            },
          },
        ],
      }),
      uiStateJSON: '{}',
      description: 'Average response latency over time',
      kibanaSavedObjectMeta: {
        searchSourceJSON: JSON.stringify({
          index: 'rag_analytics',
          query: { query: '', language: 'kuery' },
          filter: [],
        }),
      },
    },
  },
  {
    id: 'rag-quality-timeline',
    type: 'visualization',
    attributes: {
      title: 'Quality Score Trend',
      visState: JSON.stringify({
        title: 'Quality Score Trend',
        type: 'line',
        params: {
          type: 'line',
          addTooltip: true,
          addLegend: true,
        },
        aggs: [
          {
            id: '1',
            enabled: true,
            type: 'avg',
            schema: 'metric',
            params: { field: 'quality_score' },
          },
          {
            id: '2',
            enabled: true,
            type: 'date_histogram',
            schema: 'segment',
            params: {
              field: 'timestamp',
              interval: 'auto',
            },
          },
        ],
      }),
      uiStateJSON: '{}',
      description: 'Average quality score over time',
      kibanaSavedObjectMeta: {
        searchSourceJSON: JSON.stringify({
          index: 'rag_analytics',
          query: { query: '', language: 'kuery' },
          filter: [],
        }),
      },
    },
  },
  {
    id: 'rag-needs-improvement',
    type: 'visualization',
    attributes: {
      title: 'Questions Needing Improvement',
      visState: JSON.stringify({
        title: 'Questions Needing Improvement',
        type: 'metric',
        params: {
          addTooltip: true,
          addLegend: false,
          type: 'metric',
        },
        aggs: [
          {
            id: '1',
            enabled: true,
            type: 'count',
            schema: 'metric',
          },
        ],
      }),
      uiStateJSON: '{}',
      description: 'Count of questions that need better resources',
      kibanaSavedObjectMeta: {
        searchSourceJSON: JSON.stringify({
          index: 'rag_analytics',
          query: { query: 'needs_improvement: true', language: 'kuery' },
          filter: [],
        }),
      },
    },
  },
  {
    id: 'rag-question-types',
    type: 'visualization',
    attributes: {
      title: 'Question Types',
      visState: JSON.stringify({
        title: 'Question Types',
        type: 'pie',
        params: {
          type: 'pie',
          addTooltip: true,
          addLegend: true,
          legendPosition: 'right',
        },
        aggs: [
          {
            id: '1',
            enabled: true,
            type: 'count',
            schema: 'metric',
          },
          {
            id: '2',
            enabled: true,
            type: 'terms',
            schema: 'segment',
            params: {
              field: 'question_type',
              size: 10,
              order: 'desc',
              orderBy: '1',
            },
          },
        ],
      }),
      uiStateJSON: '{}',
      description: 'Distribution of question types',
      kibanaSavedObjectMeta: {
        searchSourceJSON: JSON.stringify({
          index: 'rag_analytics',
          query: { query: '', language: 'kuery' },
          filter: [],
        }),
      },
    },
  },
  {
    id: 'rag-complexity-quality',
    type: 'visualization',
    attributes: {
      title: 'Quality by Complexity',
      visState: JSON.stringify({
        title: 'Quality by Complexity',
        type: 'histogram',
        params: {
          type: 'histogram',
          addTooltip: true,
          addLegend: true,
        },
        aggs: [
          {
            id: '1',
            enabled: true,
            type: 'avg',
            schema: 'metric',
            params: { field: 'quality_score' },
          },
          {
            id: '2',
            enabled: true,
            type: 'terms',
            schema: 'segment',
            params: {
              field: 'question_complexity',
              size: 5,
              order: 'desc',
              orderBy: '1',
            },
          },
        ],
      }),
      uiStateJSON: '{}',
      description: 'Average quality score by question complexity',
      kibanaSavedObjectMeta: {
        searchSourceJSON: JSON.stringify({
          index: 'rag_analytics',
          query: { query: '', language: 'kuery' },
          filter: [],
        }),
      },
    },
  },
  {
    id: 'rag-improvement-table',
    type: 'visualization',
    attributes: {
      title: 'Questions Needing Improvement - Details',
      visState: JSON.stringify({
        title: 'Questions Needing Improvement - Details',
        type: 'table',
        params: {
          perPage: 10,
          showPartialRows: false,
          showMetricsAtAllLevels: false,
          showTotal: false,
          totalFunc: 'sum',
        },
        aggs: [
          {
            id: '1',
            enabled: true,
            type: 'count',
            schema: 'metric',
            params: {},
          },
          {
            id: '2',
            enabled: true,
            type: 'terms',
            schema: 'bucket',
            params: {
              field: 'question.keyword',
              size: 20,
              order: 'desc',
              orderBy: '1',
              customLabel: 'Question',
            },
          },
          {
            id: '3',
            enabled: true,
            type: 'terms',
            schema: 'bucket',
            params: {
              field: 'category',
              size: 1,
              order: 'desc',
              orderBy: '1',
              customLabel: 'Category',
            },
          },
          {
            id: '4',
            enabled: true,
            type: 'terms',
            schema: 'bucket',
            params: {
              field: 'quality_label',
              size: 1,
              order: 'desc',
              orderBy: '1',
              customLabel: 'Quality',
            },
          },
        ],
      }),
      uiStateJSON: '{}',
      description: 'Table of questions that need improvement with details',
      kibanaSavedObjectMeta: {
        searchSourceJSON: JSON.stringify({
          index: 'rag_analytics',
          query: { query: 'needs_improvement: true', language: 'kuery' },
          filter: [],
        }),
      },
    },
  },
]

// Main Dashboard
const DASHBOARD = {
  id: 'rag-analytics-dashboard',
  type: 'dashboard',
  attributes: {
    title: 'RAG Analytics Dashboard',
    description: 'Monitor and analyze RAG system performance',
    panelsJSON: JSON.stringify([
      { panelIndex: '1', gridData: { x: 0, y: 0, w: 24, h: 8 }, panelRefName: 'panel_0' },
      { panelIndex: '2', gridData: { x: 24, y: 0, w: 24, h: 8 }, panelRefName: 'panel_1' },
      { panelIndex: '3', gridData: { x: 0, y: 8, w: 24, h: 8 }, panelRefName: 'panel_2' },
      { panelIndex: '4', gridData: { x: 24, y: 8, w: 24, h: 8 }, panelRefName: 'panel_3' },
      { panelIndex: '5', gridData: { x: 0, y: 16, w: 16, h: 6 }, panelRefName: 'panel_4' },
      { panelIndex: '6', gridData: { x: 16, y: 16, w: 16, h: 6 }, panelRefName: 'panel_5' },
      { panelIndex: '7', gridData: { x: 32, y: 16, w: 16, h: 6 }, panelRefName: 'panel_6' },
      { panelIndex: '8', gridData: { x: 0, y: 22, w: 48, h: 10 }, panelRefName: 'panel_7' },
    ]),
    optionsJSON: '{"hidePanelTitles":false,"useMargins":true}',
    timeRestore: false,
    kibanaSavedObjectMeta: {
      searchSourceJSON: '{"query":{"query":"","language":"kuery"},"filter":[]}',
    },
  },
  references: [
    { name: 'panel_0', type: 'visualization', id: 'rag-quality-pie' },
    { name: 'panel_1', type: 'visualization', id: 'rag-categories-bar' },
    { name: 'panel_2', type: 'visualization', id: 'rag-latency-line' },
    { name: 'panel_3', type: 'visualization', id: 'rag-quality-timeline' },
    { name: 'panel_4', type: 'visualization', id: 'rag-needs-improvement' },
    { name: 'panel_5', type: 'visualization', id: 'rag-question-types' },
    { name: 'panel_6', type: 'visualization', id: 'rag-complexity-quality' },
    { name: 'panel_7', type: 'visualization', id: 'rag-improvement-table' },
  ],
}

async function createIndex() {
  console.log('Creating RAG Analytics index...')
  
  try {
    const exists = await client.indices.exists({ index: RAG_ANALYTICS_INDEX })
    
    if (exists.body) {
      console.log(`Index ${RAG_ANALYTICS_INDEX} already exists`)
      return
    }
    
    await client.indices.create({
      index: RAG_ANALYTICS_INDEX,
      body: RAG_ANALYTICS_SCHEMA,
    })
    
    console.log(`✓ Created index: ${RAG_ANALYTICS_INDEX}`)
  } catch (error) {
    console.error('Error creating index:', error)
  }
}

async function createIndexPattern() {
  console.log('Creating index pattern in Dashboards...')
  
  try {
    const response = await fetch(`${DASHBOARDS_URL}/api/saved_objects/index-pattern/rag_analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'osd-xsrf': 'true',
      },
      body: JSON.stringify(INDEX_PATTERN),
    })
    
    if (response.ok) {
      console.log('✓ Created index pattern: rag_analytics')
    } else if (response.status === 409) {
      console.log('Index pattern already exists')
    } else {
      console.log(`Index pattern creation status: ${response.status}`)
    }
  } catch (error) {
    console.error('Error creating index pattern:', error)
    console.log('Note: Dashboards may not be running. Start it and run this script again.')
  }
}

async function createVisualizations() {
  console.log('Creating visualizations...')
  
  for (const viz of VISUALIZATIONS) {
    try {
      const response = await fetch(`${DASHBOARDS_URL}/api/saved_objects/visualization/${viz.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'osd-xsrf': 'true',
        },
        body: JSON.stringify({ attributes: viz.attributes }),
      })
      
      if (response.ok) {
        console.log(`✓ Created visualization: ${viz.attributes.title}`)
      } else if (response.status === 409) {
        console.log(`Visualization already exists: ${viz.attributes.title}`)
      } else {
        console.log(`Visualization ${viz.attributes.title} status: ${response.status}`)
      }
    } catch (error) {
      console.error(`Error creating visualization ${viz.id}:`, error)
    }
  }
}

async function createDashboard() {
  console.log('Creating dashboard...')
  
  try {
    const response = await fetch(`${DASHBOARDS_URL}/api/saved_objects/dashboard/${DASHBOARD.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'osd-xsrf': 'true',
      },
      body: JSON.stringify({
        attributes: DASHBOARD.attributes,
        references: DASHBOARD.references,
      }),
    })
    
    if (response.ok) {
      console.log(`✓ Created dashboard: ${DASHBOARD.attributes.title}`)
      console.log(`\n🎉 Dashboard available at: ${DASHBOARDS_URL}/app/dashboards#/view/${DASHBOARD.id}`)
    } else if (response.status === 409) {
      console.log('Dashboard already exists')
      console.log(`View at: ${DASHBOARDS_URL}/app/dashboards#/view/${DASHBOARD.id}`)
    } else {
      console.log(`Dashboard creation status: ${response.status}`)
    }
  } catch (error) {
    console.error('Error creating dashboard:', error)
  }
}

async function addSampleData() {
  console.log('Adding sample data for testing...')
  
  const sampleEntries = [
    {
      id: 'sample-1',
      session_id: 'demo-session',
      question: 'What is the daily ATM limit in Japan?',
      answer: 'The daily ATM withdrawal limit in Japan is $500 USD. Per-transaction limit is ¥50,000. Use 7-Eleven or JP Bank ATMs for best compatibility.',
      timestamp: new Date().toISOString(),
      latency_ms: 1250,
      quality_score: 0.92,
      quality_label: 'good',
      needs_improvement: false,
      category: 'ATM Services',
      subcategory: 'International',
      topics: ['ATM', 'Japan', 'limits'],
      question_type: 'factual',
      question_complexity: 'simple',
      answer_length: 145,
      has_citations: true,
      confidence_expressed: true,
    },
    {
      id: 'sample-2',
      session_id: 'demo-session',
      question: 'How do I report a stolen card?',
      answer: 'To report a stolen card: 1) Lock your card instantly in the NovaPay app under Cards → My Cards → Lock Card. 2) Call our 24/7 hotline at 1-800-NOVAPAY. Card deactivation happens within 60 seconds of reporting.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      latency_ms: 1800,
      quality_score: 0.88,
      quality_label: 'good',
      needs_improvement: false,
      category: 'Card Services',
      subcategory: 'Lost/Stolen',
      topics: ['stolen card', 'report', 'security'],
      question_type: 'procedural',
      question_complexity: 'simple',
      answer_length: 220,
      has_citations: true,
      confidence_expressed: true,
    },
    {
      id: 'sample-3',
      session_id: 'demo-session',
      question: 'What are the cryptocurrency trading limits?',
      answer: 'I could not find specific information about cryptocurrency trading in the provided documents.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      latency_ms: 980,
      quality_score: 0.25,
      quality_label: 'poor',
      needs_improvement: true,
      improvement_reason: 'Question about cryptocurrency not covered in NovaPay knowledge base',
      category: 'General',
      topics: ['cryptocurrency', 'trading'],
      question_type: 'factual',
      question_complexity: 'simple',
      answer_length: 92,
      has_citations: false,
      confidence_expressed: true,
    },
    {
      id: 'sample-4',
      session_id: 'demo-session',
      question: 'How long does international wire transfer take?',
      answer: 'International wire transfers via SWIFT take 1-5 business days depending on the destination. The fee is $45 for outgoing and $15 for incoming transfers.',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      latency_ms: 1450,
      quality_score: 0.85,
      quality_label: 'good',
      needs_improvement: false,
      category: 'Transfers',
      subcategory: 'Wire',
      topics: ['wire transfer', 'international', 'SWIFT'],
      question_type: 'factual',
      question_complexity: 'simple',
      answer_length: 165,
      has_citations: true,
      confidence_expressed: true,
    },
    {
      id: 'sample-5',
      session_id: 'demo-session',
      question: 'What happens if I exceed my overdraft limit?',
      answer: 'The information about exceeding overdraft limits is unclear in the current documents.',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      latency_ms: 890,
      quality_score: 0.40,
      quality_label: 'fair',
      needs_improvement: true,
      improvement_reason: 'Answer is vague - needs more specific information about overdraft consequences',
      category: 'Account Services',
      subcategory: 'Overdraft',
      topics: ['overdraft', 'limits', 'fees'],
      question_type: 'analytical',
      question_complexity: 'moderate',
      answer_length: 85,
      has_citations: false,
      confidence_expressed: true,
    },
  ]
  
  for (const entry of sampleEntries) {
    try {
      await client.index({
        index: RAG_ANALYTICS_INDEX,
        id: entry.id,
        body: entry,
        refresh: true,
      })
      console.log(`✓ Added sample: ${entry.id}`)
    } catch (error) {
      console.error(`Error adding sample ${entry.id}:`, error)
    }
  }
}

async function main() {
  console.log('='.repeat(50))
  console.log('RAG Analytics OpenSearch Setup')
  console.log('='.repeat(50))
  console.log(`OpenSearch: ${OPENSEARCH_URL}`)
  console.log(`Dashboards: ${DASHBOARDS_URL}`)
  console.log('')
  
  // Test connection
  try {
    const info = await client.info()
    console.log(`✓ Connected to OpenSearch ${info.body.version.number}\n`)
  } catch (error) {
    console.error('✗ Failed to connect to OpenSearch')
    console.error('Make sure OpenSearch is running: docker-compose up -d')
    process.exit(1)
  }
  
  await createIndex()
  await addSampleData()
  await createIndexPattern()
  await createVisualizations()
  await createDashboard()
  
  console.log('\n' + '='.repeat(50))
  console.log('Setup complete!')
  console.log('='.repeat(50))
  console.log('\nNext steps:')
  console.log('1. Start the UI: npm run dev')
  console.log('2. Open http://localhost:3000 to chat')
  console.log(`3. View analytics: ${DASHBOARDS_URL}/app/dashboards`)
}

main().catch(console.error)

