from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from database import get_session
from models import Todo

router = APIRouter()

@router.get("/", response_model=List[Todo])
def get_to_do(session: Session = Depends(get_session)):
    return session.exec(select(Todo)).all()

@router.post("/", response_model=Todo)
def create_to_do(to_do: Todo, session: Session = Depends(get_session)):
    session.add(to_do)
    session.commit()
    session.refresh(to_do)
    return to_do

@router.patch("/{id}", response_model=Todo)
def update_to_do(id: int, data: dict, session: Session = Depends(get_session)):
    to_do = session.get(Todo, id)
    if not to_do:
        raise HTTPException(status_code=404, detail="Not found")
    for key, value in data.items():
        setattr(to_do, key, value)
    session.add(to_do)
    session.commit()
    session.refresh(to_do)
    return to_do

@router.delete("/{id}")
def delete_to_do(id: int, session: Session = Depends(get_session)):
    to_do = session.get(Todo, id)
    if not to_do:
        raise HTTPException(status_code=404, detail="Not found")
    session.delete(to_do)
    session.commit()
    return {"ok": True}