@echo off
echo Starting XLVentures Application...

start cmd /k "cd backend && python main.py"
start cmd /k "cd frontend && npm run dev"

echo Both services are starting in separate windows.
