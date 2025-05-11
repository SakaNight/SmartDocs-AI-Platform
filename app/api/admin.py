from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import require_role
from app.db.database import SessionLocal
from app.models.api_log import APILog
from app.models.user import User
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