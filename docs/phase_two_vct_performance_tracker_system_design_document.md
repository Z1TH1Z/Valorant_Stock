# Phase Two — System Design Document

# VCT Performance Tracker & Prediction Platform

---

# TL;DR

Phase Two defines the complete production system architecture, backend APIs, worker pipelines, database interactions, caching, deployment, and scaling strategy required to run the VCT Performance Tracker at scale. This phase converts the PRD into an implementable engineering blueprint.

---

# 1. System Goals

Primary goals:

- Support real-time team performance tracking
- Support prediction submission and scoring
- Support dynamic stock-style graph visualization
- Support horizontal scaling
- Support 100k+ users

Secondary goals:

- Low latency (<200ms API response)
- Fault tolerance
- High availability

---

# 2. High Level Architecture

Components:

Client (Browser)

CDN (Cloudflare)

Frontend (Next.js)

Backend API (Fastify / Node.js)

Worker Service (Score Engine)

PostgreSQL (Primary Database)

Redis (Cache + Queue)

External API (VLR.gg)

---

# 3. Architecture Flow

Flow 1: Data Ingestion

Worker → Fetch VLR API

Worker → Store raw data in PostgreSQL

Worker → Trigger score calculation job

---

Flow 2: Score Calculation

Worker → Calculate player scores

Worker → Calculate team scores

Worker → Store team performance history

---

Flow 3: Prediction Flow

User → Frontend → Backend API

Backend → Store prediction

Worker → Score prediction after match ends

---

Flow 4: Visualization Flow

Frontend → Backend API

Backend → Fetch performance history

Backend → Return graph data

Frontend → Render graph

---

# 4. Backend API Design

Base URL:

/api/v1

---

Auth APIs:

POST /auth/register

POST /auth/login

GET /auth/me

---

Team APIs:

GET /teams

GET /teams/:teamId

GET /teams/:teamId/performance

GET /regions/:region/teams

---

Player APIs:

GET /players

GET /players/:playerId

---

Match APIs:

GET /matches/upcoming

GET /matches/results

GET /matches/:matchId

---

Prediction APIs:

POST /predictions

GET /predictions/user

GET /predictions/:matchId

---

Leaderboard APIs:

GET /leaderboard/global

GET /leaderboard/region/:region

GET /leaderboard/weekly

---

Graph APIs:

GET /performance-history/:region

GET /performance-history/team/:teamId

---

# 5. Worker System Design

Worker Responsibilities:

Fetch external API

Calculate player performance score

Calculate team performance score

Score user predictions

Update leaderboard

---

Worker Jobs:

FETCH_API_DATA

CALCULATE_PLAYER_SCORE

CALCULATE_TEAM_SCORE

UPDATE_TEAM_HISTORY

SCORE_PREDICTIONS

---

Queue System:

BullMQ

Redis

---

# 6. Score Calculation Pipeline

Step 1: Fetch player stats

Step 2: Normalize metrics

Step 3: Calculate PlayerScore

Step 4: Calculate TeamBaseScore

Step 5: Apply margin multiplier

Step 6: Store performance history

---

# 7. Prediction Scoring Pipeline

Step 1: Fetch completed matches

Step 2: Fetch predictions

Step 3: Compare actual vs predicted

Step 4: Calculate score

Step 5: Store prediction score

Step 6: Update leaderboard

---

# 8. Database Interaction Flow

Read-heavy queries:

Graph data

Leaderboard

Team performance

---

Write-heavy queries:

Predictions

Score history

Prediction scores

---

# 9. Redis Caching Strategy

Cached Data:

Leaderboard

Team performance history

Graph data

Upcoming matches

---

Cache TTL:

5 minutes

---

# 10. Scalability Strategy

Stateless backend

Multiple backend instances

Multiple worker instances

Load balancer

Redis distributed queue

---

# 11. Deployment Architecture

Production Infrastructure:

Frontend → Vercel

Backend → Fly.io / Railway

Worker → Fly.io worker

Database → PostgreSQL

Cache → Redis

---

# 12. Folder Structure

Backend:

src/

controllers/

routes/

services/

workers/

models/

utils/

config/

server.ts

---

Worker:

jobs/

fetchApi.job.ts

scoreCalculation.job.ts

predictionScoring.job.ts

worker.ts

queue.ts

---

Frontend:

app/

components/

charts/

api/

hooks/

store/

utils/

---

# 13. Cron Job Design

Fetch API:

Every 24 hours

Score calculation:

After fetch

Prediction scoring:

After match result

---

# 14. Failure Handling

Retry failed jobs

Log errors

Dead letter queue

Manual retry support

---

# 15. Security Design

JWT authentication

Password hashing (bcrypt)

Rate limiting

Input validation

---

# 16. Monitoring

Metrics:

API latency

Worker latency

Prediction scoring time

Database query time

---

Tools:

Prometheus

Grafana

Sentry

---

# 17. Performance Targets

API response time:

<200ms

Graph load time:

<1 second

Prediction scoring latency:

<5 seconds

---

# 18. Scaling Limits

Supports:

100k users

10k teams

1M predictions

Horizontal scaling supported

---

# 19. Final Engineering Outcome

This system provides a fully scalable, production-ready architecture capable of:

Real-time analytics

Dynamic ranking

Prediction scoring

High-performance graph rendering

Reliable and scalable infrastructure
