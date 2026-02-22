# 📈 Valorant Stock — VCT Performance Tracker & Prediction Platform

A full-stack **"Bloomberg Terminal for Valorant Esports"** that tracks VCT franchise team performance with stock-style charts, real-time match data, and a competitive prediction system.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Fastify](https://img.shields.io/badge/Fastify-5-white?logo=fastify)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-blue?logo=tailwindcss)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)

---

## 🎯 Features

- **📊 Performance Dashboard** — Stock-market-style charts tracking team form over time with real-time data
- **🔮 Match Predictions** — Predict outcomes of upcoming VCT matches and earn points
- **🏆 Leaderboards** — Global & regional ranking of predictors (Americas, EMEA, Pacific, China)
- **🌍 Regions Hub** — Browse all Tier 1 franchise teams organized by VCT region
- **👥 Team Profiles** — Detailed stats, player rosters, and performance history for each team
- **📰 Live News & Events** — Real-time VCT tournament news from VLR.gg
- **⚡ Live Scores** — In-progress match score tracking

---

## 🏗 Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                 │
│         React 19 · TailwindCSS · Recharts · Framer       │
│                  Runs on port 3000                       │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP (REST)
┌────────────────────────▼─────────────────────────────────┐
│              BACKEND (Fastify + Prisma)                  │
│         Node.js API · BullMQ · Redis workers             │
│                  Runs on port 3001                       │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP
┌────────────────────────▼─────────────────────────────────┐
│              vlrggapi (Python FastAPI)                    │
│         Scrapes VLR.gg data · lxml · selectolax          │
│                  Runs on port 8000                       │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
Valorant_Stock/
├── frontend/               # Next.js 16 client application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Dashboard (home page)
│   │   │   ├── predictions/page.tsx  # Match prediction page
│   │   │   ├── leaderboards/page.tsx # Leaderboard rankings
│   │   │   ├── regions/page.tsx      # Regions hub
│   │   │   ├── regions/[region]/     # Region detail page
│   │   │   └── teams/[teamId]/       # Team profile page
│   │   └── components/
│   │       ├── charts/               # StockChart, RegionChart
│   │       └── layout/               # Sidebar, Topbar
│   └── package.json
│
├── backend/                # Fastify API server
│   ├── src/
│   │   ├── server.ts       # Main API entry point (all endpoints)
│   │   ├── services/       # VLR scraper & scoring service
│   │   ├── workers/        # BullMQ background workers
│   │   ├── routes/         # Route definitions
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Data models
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
│
├── vlrggapi/               # Python VLR.gg data API (3rd-party)
│   ├── main.py             # FastAPI entry point
│   ├── api/scrapers/       # Data scrapers for VLR.gg
│   ├── routers/            # API route definitions
│   ├── utils/              # Caching, HTTP client, pagination
│   └── requirements.txt
│
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

Make sure you have the following installed on your system:

| Tool       | Version  | Download                                     |
| ---------- | -------- | -------------------------------------------- |
| **Node.js** | ≥ 18     | [nodejs.org](https://nodejs.org/)             |
| **Python**  | ≥ 3.10   | [python.org](https://www.python.org/)         |
| **PostgreSQL** | ≥ 14  | [postgresql.org](https://www.postgresql.org/) |
| **Redis**   | ≥ 7      | [redis.io](https://redis.io/)                 |
| **Git**     | Latest   | [git-scm.com](https://git-scm.com/)           |

---

## 🚀 Setting Up the Project

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Z1TH1Z/Valorant_Stock.git
cd Valorant_Stock
```

---

### Step 2 — Set Up the Python Data API (`vlrggapi`)

The vlrggapi service scrapes live data from VLR.gg. It must be running **before** the backend.

```bash
# Navigate to the API directory
cd vlrggapi

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# macOS / Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Start the API server (runs on port 8000)
python main.py
```

> ✅ **Verify:** Open [http://localhost:8000](http://localhost:8000) — you should see the FastAPI docs page.

---

### Step 3 — Set Up the Backend (Fastify + Prisma)

Open a **new terminal** window:

```bash
# Navigate to the backend directory
cd backend

# Install Node.js dependencies
npm install

# Create your environment file from the template
cp .env.example .env
```

#### Configure the Database

Edit `backend/.env` and set your `DATABASE_URL`:

```env
# For local PostgreSQL:
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/valorant_stock"

# Or for Prisma Postgres (cloud):
DATABASE_URL="prisma+postgres://..."
```

#### Run Database Migrations

```bash
# Generate the Prisma client
npx prisma generate

# Push the schema to your database (creates tables)
npx prisma db push
```

#### Start the Backend Server

```bash
# Development mode (auto-restart on file changes)
npm run dev
```

> ✅ **Verify:** Open [http://localhost:3001/health](http://localhost:3001/health) — you should see `{"status":"ok"}`.

---

### Step 4 — Set Up the Frontend (Next.js)

Open a **new terminal** window:

```bash
# Navigate to the frontend directory
cd frontend

# Install Node.js dependencies
npm install

# Start the development server
npm run dev
```

> ✅ **Verify:** Open [http://localhost:3000](http://localhost:3000) — the VCT Tracker dashboard should load.

---

## 🏃 Running the Full Stack

You need **3 terminals** running simultaneously:

| Terminal | Directory   | Command          | Port |
| -------- | ----------- | ---------------- | ---- |
| 1️⃣       | `vlrggapi/` | `python main.py` | 8000 |
| 2️⃣       | `backend/`  | `npm run dev`    | 3001 |
| 3️⃣       | `frontend/` | `npm run dev`    | 3000 |

**Startup order matters:** vlrggapi → Backend → Frontend

---

## 🔌 API Endpoints

The Fastify backend exposes the following REST endpoints:

| Method | Endpoint                  | Description                              |
| ------ | ------------------------- | ---------------------------------------- |
| GET    | `/api/teams`              | All Tier 1 franchise teams (all regions) |
| GET    | `/api/rankings/:region`   | Team rankings for a specific region       |
| GET    | `/api/matches/upcoming`   | Upcoming Tier 1 matches                  |
| GET    | `/api/matches/results`    | Recent match results                     |
| GET    | `/api/matches/live`       | Currently live match scores              |
| GET    | `/api/news`               | Latest VLR.gg news articles              |
| GET    | `/api/events`             | Upcoming VCT events                      |
| GET    | `/health`                 | Health check endpoint                    |

**Regions:** `americas`, `emea`, `pacific`, `china`

---

## 🗄 Database Schema

The PostgreSQL database (managed by Prisma) contains the following models:

| Model                      | Description                                       |
| -------------------------- | ------------------------------------------------- |
| `User`                     | Registered users with prediction history          |
| `Team`                     | VCT franchise teams with logos and regional info   |
| `Player`                   | Player stats (ACS, K/D, ADR, KAST, HS%, etc.)     |
| `Match`                    | Match records with scores and event details        |
| `Map`                      | Individual map results within a match              |
| `TeamPerformanceHistory`   | Weekly "stock price" performance scores            |
| `Prediction`               | User match predictions with series score guesses   |
| `PredictionMap`            | Per-map score predictions                          |
| `PredictionScore`          | Points awarded for prediction accuracy             |

---

## 🧰 Tech Stack

| Layer     | Technologies                                              |
| --------- | --------------------------------------------------------- |
| Frontend  | Next.js 16, React 19, TailwindCSS 4, Recharts, Framer Motion |
| Backend   | Fastify 5, Prisma ORM 7, BullMQ, Redis                    |
| Database  | PostgreSQL                                                 |
| Data API  | Python FastAPI, lxml, selectolax, httpx (vlrggapi)         |
| Fonts     | Inter, Teko (Google Fonts)                                 |

---

## 📜 Available Scripts

### Frontend (`frontend/`)

| Command         | Description                     |
| --------------- | ------------------------------- |
| `npm run dev`   | Start development server        |
| `npm run build` | Create production build          |
| `npm run start` | Start production server          |
| `npm run lint`  | Run ESLint                       |

### Backend (`backend/`)

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start dev server with hot reload (tsx)   |
| `npm run build` | Compile TypeScript to JavaScript          |
| `npm run start` | Start production server from `dist/`      |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is for educational & personal use.
