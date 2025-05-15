from fastapi import APIRouter, Body, File, UploadFile, HTTPException
from app.services.splitter import split_sentences
from app.services.embedding import embed_texts
from app.services.faiss_index import FaissService
from app.services.pdf_utils import extract_text_from_pdf
from app.models.document import Document
from app.db.database import SessionLocal
import json
import os
import io

router = APIRouter()

faiss_service = FaissService(dim=384)
CHUNKS_PATH = "chunks.json"

def append_chunks(chunks):
    if os.path.exists(CHUNKS_PATH):
        with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
            all_chunks = json.load(f)
    else:
        all_chunks = []
    all_chunks.extend(chunks)
    with open(CHUNKS_PATH, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)

@router.post("/")
async def embed_doc(
    text: str = Body(None, embed=True),
    file: UploadFile = File(None)
):
    db = SessionLocal()
    try:
        if file and file.filename.lower().endswith(".pdf"):
            pdf_bytes = await file.read()
            pdf_text = extract_text_from_pdf(io.BytesIO(pdf_bytes))
            if not pdf_text.strip():
                raise HTTPException(status_code=400, detail="No text extracted from PDF.")
            chunks = [c for c in split_sentences(pdf_text) if c.strip()]
            filename = file.filename
        elif text:
            chunks = [c for c in split_sentences(text) if c.strip()]
            filename = "text_input.txt"
        else:
            raise HTTPException(status_code=400, detail="No input text or PDF file provided.")
        vectors = embed_texts(chunks)
        faiss_service.add(vectors)
        append_chunks(chunks)
        
        doc = Document(filename=filename, chunk_count=len(chunks), status="embedded")
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return {"chunks": chunks, "vectors": vectors, "doc_id": doc.id}
    finally:
        db.close() 
