import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import init_db
from routers import internships, goals, reminders, todos

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "tauri://localhost"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

app.include_router(internships.router, prefix="/internships", tags=["internships"])
app.include_router(goals.router, prefix="/goals", tags=["goals"])
app.include_router(reminders.router, prefix="/reminders", tags=["reminders"])
app.include_router(todos.router, prefix="/todos", tags=["todos"])

@app.get("/health")
def health():
    return {"status": "ok"}