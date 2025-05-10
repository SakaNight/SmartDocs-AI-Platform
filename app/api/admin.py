from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.deps import require_role
from app.db.database import SessionLocal
from app.models.api_log import APILog

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

router = APIRouter()

@router.get("/stats")
def stats(user=Depends(require_role("admin"))):
    return {"message": "Admin stats endpoint (admin only)", "user": user}

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