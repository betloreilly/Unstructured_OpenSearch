# RAG Analytics Guide

[← Back to Main README](../README.md) | [← Previous: OpenSearch Dashboards Guide](OpenSearch-Dashboards-Guide.md)

---

This platform helps you build a smart Q&A system and understand how well it's working. When someone asks a question, the system finds relevant information from your documents and generates an answer. But here's what makes it special: every conversation gets analyzed automatically. The system scores how good each answer was, figures out what category the question belongs to, and flags any responses that might need improvement. Over time, you can see exactly where to focus your efforts to make the system better.

---

## Overview

- **Chat Interface** - User-friendly UI for interacting with the RAG system
- **Automatic Logging** - Every Q&A interaction is captured with metadata
- **LLM Quality Analysis** - Automatic quality scoring and categorization
- **Analytics Dashboard** - Monitor performance and identify improvement areas
- **OpenSearch Integration** - Store, search, and visualize all interactions

---

## Application Screenshots

### Main Chat Interface

![NovaPay Support Chat](/data/nova.png)

The main chat interface allows users to:
- Ask questions in natural language
- Get AI-powered responses from the RAG system
- See response metadata (latency, quality score, category)
- Access admin features via the "Admin" button

### Analytics Dashboard

![RAG Analytics Dashboard](/data/monitor.png)

The analytics dashboard provides administrators with:
- Quality distribution metrics (good/fair/poor)
- Top question categories
- Questions needing improvement
- Embedded OpenSearch visualizations
- Recommendations for RAG improvements

---

## Reference Architecture



---

## Data Flow

### 1. User Asks a Question

```
User → Next.js UI → /api/chat → Langflow RAG Pipeline
```

1. User types question in the chat interface
2. Frontend sends request to `/api/chat` endpoint
3. API forwards question to Langflow with session ID

### 2. RAG Processing

```
Langflow → OpenSearch (hybrid_demo) → LLM → Response
```

1. Langflow receives the question
2. Hybrid search retrieves relevant document chunks
3. Retrieved context is passed to LLM
4. LLM generates contextual response

### 3. Response & Logging

```
Response → User + Background Analysis → OpenSearch (rag_analytics)
```

1. Response is returned to user immediately
2. In background, LLM analyzes quality and category
3. Full interaction is logged to `rag_analytics` index

### 4. Analytics Access

```
Admin → Login → Analytics Dashboard → OpenSearch Dashboards
```

1. Admin logs in with credentials
2. Views native UI stats and recommendations
3. Explores embedded OpenSearch visualizations

---

## Quality Analysis Pipeline

After every conversation, a separate AI (GPT-4o-mini) reviews the question and answer to evaluate how good the response was. This happens in the background so users get their answer immediately. The analysis produces a quality score, categorizes the question, and flags anything that needs improvement.

```
┌─────────────┐     ┌─────────────────────────────────────────┐
│  Question   │────▶│         LLM Quality Analysis            │
│  + Answer   │     │                                         │
└─────────────┘     │  Outputs:                               │
                    │  • quality_score (0-1)                  │
                    │  • quality_label (good/fair/poor)       │
                    │  • needs_improvement (boolean)          │
                    │  • improvement_reason (text)            │
                    │  • category (Technical, Business, etc.) │
                    │  • question_type (factual, analytical)  │
                    │  • question_complexity (simple/complex) │
                    └─────────────────────────────────────────┘
```

### Quality Criteria

| Label | Score Range | Criteria |
|-------|-------------|----------|
| Good | 0.7 - 1.0 | Direct answer, accurate, well-structured |
| Fair | 0.4 - 0.69 | Partial answer, vague, missing details |
| Poor | 0.0 - 0.39 | Doesn't answer, incorrect, "I don't know" |

---

## Authentication 

**Credentials:** `admin` / `admin`

---

## Ports & URLs

| Service | Port | URL |
|---------|------|-----|
| Next.js UI | 3000 | http://localhost:3000 |
| Langflow | 7860 | http://localhost:7860 |
| OpenSearch | 9200 | http://localhost:9200 |
| OpenSearch Dashboards | 5601 | http://localhost:5601 |

---

## Key Features

### For Users
- Natural language chat interface
- Real-time responses
- Response quality indicators
- Category tags for context

### For Administrators
- Protected analytics dashboard
- Quality distribution metrics
- Questions needing improvement
- Category analysis
- Latency monitoring
- Embedded OpenSearch dashboards
- Actionable recommendations

### For RAG Improvement
- Identify knowledge gaps
- Track quality trends over time
- Categorize question patterns
- Monitor performance metrics

---

## Quick Start

```bash
# 1. Start OpenSearch
docker-compose up -d

# 2. Start Langflow
langflow run

# 3. Setup analytics indices
cd frontend
npm install
cp env-example.txt .env.local
# Edit .env.local with your API keys
npm run setup-opensearch

# 4. Start the UI
npm run dev

# 5. Access
# Chat: http://localhost:3000
# Analytics: http://localhost:3000/analytics (login: admin/admin)
# Dashboards: http://localhost:5601
```

---

*This architecture enables continuous monitoring and improvement of RAG systems through automated quality analysis and actionable insights.*

---

[← Back to Main README](../README.md) | [← Previous: OpenSearch Dashboards Guide](OpenSearch-Dashboards-Guide.md)

