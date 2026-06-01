from pydantic import BaseModel
from datetime import datetime


class CommitActivity(BaseModel):
    commits_today: int
    commits_this_week: int
    current_streak: int
    last_commit_date: str | None


class GitHubSnapshot(BaseModel):
    username: str
    captured_at: datetime
    activity: CommitActivity