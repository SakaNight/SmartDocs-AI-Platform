from sqlalchemy import Column, Integer, String, DateTime, func
from app.db.database import Base

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(256), nullable=False)
    upload_time = Column(DateTime(timezone=True), server_default=func.now())
    chunk_count = Column(Integer, default=0)
    status = Column(String(32), default="embedded") 