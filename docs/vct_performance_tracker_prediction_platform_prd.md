# Product Requirements Document (PRD)

# VCT Performance Tracker & Prediction Platform

---

# TL;DR

Build a data‑driven web platform that tracks and ranks VCT teams using a proprietary **Performance Score** calculated from player statistics, match results, and score margins. Users can visualize team rankings in a stock‑market‑style graph and predict match outcomes and map scores. User prediction accuracy is scored based on closeness to actual results. Data is sourced from the VLR.gg unofficial API.

---

# 1. Executive Summary

The VCT Performance Tracker is a web platform that:

- Tracks performance of VCT teams across all 4 regions
- Calculates weekly team performance scores using player metrics and match margins
- Displays dynamic rankings using stock‑market‑style performance graphs
- Allows users to predict match results and map scores
- Scores users based on prediction accuracy

This creates a hybrid of:

- Analytics platform
- Ranking engine
- Prediction platform
- Performance visualization system

---

# 2. Objectives

## Primary Objectives

- Build proprietary team performance scoring system
- Track weekly performance of teams
- Visualize team performance dynamically
- Enable match prediction system
- Score and rank users based on prediction accuracy

## Secondary Objectives

- Provide deeper insights beyond win/loss
- Increase user engagement
- Create alternative ranking model

---

# 3. Regions Covered

The system will track all 4 VCT Regions:

- Americas
- EMEA
- Pacific
- China

Each region will have:

- Separate rankings
- Separate graphs
- Separate leaderboards

---

# 4. Core Features

---

# Feature 1: Player Performance Score

## Metrics Used (from VLR API and match stats)

Primary metrics:

- Rating (R)
- ACS (Average Combat Score)
- K/D Ratio
- ADR (Average Damage per Round)
- KAST %
- First Kills
- First Deaths

Secondary metrics:

- Headshot %
- Assists
- Clutch success

---

## Player Score Formula

PlayerScore =

(0.25 × Rating)
+ (0.20 × ACS_normalized)
+ (0.15 × KD_normalized)
+ (0.15 × ADR_normalized)
+ (0.10 × KAST_normalized)
+ (0.10 × FKFD_impact)
+ (0.05 × HS%)

All metrics normalized to range 0–1.

---

# Feature 2: Team Performance Score

TeamScoreBase = Average(PlayerScores)

---

# Feature 3: Match Margin Multiplier

Match margin affects score impact.

Example multipliers:

13‑0 → 1.50

13‑5 → 1.35

13‑6 → 1.30

13‑7 → 1.25

13‑8 → 1.20

13‑9 → 1.15

13‑10 → 1.10

13‑11 → 1.05

13‑12 → 1.02

Loss close:

11‑13 → 0.98

Heavy loss:

5‑13 → 0.80

---

# Feature 4: Match Impact Calculation

Win:

TeamScore += TeamScoreBase × MarginMultiplier

Loss:

TeamScore -= TeamScoreBase × LossMultiplier

Close losses reduce penalty.

---

# Feature 5: Weekly Performance Score

Each team has weekly score:

WeeklyScore = Sum(all match impacts in week)

Stored historically.

---

# Feature 6: Stock Market Style Ranking Graph

Each team represented as stock‑like line.

Graph shows:

X axis: Time (weeks)

Y axis: PerformanceScore

Features:

- Compare teams in same region
- Dynamic ranking changes
- Hover tooltips
- Toggle teams
- Zoom and pan

---

# Feature 7: Prediction System

Users can predict:

Match result:

2‑0

2‑1

3‑0

3‑1

3‑2

---

Map score range prediction:

Example:

13‑5 to 13‑10

---

# Feature 8: Prediction Scoring

Actual score example:

13‑8

If prediction range contains actual score:

Full points

If close:

Partial points

---

Formula:

Points = 100 − (Difference × 10)

Bonus:

Correct winner: +50

Exact score: +100

---

# Feature 9: Leaderboards

Leaderboard types:

Global leaderboard

Region leaderboard

Weekly leaderboard

Monthly leaderboard

---

# 5. Data Sources

Primary source:

VLR.gg Unofficial API

Endpoints:

/api/rankings/:region

/api/players

/api/matches/upcoming

/api/matches/results

/api/events

---

# 6. System Architecture

Frontend:

Next.js

Tailwind

Recharts or Chart.js

---

Backend:

Node.js

Express or Fastify

Responsibilities:

Fetch API data

Calculate scores

Store historical scores

Score predictions

---

Database:

PostgreSQL

Tables:

users

teams

players

matches

team_performance_history

predictions

prediction_scores

---

# 7. Data Flow

Fetch API data

Calculate player score

Calculate team score

Apply multipliers

Store results

Update graph

Score predictions

---

# 8. Performance Requirements

Support:

100k users

Graph load under 1 second

Real‑time score updates

---

# 9. Non Functional Requirements

99.9% uptime

Secure authentication

Scalable backend

Cached API responses

---

# 10. Future Enhancements

ML based prediction

Player comparison

Fantasy mode

Mobile app

---

# 11. Success Metrics

Daily active users

Prediction participation

User retention

---

# 12. Summary

The platform provides:

Performance tracking

Dynamic rankings

Prediction system

Interactive graphs

Data-driven insights for VCT teams

---

# 13. Database Schema (PostgreSQL)

## users

id (UUID, PK)

username (VARCHAR, UNIQUE)

email (VARCHAR, UNIQUE)

password_hash (VARCHAR)

created_at (TIMESTAMP)

---

## teams

id (UUID, PK)

name (VARCHAR)

region (VARCHAR)

logo_url (TEXT)

vlr_team_url (TEXT)

created_at (TIMESTAMP)

---

## players

id (UUID, PK)

name (VARCHAR)

team_id (UUID, FK)

country (VARCHAR)

rating (FLOAT)

acs (FLOAT)

kd_ratio (FLOAT)

adr (FLOAT)

kast (FLOAT)

hs_percent (FLOAT)

fk_per_round (FLOAT)

fd_per_round (FLOAT)

updated_at (TIMESTAMP)

---

## matches

id (UUID, PK)

team_one_id (UUID)

team_two_id (UUID)

team_one_score (INT)

team_two_score (INT)

region (VARCHAR)

event_name (VARCHAR)

match_date (TIMESTAMP)

status (VARCHAR)

---

## maps

id (UUID, PK)

match_id (UUID)

map_name (VARCHAR)

team_one_score (INT)

team_two_score (INT)

---

## team_performance_history

id (UUID, PK)

team_id (UUID)

performance_score (FLOAT)

week_start_date (DATE)

week_end_date (DATE)

created_at (TIMESTAMP)

---

## predictions

id (UUID, PK)

user_id (UUID)

match_id (UUID)

predicted_winner_team_id (UUID)

predicted_series_score (VARCHAR)

created_at (TIMESTAMP)

---

## prediction_maps

id (UUID, PK)

prediction_id (UUID)

map_number (INT)

predicted_min_score (INT)

predicted_max_score (INT)

---

## prediction_scores

id (UUID, PK)

prediction_id (UUID)

score_awarded (INT)

created_at (TIMESTAMP)

---

# 14. Performance Score Calculation (Detailed)

## Step 1: Normalize Metrics

Normalization formula:

normalized_value = (value − min_value) / (max_value − min_value)

Example ranges:

Rating: 0.8 to 1.4

ACS: 150 to 300

ADR: 100 to 180

KAST: 60 to 85

---

## Step 2: Player Score

PlayerScore =

0.25 × Rating_norm

+ 0.20 × ACS_norm

+ 0.15 × KD_norm

+ 0.15 × ADR_norm

+ 0.10 × KAST_norm

+ 0.10 × FKFD_norm

+ 0.05 × HS_norm

---

## Step 3: Team Base Score

TeamBaseScore = Average(PlayerScores of active players)

---

## Step 4: Margin Multiplier

margin = abs(team_score − opponent_score)

Multiplier examples:

margin ≥ 7 → 1.3

margin 4–6 → 1.2

margin 2–3 → 1.1

margin 1 → 1.05

---

## Step 5: Final Match Impact

If win:

Impact = TeamBaseScore × Multiplier

If loss:

Impact = −(TeamBaseScore × LossMultiplier)

---

## Step 6: Weekly Performance Score

WeeklyScore = PreviousScore + Sum(MatchImpacts)

---

# 15. Prediction Scoring Algorithm Specification

## Inputs

Actual score

Predicted range

Predicted winner

---

## Step 1: Range Score

If actual score inside predicted range:

RangePoints = 100

Else:

Difference = minimum distance to range

RangePoints = max(0, 100 − Difference × 10)

---

## Step 2: Winner Score

Correct winner:

+50 points

---

## Step 3: Exact Score Bonus

Exact match:

+100 points

---

## Final Prediction Score

Total = RangePoints + WinnerPoints + Bonus

---

# 16. System Design Architecture

## Components

Frontend (Next.js)

Backend API (Node.js)

Worker Service (Score calculator)

PostgreSQL Database

Redis Cache

---

## Flow

VLR API → Backend Fetch Service

Backend → Store raw data

Worker → Calculate scores

Worker → Store performance history

Frontend → Fetch processed data

Frontend → Render graphs

User → Submit prediction

Backend → Store prediction

Worker → Score predictions after match ends

---

# 17. MVP Scope

## MVP Features

Team rankings

Player performance calculation

Performance score calculation

Graph visualization

Prediction submission

Prediction scoring

Leaderboard

---

# 18. V1 Features

Real-time updates

Advanced graphs

Player pages

Team comparison

Prediction analytics

---

# 19. V2 Features

ML prediction model

AI score forecasting

Fantasy system

Mobile app

Public API

---

# 20. Recommended Open Source Tech Stack

Frontend:

Next.js

TailwindCSS

Recharts

Backend:

Node.js

Fastify

Database:

PostgreSQL

Cache:

Redis

Worker:

BullMQ

Hosting:

Docker

AWS / Railway / Fly.io

---

# 21. Deployment Architecture

Client → CDN → Frontend

Frontend → Backend API

Backend → PostgreSQL

Backend → Redis

Worker → Score calculations

Cron → Fetch VLR API every 24 hrs

---

# 22. Scalability Design

Horizontal scaling supported

Stateless backend

Cached read-heavy queries

Async workers for scoring

---

# 23. Success Metrics

System metrics:

API latency

Graph load speed

Prediction scoring speed

User metrics:

DAU

Prediction count

Retention rate

---

# 24. Final Outcome

This system creates a full analytics, ranking, and prediction platform similar to stock markets but for VCT teams, driven by player performance, match margins, and prediction intelligence.

