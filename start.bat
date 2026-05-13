@echo off
cd /d "%~dp0"

echo ============================================================
echo VCT Performance Tracker - Startup Sequence
echo ============================================================
echo.

REM Check if vlrggapi venv exists
if not exist "vlrggapi\venv" (
    echo Creating vlrggapi venv...
    cd vlrggapi
    python -m venv venv
    cd ..
)

REM Check if frontend node_modules exists
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Starting vlrggapi on port 8000...
cd vlrggapi
start "" cmd /k "venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000"
cd ..
timeout /t 10

echo.
echo Starting backend on port 3001...
cd backend
start "" cmd /k "npm run dev"
cd ..
timeout /t 15

echo.
echo Starting frontend on port 3000...
cd frontend
start "" cmd /k "npm run dev"
cd ..

echo.
echo ============================================================
echo Services started in separate windows:
echo - vlrggapi:  http://127.0.0.1:8000
echo - backend:   http://127.0.0.1:3001
echo - frontend:  http://localhost:3000
echo ============================================================
echo.
pause
