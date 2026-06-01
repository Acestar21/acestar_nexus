from pydantic import BaseModel
from datetime import datetime


class WorkoutEntry(BaseModel):
    date: str
    completed: bool
    duration_minutes: int | None = None
    notes: str | None = None


class FitnessSnapshot(BaseModel):
    captured_at: datetime
    worked_out_today: bool
    current_streak: int
    total_workouts_this_week: int
    last_workout_date: str | None