from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.services.user_service import create_user, authenticate_user, get_user_by_username
from app.core.security import create_access_token

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(
    username: str = Body(...),
    email: str = Body(...),
    password: str = Body(...),
    db: Session = Depends(get_db)
):
    if get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail="Username already registered")
    user = create_user(db, username, email, password)
    return {"msg": "User registered", "user_id": user.id}

@router.post("/login")
def login(
    username: str = Body(...),
    password: str = Body(...),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": user.username, "role": user.role})
    return {"access_token": token, "token_type": "bearer"} 