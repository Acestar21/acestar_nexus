from pydantic import BaseModel
from datetime import datetime

class LeetCodeActivity(BaseModel):
    problem_solved_today: int
    problem_solved_this_week: int
    total_problem_solved: int
    current_streak: int
    max_streak: int
    total_active_days: int

class LeetCodeSnapshot(BaseModel):
    username: str
    captured_at: datetime
    activity: LeetCodeActivity