from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from app.core.deps import require_role
from app.db.database import SessionLocal
from app.models.api_log import APILog
from app.models.user import User
from app.services.user_service import create_user, get_user_by_username
from datetime import datetime, timedelta

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()

@router.get("/stats")
def stats(db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    user_count = db.query(User).count()
    log_count = db.query(APILog).count()
    since = datetime.utcnow() - timedelta(days=1)
    recent_logs = db.query(APILog).filter(APILog.timestamp >= since).all()
    recent_count = len(recent_logs)
    active_users = len(set(log.username for log in recent_logs if log.username and log.username != "anonymous"))
    return {
        "user_count": user_count,
        "log_count": log_count,
        "recent_24h_count": recent_count,
        "recent_24h_active_users": active_users
    }

# 日志查询接口
@router.get("/logs")
def get_logs(skip: int = 0, limit: int = 20, db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    logs = db.query(APILog).order_by(APILog.timestamp.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": log.id,
            "username": log.username,
            "endpoint": log.endpoint,
            "method": log.method,
            "status_code": log.status_code,
            "timestamp": log.timestamp
        }
        for log in logs
    ]

@router.get("/users")
def list_users(skip: int = 0, limit: int = 20, q: str = "", db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    query = db.query(User)
    if q:
        query = query.filter((User.username.ilike(f"%{q}%")) | (User.email.ilike(f"%{q}%")))
    users = query.order_by(User.id.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at
        } for u in users
    ]

@router.post("/users")
def create_user_admin(
    username: str = Body(...),
    email: str = Body(...),
    password: str = Body(...),
    role: str = Body("user"),
    db: Session = Depends(get_db),
    user=Depends(require_role("admin"))
):
    if get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail="Username already registered")
    u = create_user(db, username, email, password, role)
    return {"msg": "User created", "user_id": u.id}

@router.put("/users/{user_id}")
def update_user_admin(
    user_id: int,
    email: str = Body(None),
    role: str = Body(None),
    db: Session = Depends(get_db),
    user=Depends(require_role("admin"))
):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    if email:
        u.email = email
    if role:
        u.role = role
    db.commit()
    db.refresh(u)
    return {"msg": "User updated"}

@router.delete("/users/{user_id}")
def delete_user_admin(user_id: int, db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(u)
    db.commit()
    return {"msg": "User deleted"}

@router.post("/users/{user_id}/reset_password")
def reset_password_admin(user_id: int, new_password: str = Body(...), db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    from app.core.security import hash_password
    u.password_hash = hash_password(new_password)
    db.commit()
    return {"msg": "Password reset"} 