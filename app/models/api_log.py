from sqlalchemy import Column, Integer, String, DateTime, func
from app.db.database import Base

class APILog(Base):
    __tablename__ = "api_logs"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), index=True)
    endpoint = Column(String(128))
    method = Column(String(10))
    status_code = Column(Integer)
    timestamp = Column(DateTime(timezone=True), server_default=func.now()) 