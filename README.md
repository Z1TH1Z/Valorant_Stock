# Valorant Stock — VCT Performance Tracker & Prediction Platform

A full-stack web application that tracks **VALORANT Champions Tour (VCT)** professional team performance, provides dynamic stock-style rankings, and offers a match-prediction system with a competitive leaderboard.

## Tech Stack

| Layer    | Technology                                  |
| -------- | ------------------------------------------- |
| Frontend | Next.js 16, React 19, TailwindCSS, Recharts |
| Backend  | Fastify, Prisma (PostgreSQL), BullMQ, Redis |
| Data     | vlrggapi (VLR.gg scraper API)               |

## Project Structure

```
├── frontend/   # Next.js client application
├── backend/    # Fastify API server & data pipeline
└── vlrggapi/   # Third-party VLR.gg data API
```

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL**
- **Redis** (for BullMQ job queue)

### Installation

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
cp .env.example .env   # fill in your DATABASE_URL
npm install
npx prisma generate
npm run dev
```

## Features

- 📈 **Performance Dashboard** — Stock-style charts tracking team form over time
- 🔮 **Match Predictions** — Predict match outcomes and earn points
- 🏆 **Leaderboards** — Global & regional ranking of predictors
- 🌍 **Regions Hub** — Browse teams by VCT region (Americas, EMEA, Pacific, China)
- 📰 **Live News & Events** — Latest VCT tournament information

## License

This project is for educational & personal use.
