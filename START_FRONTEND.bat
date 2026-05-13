@echo off
REM Start frontend service on port 3000
cd /d "%~dp0frontend"
echo Starting frontend on port 3000...
echo.
npm run dev
