from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Reminder
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[Reminder])
def get_reminders(session: Session = Depends(get_session)):
    return session.exec(select(Reminder)).all()

@router.post("/", response_model=Reminder)
def create_reminder(reminder: Reminder, session: Session = Depends(get_session)):
	if isinstance(reminder.remind_at, str):
		reminder.remind_at = datetime.fromisoformat(reminder.remind_at)
	session.add(reminder)
	session.commit()
	session.refresh(reminder)
	return reminder

@router.patch("/{id}", response_model=Reminder)
def update_reminder(id: int, data: dict, session: Session = Depends(get_session)):
    reminder = session.get(Reminder, id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in data.items():
        setattr(reminder, key, value)
    session.add(reminder)
    session.commit()
    session.refresh(reminder)
    return reminder

@router.delete("/{id}")
def delete_reminder(id: int, session: Session = Depends(get_session)):
    reminder = session.get(Reminder, id)
    if not reminder:
        raise HTTPException(status_code=404, detail="Not found")
    session.delete(reminder)
    session.commit()
    return {"ok": True}