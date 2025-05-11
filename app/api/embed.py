from fastapi import APIRouter, Body, File, UploadFile, HTTPException
from app.services.splitter import split_sentences
from app.services.embedding import embed_texts
from app.services.faiss_index import FaissService
from app.services.pdf_utils import extract_text_from_pdf
import json
import os
import io

router = APIRouter()

# 初始化 FAISS 服务（假设 embedding 维度为 384）
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
    if file and file.filename.lower().endswith(".pdf"):
        pdf_bytes = await file.read()
        pdf_text = extract_text_from_pdf(io.BytesIO(pdf_bytes))
        if not pdf_text.strip():
            raise HTTPException(status_code=400, detail="No text extracted from PDF.")
        chunks = split_sentences(pdf_text)
    elif text:
        chunks = split_sentences(text)
    else:
        raise HTTPException(status_code=400, detail="No input text or PDF file provided.")
    vectors = embed_texts(chunks)
    faiss_service.add(vectors)
    append_chunks(chunks)
    return {"chunks": chunks, "vectors": vectors} 