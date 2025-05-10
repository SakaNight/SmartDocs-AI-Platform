from fastapi import APIRouter, Body
from app.services.splitter import split_sentences
from app.services.embedding import embed_texts
from app.services.faiss_index import FaissService
import json
import os

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
def embed_doc(text: str = Body(..., embed=True)):
    chunks = split_sentences(text)
    vectors = embed_texts(chunks)
    faiss_service.add(vectors)
    append_chunks(chunks)
    return {"chunks": chunks, "vectors": vectors} 