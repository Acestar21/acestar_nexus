import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from database import init_db
from routers import internships, goals, reminders, todos, focus, metrics

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
	init_db()
	yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:5173", "tauri://localhost"],
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(internships.router, prefix="/internships", tags=["internships"])
app.include_router(goals.router, prefix="/goals", tags=["goals"])
app.include_router(reminders.router, prefix="/reminders", tags=["reminders"])
app.include_router(todos.router, prefix="/todos", tags=["todos"])
app.include_router(focus.router, prefix="/focus", tags=["focus"])
app.include_router(metrics.router, prefix="/metrics", tags=["metrics"])

@app.get("/health")
def health():
	return {"status": "ok"}