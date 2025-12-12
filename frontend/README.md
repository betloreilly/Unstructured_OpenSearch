# RAG Analytics UI

This is the web interface for your smart Q&A system. Users ask questions in a chat window, and behind the scenes, every conversation gets logged and analyzed automatically. A separate AI reviews each answer, scores its quality, and categorizes the question. Over time, you build up valuable insights about what questions people are asking and how well your system is answering them.

## Features

- **Chat Interface**: Beautiful, modern UI to interact with your RAG system
- **Automatic Logging**: Every Q&A interaction is logged to OpenSearch
- **LLM Quality Analysis**: Automatic quality scoring and categorization using GPT-4o-mini
- **Real-time Analytics**: View quality metrics, categories, and trends
- **OpenSearch Dashboards**: Pre-configured visualizations for deep analysis

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js UI    │────▶│   Langflow   │────▶│  OpenSearch │
│   (port 3000)   │     │  (port 7860) │     │ (port 9200) │
└────────┬────────┘     └──────────────┘     └─────────────┘
         │                                          │
         │ Log Q&A                                  │
         │ + LLM Analysis                           │
         └──────────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │ OpenSearch Dashboards│
                    │    (port 5601)       │
                    └─────────────────────┘
```

## Data Logged

Each interaction logs:

| Field | Description |
|-------|-------------|
| `question` | User's question |
| `answer` | RAG system response |
| `timestamp` | When the interaction occurred |
| `latency_ms` | Response time in milliseconds |
| `quality_score` | 0-1 score from LLM analysis |
| `quality_label` | good / fair / poor |
| `needs_improvement` | Boolean flag for review |
| `improvement_reason` | Why improvement is needed |
| `category` | Question category (Technical, Research, etc.) |
| `question_type` | factual, analytical, comparative, etc. |
| `question_complexity` | simple, moderate, complex |
| `topics` | Extracted topics from the question |

## Quick Start

### 1. Prerequisites

- Node.js 18+
- Docker (for OpenSearch)
- Langflow running with your RAG flow
- OpenAI API key

### 2. Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment file
cp env-example.txt .env.local

# Edit .env.local with your values:
# - OPENAI_API_KEY (required for analysis)
# - LANGFLOW_FLOW_ID (your flow's ID)
```

### 3. Start Services

```bash
# Start OpenSearch (from project root)
docker-compose up -d

# Setup OpenSearch indices and dashboards
npm run setup-opensearch

# Start the UI
npm run dev
```

### 4. Access

- **Chat UI**: http://localhost:3000
- **OpenSearch Dashboards**: http://localhost:5601

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for quality analysis | Required |
| `LANGFLOW_URL` | Langflow API URL | `http://localhost:7860` |
| `LANGFLOW_FLOW_ID` | Your Langflow flow ID | Required |
| `OPENSEARCH_URL` | OpenSearch URL | `http://localhost:9200` |
| `OPENSEARCH_DASHBOARDS_URL` | Dashboards URL | `http://localhost:5601` |

## API Endpoints

### POST /api/chat
Send a message to the RAG system.

```json
{
  "message": "What is the BLEU score achieved?",
  "session_id": "optional-session-id"
}
```

Response:
```json
{
  "answer": "The model achieved a BLEU score of...",
  "session_id": "abc-123",
  "latency_ms": 1250,
  "interaction_id": "xyz-456"
}
```

### GET /api/analytics/stats
Get aggregate statistics.

```json
{
  "total_queries": 150,
  "avg_latency": 1340,
  "quality_distribution": {
    "good": 120,
    "fair": 25,
    "poor": 5
  },
  "top_categories": [
    { "name": "Technical", "count": 80 },
    { "name": "Research", "count": 45 }
  ]
}
```

### GET /api/analytics/needs-improvement
Get questions flagged for improvement.

```json
{
  "questions": [
    {
      "question": "What are the limitations?",
      "improvement_reason": "Information not in knowledge base",
      "quality_score": 0.35
    }
  ]
}
```

## OpenSearch Dashboards

The setup script creates these visualizations:

1. **Answer Quality Distribution** - Pie chart of good/fair/poor ratings
2. **Questions by Category** - Bar chart of question categories
3. **Response Latency Over Time** - Line chart of performance
4. **Quality Score Trend** - Track quality improvements
5. **Questions Needing Improvement** - Count of flagged questions
6. **Question Types** - Distribution of question types
7. **Quality by Complexity** - How quality varies with complexity

### Creating Custom Dashboards

1. Go to http://localhost:5601
2. Navigate to **Dashboard** → **Create new**
3. Use the `rag_analytics` index pattern
4. Add visualizations using these useful fields:
   - `quality_score` - Numeric quality rating
   - `quality_label` - Categorical quality
   - `category` - Question categories
   - `needs_improvement` - Flag for review
   - `latency_ms` - Performance metric
   - `question_type` - Type of question
   - `topics` - Question topics

## Improving Your RAG

The analytics help you make your Q&A system better over time. Start by looking at answers rated "poor" - these are conversations where users probably didn't get what they needed. Pay attention to questions flagged as "needs improvement" since these are specific opportunities to add or update documentation.

1. **Low-quality answers**: Filter by `quality_label: poor`
2. **Missing knowledge**: Look at `needs_improvement: true` entries
3. **Common categories**: Focus on frequently asked topics
4. **Complex questions**: May need better document chunking
5. **High latency**: Consider caching or index optimization

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Re-setup OpenSearch indices
npm run setup-opensearch
```

## Troubleshooting

### "Failed to connect to OpenSearch"
- Ensure Docker is running: `docker ps`
- Start services: `docker-compose up -d`

### "Langflow API error"
- Verify Langflow is running on port 7860
- Check `LANGFLOW_FLOW_ID` in `.env.local`

### "LLM analysis failed"
- Verify `OPENAI_API_KEY` is set correctly
- Check API key has sufficient credits

### Dashboard shows no data
- Send some chat messages first
- Run `npm run setup-opensearch` to add sample data
- Refresh the dashboard and adjust time range

