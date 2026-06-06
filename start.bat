@echo off
call venv\Scripts\activate
start cmd /k "cd backend && uvicorn main:app --port 8000"
cd frontend && start cmd /k "npm run dev"
cd ..
cargo tauri dev