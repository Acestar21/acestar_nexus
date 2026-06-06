#!/bin/bash
source venv/bin/activate
cd backend && uvicorn main:app --port 8000 &
cd .. && cargo tauri dev