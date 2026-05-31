from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Internship
from datetime import datetime,date

router = APIRouter()

@router.get("/", response_model=List[Internship])
def get_internships(session: Session = Depends(get_session)):
    return session.exec(select(Internship)).all()

@router.post("/", response_model=Internship)
def create_internship(internship: Internship, session: Session = Depends(get_session)):
    if isinstance(internship.followup_at, str):
        internship.followup_at = datetime.fromisoformat(internship.followup_at)
    if isinstance(internship.applied_at, str):
        internship.applied_at = date.fromisoformat(internship.applied_at)
    session.add(internship)
    session.commit()
    session.refresh(internship)
    return internship

@router.patch("/{id}", response_model=Internship)
def update_internship(id: int, data: dict, session: Session = Depends(get_session)):
    internship = session.get(Internship, id)
    if not internship:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in data.items():
        setattr(internship, key, value)
    session.add(internship)
    session.commit()
    session.refresh(internship)
    return internship

@router.delete("/{id}")
def delete_internship(id: int, session: Session = Depends(get_session)):
    internship = session.get(Internship, id)
    if not internship:
        raise HTTPException(status_code=404, detail="Not found")
    session.delete(internship)
    session.commit()
    return {"ok": True}