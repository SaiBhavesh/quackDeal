# 🦆 QuackDeal — AI-Powered Sales Deal Intelligence

> *"We built the glue, the logic, and the UX. The APIs provided capabilities — we provided the product."*

Built at **Stevens QuackHacks 2026** — a student-run hackathon at Stevens Institute of Technology.

Deployment Link: https://quack-deal-app.vercel.app/login

---

## 📌 Table of Contents

- [Inspiration](#-inspiration)
- [What is QuackDeal?](#-what-is-quackdeal)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Architecture Overview](#-architecture-overview)
- [API Reference](#-api-reference)
- [Health Scoring Engine](#-health-scoring-engine)
- [AI Integration](#-ai-integration)
- [Data Schema](#-data-schema)
- [Setup & Installation](#-setup--installation)
- [Environment Variables](#-environment-variables)
- [What We Built vs. External Tools](#-what-we-built-vs-what-external-tools-did)
- [Meaningful Engineering Work](#-meaningful-engineering-work)
- [Screenshots](#-screenshots)
- [Team](#-team)

---

## 💡 Inspiration

Sales is one of the few professions where success is almost entirely determined by human conversation — and yet, most of the tools built to support it completely ignore the conversation itself.

Reps walk out of calls, log a status in a CRM, and move on. The actual words spoken — the hesitation, the budget concern buried in sentence three, the commitment signal that should have triggered an immediate follow-up — vanish into a notes app or simply get forgotten.

We thought that was a strange problem to leave unsolved in 2026, when AI can read a transcript in seconds and tell you exactly what happened.

So we built QuackDeal. The idea was simple: **what if every sales call automatically told you how it went, what you missed, and exactly what to do next?** No manual note-taking. No gut-feel scoring. Just a clean, quantified answer derived from the conversation itself.

We weren't trying to replace the sales rep — we were trying to make sure nothing important ever slipped through the cracks again. 🦆

---

## 🦆 What is QuackDeal?

QuackDeal is a full-stack, AI-powered sales intelligence platform that transforms raw meeting transcripts into structured, actionable deal insights — in seconds.

Sales reps spend hours manually reviewing calls and guessing their next move. QuackDeal eliminates that. Paste a transcript, get a quantified health score, see every objection surfaced automatically, and generate a tailored follow-up email — all in one coherent workflow.

### The end-to-end user flow:

```
Log in with Google
      ↓
Create a Deal (client name, company, value, industry)
      ↓
Paste Meeting Transcript into the 3-step Analysis Wizard
      ↓
Claude AI analyzes the transcript → extracts objections, commitment
signals, sentiment, action items, and a next best action
      ↓
Custom scoring engine produces a 0–100 Health Score
broken down across 4 dimensions
      ↓
View objections + commitment signals in a tabbed panel
      ↓
Generate a personalized follow-up email with one click
      ↓
Monitor all deals on the Analytics dashboard
(industry trends, win rates, average scores across 100 seeded deals)
```

---

## 🛠 Tech Stack

### Frontend

| Tool | Purpose |
|------|---------|
| **React.js** | UI framework and component architecture |
| **Tailwind CSS** | Utility-first styling with shared color tokens |
| **Recharts** | Analytics chart rendering (bar, line, pie) |
| **Axios** | HTTP client for all backend API calls |

### Backend

| Tool | Purpose |
|------|---------|
| **Node.js + Express** | REST API server (port 5001) |
| **Firebase Authentication** | Google OAuth login + protected route middleware |

### Databases & Data

| Tool | Purpose |
|------|---------|
| **Snowflake** | Primary data warehouse — deals, meetings, health scores, objections, follow-ups |
| **Databricks** | Batch analytics pipeline with mock fallback for Community Edition |

### AI

| Tool | Purpose |
|------|---------|
| **Anthropic Claude API** | Transcript analysis, structured JSON extraction, follow-up email generation |

### Hosting

| Environment | Details |
|-------------|---------|
| **Local Dev** | Frontend on port `3000`, Backend on port `5001` |

---

## 📁 Project Structure

```
quackDeal/
│
├── client/                              # React frontend
│   ├── package.json
│   ├── tailwind.config.js               # Shared color tokens
│   ├── postcss.config.js
│   ├── .env.example                     # Firebase config keys template
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js                     # React root entry point
│       ├── index.css                    # Tailwind directives + global styles
│       ├── App.js                       # All routes + Protected route wrapper
│       ├── firebase.js                  # Firebase client init
│       │
│       ├── hooks/
│       │   └── useAuth.js               # Firebase onAuthStateChanged hook
│       │
│       ├── services/
│       │   └── api.js                   # Axios instance + all API call functions
│       │
│       ├── utils/
│       │   └── dealHealth.js            # Score → color/label/currency helpers
│       │
│       ├── components/
│       │   ├── Layout/
│       │   │   └── Navbar.js            # Left sidebar navigation
│       │   └── Dashboard/
│       │       └── StatsCard.js         # Reusable metric card component
│       │
│       └── pages/
│           ├── Login.js                 # Google sign-in screen
│           └── Dashboard.js            # Stats row + deal grid overview
│
└── frontend/                            # Extended frontend components
    └── src/
        ├── components/
        │   └── Deal/
        │       ├── HealthGauge.js       # Custom SVG half-circle animated gauge
        │       ├── DealCard.js          # Deal card with health bar + stage badge
        │       └── ObjectionsList.js    # Tabbed objections/commitments panel
        └── pages/
            ├── NewAnalysis.js           # 3-step wizard: Info → Upload → Results
            ├── DealDetail.js            # Full deal view: meeting history + follow-ups
            └── Analytics.js            # Charts + Databricks pipeline trigger button
```

---

## 🏗 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        User (Browser)                        │
│                     React App — port 3000                    │
│  Login · Dashboard · New Analysis · Deal Detail · Analytics  │
└────────────────────────────┬────────────────────────────────┘
                             │  Axios HTTP + Firebase ID Token
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express Backend — port 5001                 │
│                                                              │
│  GET  /api/deals              → Fetch deals from Snowflake   │
│  GET  /api/deals/:id          → Single deal detail           │
│  POST /api/analyze            → Claude AI → Snowflake write  │
│  POST /api/analyze/followup   → Claude email generation      │
│  GET  /api/analytics/summary  → Aggregated analytics data    │
└──────┬──────────────────────────────────────┬───────────────┘
       │                                      │
       ▼                                      ▼
┌─────────────┐                    ┌──────────────────────┐
│  Snowflake  │                    │   Anthropic Claude   │
│  Data       │                    │   API                │
│  Warehouse  │                    │                      │
│  6 Tables   │                    │  Transcript analysis │
│  SQL Queries│                    │  JSON extraction     │
└─────────────┘                    │  Email generation    │
       │                           └──────────────────────┘
       ▼
┌─────────────┐
│  Databricks │
│  Analytics  │
│  Pipeline   │
│  (+ mock    │
│  fallback)  │
└─────────────┘
```

---

## 📡 API Reference

### `GET /api/deals`
Returns all deals for the authenticated user from Snowflake.

**Response:**
```json
[
  {
    "DEAL_ID": "deal_001",
    "CLIENT_NAME": "Sarah Chen",
    "CLIENT_COMPANY": "TechCorp Inc",
    "DEAL_VALUE": 45000,
    "INDUSTRY": "Technology",
    "STAGE": "proposal",
    "HEALTH_SCORE": 72,
    "OUTCOME": "active",
    "MEETING_COUNT": 3
  }
]
```

---

### `GET /api/deals/:id`
Returns full detail for a single deal.

**Response:**
```json
{
  "DEAL_ID": "deal_001",
  "CLIENT_NAME": "Sarah Chen",
  "CLIENT_COMPANY": "TechCorp Inc",
  "DEAL_VALUE": 45000,
  "INDUSTRY": "Technology",
  "STAGE": "proposal",
  "HEALTH_SCORE": 72,
  "OUTCOME": "active",
  "MEETING_COUNT": 3
}
```

---

### `POST /api/analyze`
Sends a meeting transcript through Claude AI, runs the health scoring engine, and writes results to Snowflake.

**Request body:**
```json
{
  "dealId": "deal_001",
  "transcript": "Full meeting transcript text here..."
}
```

**Response:**
```json
{
  "meetingId": "mtg_001",
  "dealId": "deal_001",
  "healthScore": 72,
  "healthLabel": "Warm",
  "geminiAnalysis": {
    "summary": "Productive call with strong interest shown. Budget concerns raised but timeline commitment made.",
    "sentimentScore": 0.6,
    "objections": [
      "budget is tight this quarter",
      "need sign-off from CFO"
    ],
    "commitmentSignals": [
      "let's schedule a follow-up next week",
      "send me the proposal by Friday"
    ],
    "actionItems": [
      "Send proposal document",
      "Schedule follow-up call"
    ],
    "nextBestAction": "Send a detailed proposal addressing the budget concern with flexible payment terms"
  },
  "scoreBreakdown": {
    "sentiment": 18,
    "objection": 18,
    "commitment": 25,
    "engagement": 11
  }
}
```

---

### `POST /api/analyze/followup`
Generates a personalized follow-up email based on deal context and meeting analysis.

---

### `GET /api/analytics/summary`
Returns aggregated analytics across all deals — industry breakdown, win rates, average health scores, objection frequency.

---

## 🧮 Health Scoring Engine

The health score is QuackDeal's core IP — a custom algorithm that quantifies deal quality into a single 0–100 number, broken down across four independently scored dimensions.

```
Total Health Score (0–100) = Sentiment + Objection + Commitment + Engagement
```

| Dimension | Max Points | What It Measures |
|-----------|-----------|-----------------|
| **Sentiment** | 25 | Positive vs. negative tone across the transcript |
| **Objection** | 25 | Number and severity of objections raised (inverse score) |
| **Commitment** | 25 | Strength of commitment signals — concrete next steps, timelines |
| **Engagement** | 25 | Prospect participation, questions asked, follow-through signals |

**Score labels:**

| Range | Label | Meaning |
|-------|-------|---------|
| 80–100 | 🟢 Hot | High likelihood to close |
| 60–79 | 🟡 Warm | Engaged, needs nurturing |
| 40–59 | 🟠 Lukewarm | Concerns present, at risk |
| 0–39 | 🔴 Cold | Significant blockers, reassess |

---

## 🤖 AI Integration

Claude is the intelligence layer of QuackDeal. All prompt engineering was written from scratch to produce **consistent, structured JSON output** that can be reliably parsed and stored.

### Transcript Analysis Prompt (summary)
Claude is instructed to return a strict JSON object containing:
- A plain-English summary of the call
- A sentiment score (float, -1.0 to 1.0)
- An array of objections (verbatim phrases)
- An array of commitment signals (verbatim phrases)
- An array of action items
- A single "next best action" recommendation

### Follow-up Email Generation
Claude receives the deal context (client name, company, industry, health score, objections, commitment signals) and generates a personalized, professional follow-up email addressing the specific concerns raised in the meeting.

> Claude handles the natural language understanding. We handle the prompt design, output parsing, scoring pipeline, and data persistence.

---

## 🗄 Data Schema

Snowflake data warehouse with 6 normalized tables:

```
USERS
  └── user_id (PK)
  └── email, name, created_at

DEALS
  └── deal_id (PK)
  └── user_id (FK → USERS)
  └── client_name, client_company, deal_value
  └── industry, stage, outcome

MEETINGS
  └── meeting_id (PK)
  └── deal_id (FK → DEALS)
  └── transcript_text, meeting_date

HEALTH_SCORES
  └── score_id (PK)
  └── meeting_id (FK → MEETINGS)
  └── total_score, sentiment, objection, commitment, engagement
  └── health_label

OBJECTIONS
  └── objection_id (PK)
  └── meeting_id (FK → MEETINGS)
  └── objection_text

FOLLOW_UPS
  └── followup_id (PK)
  └── meeting_id (FK → MEETINGS)
  └── email_body, generated_at
```

The analytics page is powered by **100 seeded deals** across 8 industries with realistic variance in health scores, outcomes, and objection types — ensuring the charts tell a meaningful story.

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- A Snowflake account with schema configured
- An Anthropic API key
- A Firebase project with Google Auth enabled
- (Optional) Databricks workspace

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/quackdeal.git
cd quackdeal
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
```

### 4. Configure Environment Variables
```bash
# In /server
cp .env.example .env

# In /client
cp .env.example .env
```
Fill in all required values (see [Environment Variables](#-environment-variables) below).

### 5. Run the App

**Backend** (port 5001):
```bash
cd server
npm run dev
```

**Frontend** (port 3000):
```bash
cd client
npm start
```

Open [http://localhost:3000](http://localhost:3000) and sign in with Google.

---

## 🔐 Environment Variables

### Backend (`/server/.env`)

```env
# Snowflake
SNOWFLAKE_ACCOUNT=your_account
SNOWFLAKE_USERNAME=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_DATABASE=QUACKDEAL
SNOWFLAKE_SCHEMA=PUBLIC
SNOWFLAKE_WAREHOUSE=COMPUTE_WH

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Firebase Admin
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com

# Databricks (optional)
DATABRICKS_HOST=https://your-workspace.azuredatabricks.net
DATABRICKS_TOKEN=dapi...
DATABRICKS_JOB_ID=your_job_id

PORT=5001
```

### Frontend (`/client/.env`)

```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

---

## 🔧 What We Built vs. What External Tools Did

### We built in code:

| What | Details |
|------|---------|
| **All Express API routes** | `/api/deals`, `/api/analyze`, `/api/analyze/followup`, `/api/analytics` — full request handling, error responses, data shaping |
| **Health scoring algorithm** | Custom formula combining 4 dimensions (each 0–25) into a 0–100 score |
| **Transcript parsing logic** | Extracts and structures Claude's JSON response into Snowflake-ready records |
| **Full React frontend** | Dashboard, deal cards, 3-step analysis wizard, deal detail page, analytics page |
| **Snowflake schema** | 6-table normalized schema designed from scratch with all queries |
| **Databricks integration** | Service layer with graceful mock fallback for Community Edition |
| **Firebase auth integration** | Protected route wrapper, `useAuth` hook, token forwarding to backend |
| **HealthGauge SVG component** | Custom half-circle animated gauge — zero dependencies |
| **Prompt engineering** | Structured prompts that reliably return consistent, parseable JSON from Claude |
| **Analytics seed data** | 100 realistic deals across 8 industries for meaningful chart patterns |

### External tools provided:

| Tool | Their Contribution |
|------|--------------------|
| **Claude API** | Natural language understanding of raw transcript text |
| **Snowflake** | Data storage infrastructure and SQL execution engine |
| **Databricks** | Running the analytics notebook job |
| **Firebase** | Handling Google OAuth token verification |
| **Recharts** | Chart SVG rendering |

---

## 💪 Meaningful Engineering Work

### 🗂 Data Architecture
Designed a normalized 6-table Snowflake schema from scratch, handling users, deals, meetings, health scores, objections, and follow-ups with proper foreign key relationships and query optimization.

### 🤖 AI Orchestration
Wrote structured prompts that instruct Claude to return consistent JSON, then built the full pipeline that parses that output, runs it through the scoring engine, and persists it across multiple Snowflake tables atomically.

### 📊 Health Scoring Engine
A custom 4-dimension scoring algorithm that quantifies deal quality into a 0–100 score. This is the core IP of the product — not a wrapper around an external API, but original logic that transforms unstructured conversation into a structured metric.

### 🔗 Full-Stack Integration
Connected 5 different external services (Claude, Snowflake, Databricks, Firebase, React) into a single coherent working product. Making them all talk to each other reliably, with graceful failures, is real engineering.

### 🔄 End-to-End User Flow
The complete loop works: log in → create deal → paste transcript → get AI analysis → view health score → see objections → generate follow-up email → view analytics. Zero broken handoffs.

### 📈 Analytics Pipeline
Seeded 100 realistic deals across 8 industries with varied outcomes, health scores, and objections — so the analytics page tells a story with real patterns, not empty charts.

### 🛡 Production-Grade Error Handling
Graceful Snowflake connection failures, Databricks mock fallback for Community Edition, and API response shape normalization throughout. The app does not crash when external services misbehave.

---

## 👥 Team — QuackDeal 🦆

| Name | Role |
|------|------|
| **Tanmay** | Backend architecture, Express API routes, Snowflake schema design & queries |
| **Abhishek** | Frontend (Dashboard, Google Auth, routing, protected routes) |
| **Sai Bhavesh** | Frontend (Deal components, 3-step analysis wizard, analytics page) |
| **Viraj** | AI integration, Claude prompt engineering, health scoring engine, Databricks pipeline |

---

## 📄 License

MIT — built for Stevens QuackHacks 2026. 🦆

---

<p align="center">
  <strong>QuackDeal · DealBreakers · Stevens QuackHacks 2026</strong><br/>
  <em>AI-powered deal intelligence for modern sales teams</em>
</p>
