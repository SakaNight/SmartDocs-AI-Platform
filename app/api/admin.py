from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from app.core.deps import require_role
from app.db.database import SessionLocal
from app.models.api_log import APILog
from app.models.user import User
from app.services.user_service import create_user, get_user_by_username
from datetime import datetime, timedelta
from app.models.document import Document
from app.services.embedding import embed_texts
from app.services.splitter import split_sentences
from app.services.faiss_index import FaissService
from app.services.pdf_utils import extract_text_from_pdf
import io, os

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

@router.get("/docs")
def list_docs(skip: int = 0, limit: int = 20, db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    docs = db.query(Document).order_by(Document.id.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": d.id,
            "filename": d.filename,
            "upload_time": d.upload_time,
            "chunk_count": d.chunk_count,
            "status": d.status
        } for d in docs
    ]

@router.delete("/docs/{doc_id}")
def delete_doc(doc_id: int, db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    d = db.query(Document).filter(Document.id == doc_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Document not found")
    db.delete(d)
    db.commit()
    return {"msg": "Document deleted"}

@router.get("/docs/{doc_id}/chunks")
def get_doc_chunks(doc_id: int, db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    d = db.query(Document).filter(Document.id == doc_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Document not found")
    # 这里假设chunks信息存储在chunks.json，按顺序分配给文档
    import json, os
    CHUNKS_PATH = "chunks.json"
    if not os.path.exists(CHUNKS_PATH):
        return {"chunks": []}
    with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
        all_chunks = json.load(f)
    # 简单实现：假设每个文档的chunks是连续分配的
    start = 0
    for doc in db.query(Document).order_by(Document.id):
        if doc.id == doc_id:
            end = start + doc.chunk_count
            return {"chunks": all_chunks[start:end]}
        start += doc.chunk_count
    return {"chunks": []}

@router.post("/docs/{doc_id}/reembed")
def reembed_doc(doc_id: int, db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # 重新分片和嵌入
    # 假设原始文件还在本地 upload 文件夹
    upload_path = os.path.join("uploads", doc.filename)
    if not os.path.exists(upload_path):
        raise HTTPException(status_code=404, detail="Original file not found")
    with open(upload_path, "rb") as f:
        if doc.filename.lower().endswith(".pdf"):
            pdf_text = extract_text_from_pdf(io.BytesIO(f.read()))
            chunks = [c for c in split_sentences(pdf_text) if c.strip()]
        else:
            text = f.read().decode("utf-8")
            chunks = [c for c in split_sentences(text) if c.strip()]
    vectors = embed_texts(chunks)
    # 重新写入FAISS和chunks.json（此处简单实现，实际应支持增量/替换）
    faiss_service = FaissService(dim=len(vectors[0]))
    faiss_service.add(vectors)
    # 追加到chunks.json
    CHUNKS_PATH = "chunks.json"
    if os.path.exists(CHUNKS_PATH):
        with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
            all_chunks = json.load(f)
    else:
        all_chunks = []
    all_chunks.extend(chunks)
    with open(CHUNKS_PATH, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)
    doc.chunk_count = len(chunks)
    doc.status = "re-embedded"
    db.commit()
    return {"msg": "Re-embedded", "chunk_count": len(chunks)}

@router.delete("/docs/{doc_id}/embedding")
def delete_doc_embedding(doc_id: int, db: Session = Depends(get_db), user=Depends(require_role("admin"))):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # 这里只做标记，不实际删除FAISS和chunks（如需彻底删除需实现向量和分片的物理删除）
    doc.status = "embedding_deleted"
    db.commit()
    return {"msg": "Embedding deleted (logical)"} 