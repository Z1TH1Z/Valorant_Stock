@echo off
REM Start vlrggapi service on port 8000
cd /d "%~dp0vlrggapi"
echo Starting vlrggapi on port 8000...
echo.
venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
