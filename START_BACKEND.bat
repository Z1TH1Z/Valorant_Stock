@echo off
REM Start backend service on port 3001
cd /d "%~dp0backend"
echo Starting backend on port 3001...
echo.
npm run dev
