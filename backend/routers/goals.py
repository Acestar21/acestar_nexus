from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Goal

router = APIRouter()

@router.get("/", response_model=List[Goal])
def get_goals(session: Session = Depends(get_session)):
    return session.exec(select(Goal)).all()

@router.post("/", response_model=Goal)
def create_goal(goal: Goal, session: Session = Depends(get_session)):
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

# Line : 21 , data : dict , currently can accept any field, later would work for better alternative