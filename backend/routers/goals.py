from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Goal
from datetime import date

router = APIRouter()

@router.get("/", response_model=List[Goal])
def get_goals(session: Session = Depends(get_session)):
    return session.exec(select(Goal)).all()

@router.post("/", response_model=Goal)
def create_goal(goal: Goal, session: Session = Depends(get_session)):
    if isinstance(goal.start_date, str):
        goal.start_date = date.fromisoformat(goal.start_date)
    if isinstance(goal.end_date, str):
        goal.end_date = date.fromisoformat(goal.end_date)
    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal

@router.patch("/{id}", response_model=Goal)
def update_goal(id: int, data: dict, session: Session = Depends(get_session)): 
    goal = session.get(Goal , id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not Found")
    for key, value in data.items():
        setattr(goal, key, value)
    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal

@router.delete("/{id}")
def delete_goal(id: int, session: Session = Depends(get_session)):
    goal = session.get(Goal, id)
    if not goal:
        raise HTTPException(status_code=404, detail="Not found")
    session.delete(goal)
    session.commit()
    return {"ok": True}

@router.get("/{id}/progress")
def get_goal_progress(id: int, session: Session = Depends(get_session)):
	goal = session.get(Goal, id)
	if not goal:
		raise HTTPException(status_code=404, detail="Not found")
	
	today = date.today()
	total_days = (goal.end_date - goal.start_date).days
	days_elapsed = (today - goal.start_date).days
	weeks_elapsed = days_elapsed // 7
	weeks_total = total_days // 7
	weeks_remaining = weeks_total - weeks_elapsed
	expected_by_now = round((days_elapsed / total_days) * goal.target)
	weekly_target = round(goal.target / weeks_total) if weeks_total > 0 else 0

	return {
		"goal": goal,
        "current": goal.current,
		"weeks_elapsed": weeks_elapsed,
		"weeks_remaining": weeks_remaining,
		"weekly_target": weekly_target,
		"expected_by_now": expected_by_now,
        "on_track": goal.current >= expected_by_now,
        "deadline_close": weeks_remaining <= 2 and goal.current < goal.target
	}


# Line : 21 , data : dict , currently can accept any field, later would work for better alternative