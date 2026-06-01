from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from database import get_session
from models import Reminder, Todo, Internship
from datetime import datetime

router = APIRouter()

@router.get("/")
def get_focus(session: Session = Depends(get_session)):
	now = datetime.now()

	# Check high priority reminders with active alarms
	reminders = session.exec(select(Reminder).where(Reminder.done == False)).all()
	for r in reminders:
		if r.priority == 'high' and r.remind_at and r.remind_at <= now:
			return {
				"type": "reminder",
				"priority": "high",
				"message": r.text,
				"id": r.id
			}

	# Check high priority todos
	todos = session.exec(select(Todo).where(Todo.done == False)).all()
	for t in todos:
		if t.priority == 'high' and t.remind_at and t.remind_at <= now:
			return {
				"type": "todo",
				"priority": "high",
				"message": t.text,
				"id": t.id
			}

	# Check internships with offer/interview status
	internships = session.exec(select(Internship)).all()
	for i in internships:
		if i.status in ('offer', 'interview') and i.priority == 'high':
			return {
				"type": "internship",
				"priority": "high",
				"message": f"{i.company} — {i.status.upper()} needs attention",
				"id": i.id
			}

	# Check medium priority alarms firing
	for r in reminders:
		if r.remind_at and r.remind_at <= now:
			return {
				"type": "reminder",
				"priority": r.priority,
				"message": r.text,
				"id": r.id
			}

	# Nothing urgent
	return {
		"type": "none",
		"priority": "low",
		"message": "Nothing urgent right now",
		"id": None
	}