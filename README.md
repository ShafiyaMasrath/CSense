# CSense – Intelligent Customer Success Action Platform

## Overview

CSense is an AI-powered, multi-agent decision intelligence platform designed to help Customer Success Managers (CSMs) make better, faster, and explainable customer decisions.

Instead of manually analyzing CRM data, meeting history, support tickets, and product usage, CSense orchestrates multiple AI agents to identify customer risks and opportunities, recommend the next best actions, challenge those recommendations through a Devil's Advocate agent, and automate customer engagement workflows.

The platform is built using LangGraph for agent orchestration, FastAPI for backend services, Gemini 2.5 Flash for reasoning, and React for an interactive dashboard.

---

## Features

- Multi-Agent AI workflow using LangGraph
- Planner Agent for dynamic orchestration
- Context Retrieval from multiple enterprise data sources
- AI-powered Risk & Opportunity Analysis
- Next Best Action Recommendation Engine
- Devil's Advocate Agent for counter-analysis
- Shared Memory for future learning
- Zoom meeting automation
- Recall.ai meeting transcription
- AI-generated meeting summaries
- Interactive React dashboard
- Human-in-the-loop approval before execution

---

## Technology Stack

### Frontend

- React (Vite)
- Tailwind CSS
- Framer Motion
- Lucide Icons
- Axios

### Backend

- FastAPI
- LangGraph
- Gemini 2.5 Flash
- Pydantic
- HTTPX
- Python

### Integrations

- Zoom Server-to-Server OAuth
- Recall.ai
- Google Gemini API

### Data

- JSON-based CRM
- Product Usage
- Support Tickets
- Contacts
- Meeting History

---

## Architecture

```
                    React Dashboard
                           │
                           ▼
                  FastAPI Backend API
                           │
                           ▼
                 LangGraph Agent Pipeline
                           │
      ┌──────────────────────────────────────────┐
      │ Planner Agent                            │
      │          ↓                               │
      │ Context Retrieval Agent                  │
      │          ↓                               │
      │ Risk & Opportunity Agent                 │
      │          ↓                               │
      │ Next Best Action Agent                   │
      │          ↓                               │
      │ Devil's Advocate Agent                   │
      │          ↓                               │
      │ Memory Agent                             │
      └──────────────────────────────────────────┘
                           │
                           ▼
                 Decision Workspace
                           │
                           ▼
             Zoom + Recall.ai Automation
                           │
                           ▼
          AI Meeting Summary & Memory Update
```

---

## Project Structure

```
CSense/
│
├── backend/
│   ├── agents/
│   ├── data/
│   ├── graph/
│   ├── models/
│   ├── services/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── run_app.bat
├── run_app.ps1
├── .env.example
├── .gitignore
└── README.md
```

---

## Environment Variables

Create a `.env` file inside the backend folder.

Example:

```env
GOOGLE_API_KEY=your_google_api_key

RECALL_AI_API_KEY=your_recall_api_key

ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/CSense.git

cd CSense
```

---

## Backend Setup

```bash
cd backend

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs at

```
http://localhost:8000
```

---

## Frontend Setup

Open another terminal.

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at

```
http://localhost:5173
```

---

## Quick Start (Windows)

You can launch both services automatically.

Command Prompt

```bash
.\run_app.bat
```

PowerShell

```powershell
.\run_app.ps1
```

---

## Workflow

1. Select a customer.
2. Click **Analyze Customer**.
3. Planner Agent initializes execution.
4. Context Retrieval gathers enterprise data.
5. Risk Analysis evaluates customer health.
6. Next Best Action Agent generates recommendations.
7. Devil's Advocate challenges each recommendation.
8. Human reviews recommendations.
9. Accepting a recommendation automatically creates:
   - Zoom Meeting
   - Email Draft
   - Recall.ai Recording Bot
10. After the meeting, transcripts are analyzed and stored as organizational memory.

---

## AI Agents

### Planner Agent

Coordinates the execution pipeline.

### Context Retrieval Agent

Collects CRM, meeting, support, usage, and contact information.

### Risk Analysis Agent

Identifies churn risk, expansion opportunities, adoption, and champion stability.

### Next Best Action Agent

Generates prioritized recommendations.

### Independent Review

Challenges recommendations by identifying assumptions, risks, and mitigation strategies.

### Memory Agent

Stores summarized insights for future decision-making.

---

## Future Enhancements

- Vector Database Integration
- Real-time CRM Sync
- Multi-tenant Architecture
- Slack & Teams Integration
- Role-Based Access Control
- Analytics Dashboard
- Autonomous Follow-up Agents

---

## Demo

The repository includes:

- Interactive React Dashboard
- Multi-Agent AI Workflow
- Zoom Automation
- Recall.ai Integration
- Human-in-the-loop Decision Workspace

---

