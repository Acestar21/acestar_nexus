from typing import Optional
from datetime import datetime, date
from sqlmodel import SQLModel, Field

class Internship(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    company: str
    role: str
    applied_at: Optional[date] = None
    status: str = "applied"
    priority: str = "medium"
    notes: Optional[str] = None
    followup_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Goal(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    target: int
    start_date: date
    end_date: date
    unit: str = "problems"

class Reminder(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    priority: str = "medium"
    remind_at: Optional[datetime] = None
    done: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Todo(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    priority: str = "medium"
    remind_at: Optional[datetime] = None
    done: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)