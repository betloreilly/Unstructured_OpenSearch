# OpenSearch Dashboards Guide

[← Back to Main README](../README.md) | [Next: RAG Analytics Guide →](RAG-Analytics-Architecture.md)

---

This guide walks you through creating visualizations and dashboards to monitor your Q&A system. OpenSearch Dashboards is a powerful tool for exploring your data, and we'll go step by step through the key concepts.

![Open Search Dashboard](/data/opensearch.png)

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding the Data](#understanding-the-data)
3. [Creating Index Patterns](#creating-index-patterns)
4. [Building Visualizations](#building-visualizations)
5. [Creating Dashboards](#creating-dashboards)
6. [Useful Queries](#useful-queries)
7. [Pre-built Dashboard](#pre-built-dashboard)

---

## Getting Started

### Access OpenSearch Dashboards

1. Ensure OpenSearch is running:
   ```bash
   docker-compose up -d
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5601
   ```

3. You should see the OpenSearch Dashboards home page.

### Quick Setup (Automated)

If you haven't already, run the setup script to create indices and pre-built visualizations:

```bash
cd frontend
npm run setup-opensearch
```

This creates:
- `rag_analytics` index with proper mappings
- Index pattern for Dashboards
- 7 pre-built visualizations
- A ready-to-use dashboard

---

## Understanding the Data

### The `rag_analytics` Index Schema

Every chat interaction logs the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | keyword | Unique interaction ID |
| `session_id` | keyword | User session ID |
| `question` | text | User's question |
| `answer` | text | RAG system response |
| `timestamp` | date | When interaction occurred |
| `latency_ms` | integer | Response time in milliseconds |
| `quality_score` | float | 0-1 quality rating from LLM |
| `quality_label` | keyword | good / fair / poor |
| `needs_improvement` | boolean | Flagged for review |
| `improvement_reason` | text | Why improvement needed |
| `category` | keyword | Question category |
| `subcategory` | keyword | More specific category |
| `topics` | keyword | Extracted topics (array) |
| `question_type` | keyword | factual / analytical / comparative / etc. |
| `question_complexity` | keyword | simple / moderate / complex |
| `answer_length` | integer | Character count of answer |
| `has_citations` | boolean | Answer references sources |
| `confidence_expressed` | boolean | Appropriate uncertainty shown |

---

## Creating Index Patterns

Index patterns tell Dashboards which indices to query.

### Step 1: Navigate to Index Patterns

1. Click the **hamburger menu** (top left)
2. Go to **Management** → **Dashboards Management**
3. Click **Index patterns**

### Step 2: Create Pattern

1. Click **Create index pattern**
2. Enter pattern: `rag_analytics`
3. Click **Next step**
4. Select **timestamp** as the Time field
5. Click **Create index pattern**

### Verify Fields

After creation, you should see all fields listed with their types.

> **Note:** OpenSearch Dashboards displays `keyword` fields as "string" in the Type column. This is normal! The key indicator is the **Aggregatable** column - if it has a green dot (●), the field can be used in visualizations (bar charts, pie charts, etc.).

Key fields to verify:

| Field | Type (shown as) | Aggregatable | Notes |
|-------|-----------------|--------------|-------|
| `quality_score` | number | ● | Can use for averages |
| `quality_label` | string | ● | Actually keyword - use for pie charts |
| `category` | string | ● | Actually keyword - use for bar charts |
| `timestamp` | date | ● | Time field for trends |
| `question` | string | ○ | Text field - searchable but not aggregatable |

**String + Aggregatable (●)** = keyword field (good for charts)  
**String + Not Aggregatable (○)** = text field (good for search only)

---

## Building Visualizations

Navigate to **Menu** → **Visualize** → **Create visualization**

### Visualization 1: Quality Distribution (Pie Chart)

**Purpose:** See the breakdown of good/fair/poor answers

1. Select **Pie**
2. Choose `rag_analytics` index
3. **Metrics:**
   - Slice size: Count
4. **Buckets:**
   - Split slices → Terms
   - Field: `quality_label`
   - Size: 10
5. Click **Update**
6. **Save** as "Answer Quality Distribution"

### Visualization 2: Questions by Category (Bar Chart)

**Purpose:** See which topics users ask about most

1. Select **Vertical Bar**
2. Choose `rag_analytics` index
3. **Metrics:**
   - Y-axis: Count
4. **Buckets:**
   - X-axis → Terms
   - Field: `category`
   - Size: 15
   - Order by: Count descending
5. Click **Update**
6. **Save** as "Questions by Category"

### Visualization 3: Response Latency Over Time (Line Chart)

**Purpose:** Monitor performance trends

1. Select **Line**
2. Choose `rag_analytics` index
3. **Metrics:**
   - Y-axis: Average → `latency_ms`
4. **Buckets:**
   - X-axis → Date Histogram
   - Field: `timestamp`
   - Interval: Auto
5. Click **Update**
6. **Save** as "Response Latency Over Time"

### Visualization 4: Quality Score Trend (Area Chart)

**Purpose:** Track quality improvements over time

1. Select **Area**
2. Choose `rag_analytics` index
3. **Metrics:**
   - Y-axis: Average → `quality_score`
4. **Buckets:**
   - X-axis → Date Histogram
   - Field: `timestamp`
   - Interval: Auto
5. Click **Update**
6. **Save** as "Quality Score Trend"

### Visualization 5: Questions Needing Improvement (Metric)

**Purpose:** Quick count of flagged questions

1. Select **Metric**
2. Choose `rag_analytics` index
3. **Add filter** (top bar):
   - Field: `needs_improvement`
   - Operator: is
   - Value: true
4. **Metrics:**
   - Metric: Count
5. Click **Update**
6. **Save** as "Questions Needing Improvement"

### Visualization 6: Question Types (Donut)

**Purpose:** Understand what kinds of questions users ask

1. Select **Pie**
2. Choose `rag_analytics` index
3. **Options:** Check "Donut"
4. **Metrics:**
   - Slice size: Count
5. **Buckets:**
   - Split slices → Terms
   - Field: `question_type`
   - Size: 10
6. Click **Update**
7. **Save** as "Question Types Distribution"

### Visualization 7: Quality by Complexity (Horizontal Bar)

**Purpose:** See if complex questions have lower quality

1. Select **Horizontal Bar**
2. Choose `rag_analytics` index
3. **Metrics:**
   - Y-axis: Average → `quality_score`
4. **Buckets:**
   - X-axis → Terms
   - Field: `question_complexity`
   - Order by: Custom Metric (avg quality_score)
5. Click **Update**
6. **Save** as "Quality by Complexity"

### Visualization 8: Top Topics (Tag Cloud)

**Purpose:** Visual overview of common topics

1. Select **Tag Cloud**
2. Choose `rag_analytics` index
3. **Metrics:**
   - Tag size: Count
4. **Buckets:**
   - Tags → Terms
   - Field: `topics`
   - Size: 50
5. Click **Update**
6. **Save** as "Top Topics"

### Visualization 9: Latency Histogram

**Purpose:** See distribution of response times

1. Select **Vertical Bar**
2. Choose `rag_analytics` index
3. **Metrics:**
   - Y-axis: Count
4. **Buckets:**
   - X-axis → Histogram
   - Field: `latency_ms`
   - Interval: 500
5. Click **Update**
6. **Save** as "Latency Distribution"

### Visualization 10: Data Table - Poor Quality Questions

**Purpose:** List questions that need attention

1. Select **Data Table**
2. Choose `rag_analytics` index
3. **Add filter:** `quality_label` is `poor`
4. **Buckets:**
   - Split rows → Terms → `question` (Size: 20)
5. Click **Update**
6. **Save** as "Poor Quality Questions"

> **Tip:** For more detail, use **Discover** instead - you can see full question text and all fields.

### Visualization 11: Questions Needing Improvement (Data Table)

**Purpose:** See questions flagged for improvement in a table format

1. Select **Data Table**
2. Choose `rag_analytics` index
3. **Add filter:** `needs_improvement` is `true`
4. **Metrics:**
   - Metric: Count
5. **Buckets:**
   - Click **Add** → **Split rows**
   - Aggregation: **Terms**
   - Field: `question`
   - Size: 20
   - Custom Label: "Question"
6. **Add another column:**
   - Click **Add** → **Split rows**
   - Aggregation: **Terms**
   - Field: `category`
   - Size: 1
   - Custom Label: "Category"
7. Click **Update**
8. **Save** as "Questions Needing Improvement"

---

## Creating Dashboards

### Step 1: Create New Dashboard

1. Go to **Menu** → **Dashboard**
2. Click **Create new dashboard**

### Step 2: Add Visualizations

1. Click **Add** (top toolbar)
2. Select visualizations to add:
   - Answer Quality Distribution
   - Questions by Category
   - Response Latency Over Time
   - Quality Score Trend
   - Questions Needing Improvement
   - Question Types Distribution
   - Quality by Complexity
   - Top Topics

### Step 3: Arrange Layout

Drag and resize panels to create a logical layout.

### Step 4: Save Dashboard

1. Click **Save** (top toolbar)
2. Name: "RAG Analytics Dashboard"
3. Description: "Monitor RAG system quality and performance"
4. Click **Save**

### Step 5: Set Time Range

1. Click the time picker (top right)
2. Select appropriate range:
   - "Last 24 hours" for recent activity
   - "Last 7 days" for weekly view
   - "Last 30 days" for monthly trends

---

## Useful Queries

Access **Menu** → **Dev Tools** to run these queries.

### Get All Poor Quality Answers

```json
GET rag_analytics/_search
{
  "query": {
    "bool": {
      "should": [
        { "term": { "quality_label": "poor" } },
        { "term": { "needs_improvement": true } }
      ]
    }
  },
  "sort": [{ "timestamp": "desc" }],
  "_source": ["question", "answer", "quality_score", "improvement_reason", "timestamp"]
}
```

### Average Quality by Category

```json
GET rag_analytics/_search
{
  "size": 0,
  "aggs": {
    "by_category": {
      "terms": { "field": "category", "size": 20 },
      "aggs": {
        "avg_quality": { "avg": { "field": "quality_score" } },
        "count": { "value_count": { "field": "id" } }
      }
    }
  }
}
```

### Slowest Responses

```json
GET rag_analytics/_search
{
  "size": 10,
  "sort": [{ "latency_ms": "desc" }],
  "_source": ["question", "latency_ms", "timestamp", "category"]
}
```

### Questions Without Good Answers (by Topic)

```json
GET rag_analytics/_search
{
  "size": 0,
  "query": {
    "range": { "quality_score": { "lt": 0.5 } }
  },
  "aggs": {
    "problem_topics": {
      "terms": { "field": "topics", "size": 20 }
    }
  }
}
```

### Daily Statistics

```json
GET rag_analytics/_search
{
  "size": 0,
  "aggs": {
    "daily": {
      "date_histogram": {
        "field": "timestamp",
        "calendar_interval": "day"
      },
      "aggs": {
        "total": { "value_count": { "field": "id" } },
        "avg_quality": { "avg": { "field": "quality_score" } },
        "avg_latency": { "avg": { "field": "latency_ms" } },
        "poor_count": {
          "filter": { "term": { "quality_label": "poor" } }
        }
      }
    }
  }
}
```

### Search for Specific Questions

```json
GET rag_analytics/_search
{
  "query": {
    "match": {
      "question": "ATM limit"
    }
  },
  "_source": ["question", "answer", "quality_score", "category"]
}
```

### Complex Questions with Low Quality

```json
GET rag_analytics/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "question_complexity": "complex" } },
        { "range": { "quality_score": { "lt": 0.6 } } }
      ]
    }
  },
  "_source": ["question", "quality_score", "improvement_reason"]
}
```

---

## Pre-built Dashboard

Access the RAG Analytics Dashboard at:

```
http://localhost:5601/goto/ae609fc1332e4912988652588405074b
```

Or navigate to **Menu** → **Dashboards** → **RAG Analytics Dashboard**

### Included Visualizations

| Visualization | Type | Shows |
|---------------|------|-------|
| Answer Quality Distribution | Pie | good/fair/poor breakdown |
| Questions by Category | Bar | topic distribution |
| Response Latency Over Time | Line | performance trends |
| Quality Score Trend | Line | quality over time |
| Questions Needing Improvement | Metric | count of flagged items |
| Question Types | Pie | factual/analytical/etc. |
| Quality by Complexity | Bar | simple vs complex quality |
| Questions Needing Improvement - Details | Table | list of questions needing improvement |

---

## Tips for RAG Improvement

### Use the Dashboard to Identify:

1. **Knowledge Gaps**
   - Filter by `needs_improvement: true`
   - Look at `improvement_reason` field
   - These topics need better documents

2. **Common Questions**
   - Check "Questions by Category"
   - Prioritize improving top categories

3. **Performance Issues**
   - Monitor latency trends
   - Investigate spikes in response time

4. **Quality Trends**
   - Track quality score over time
   - See if changes improve quality

### Recommended Workflow

1. **Daily:** Check "Questions Needing Improvement" count
2. **Weekly:** Review poor quality questions in detail
3. **Monthly:** Analyze category trends and latency patterns

---

## Next Steps

1. **Customize visualizations** for your specific needs
2. **Set up alerts** for quality drops (requires additional plugins)
3. **Export dashboards** for sharing: **Dashboard** → **Share** → **Export**
4. **Create saved searches** for common queries

---

*This guide is for the RAG Analytics system built with Next.js, Langflow, and OpenSearch.*

---

[← Back to Main README](../README.md) | [Next: RAG Analytics Guide →](RAG-Analytics-Architecture.md)

