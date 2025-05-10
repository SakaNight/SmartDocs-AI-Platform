from sqlalchemy.orm import Session
from app.models.api_log import APILog

def log_api_call(db: Session, username: str, endpoint: str, method: str, status_code: int):
    log = APILog(
        username=username,
        endpoint=endpoint,
        method=method,
        status_code=status_code
    )
    db.add(log)
    db.commit() 