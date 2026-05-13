# VCT Performance Tracker — How to Run

This project has **three separate servers** that must all be running at the same time.

```
vlrggapi  (Python/FastAPI)   →  port 8000   VLR.gg scraper
backend   (Node/Fastify)     →  port 3001   API + Liquipedia client
frontend  (Next.js)          →  port 3000   UI
```

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | 18+ | https://nodejs.org |
| Python | 3.11+ | https://python.org |
| npm | included with Node | — |

---

## 1. Environment Setup (one-time)

### Backend `.env`

The file `backend/.env` must contain your API keys:

```env
LPDB_API_KEY=your_liquipedia_key_here
```

> The `DATABASE_URL` line is already present if you cloned the repo. Only add `LPDB_API_KEY`.

---

## 2. Install Dependencies (one-time)

### vlrggapi (Python)

```bash
cd vlrggapi
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Backend (Node)

```bash
cd backend
npm install
```

### Frontend (Node)

```bash
cd frontend
npm install
```

---

## 3. Running the Servers

Open **three separate terminals** and run one command in each.

### Terminal 1 — vlrggapi (Python scraper)

```bash
cd vlrggapi

# Windows
venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000

# Mac/Linux
venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Wait until you see:
```
Uvicorn running on http://127.0.0.1:8000
```

### Terminal 2 — Backend (Node/Fastify)

```bash
cd backend
npm run dev
```

Wait until you see:
```
✓ Fastify Server running on port 3001 wrapping VLR Python API
```

> The backend takes ~15 seconds on first start — it discovers all active VCT Tier 1 teams from VLR.gg at boot.

### Terminal 3 — Frontend (Next.js)

```bash
cd frontend
npm run dev
```

Wait until you see:
```
✓ Ready on http://localhost:3000
```

---

## 4. Open the App

Go to **http://localhost:3000** in your browser.

---

## Verify Everything is Working

You can sanity-check each server individually:

```bash
# vlrggapi health
curl http://127.0.0.1:8000/health

# Backend health (also shows Liquipedia cache stats)
curl http://127.0.0.1:3001/health

# Live LPDB match results
curl "http://127.0.0.1:3001/api/lpdb/results?limit=5"
```

---

## Startup Order Matters

Always start in this order:
1. `vlrggapi` first — the backend calls it on startup
2. `backend` second — must be running before the frontend loads data
3. `frontend` last

If you start the backend before vlrggapi, it will log errors and serve empty data until you restart it.

---

## Common Issues

| Problem | Fix |
|---|---|
| `ECONNREFUSED 127.0.0.1:8000` | vlrggapi is not running — start Terminal 1 first |
| `EADDRINUSE :3001` | Another backend process is still running — kill it with `taskkill /F /PID <pid>` (Windows) or `kill <pid>` (Mac/Linux) |
| `LPDB_API_KEY is not set` | Add your key to `backend/.env` |
| Charts show "No season data available" | LPDB rate limit was hit — wait ~60 seconds and refresh |
| Teams show rank 999 / 0 pts | VLR.gg ranking scrape failed — check vlrggapi logs in Terminal 1 |

---

## Data Sources

| Data | Source |
|---|---|
| Upcoming matches, live scores, news | VLR.gg (via local vlrggapi scraper) |
| Match results, team history, chart data | Liquipedia LPDB API (free tier) |
| Team rankings and circuit points | VLR.gg (via local vlrggapi scraper) |

Data from Liquipedia is used under [CC-BY-SA](https://liquipedia.net/commons/Liquipedia:Copyrights).
