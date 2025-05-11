from fastapi import APIRouter, Body
from app.services.embedding import embed_texts
from app.services.faiss_index import FaissService
from app.services.llm_rag import rag_generate
import json
import os
from typing import List, Dict, Any

router = APIRouter()

# 假设与 /embed 用同一个 faiss.index，维度为 384
faiss_service = FaissService(dim=384)
CHUNKS_PATH = "chunks.json"

def load_chunks() -> List[str]:
    if os.path.exists(CHUNKS_PATH):
        with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@router.post("/")
def ask(
    query: str = Body(..., embed=True),
    history: List[Dict[str, Any]] = Body(default=[], embed=True)
):
    context = "\n".join([f"{h['role']}: {h['content']}" for h in history])
    full_query = context + "\nuser: " + query if context else query
    vector = embed_texts([full_query])[0]
    idxs, scores = faiss_service.search(vector, top_k=3)
    chunks = load_chunks()
    retrieved = []
    for idx, score in zip(idxs, scores):
        if 0 <= idx < len(chunks):
            retrieved.append(chunks[idx])
    answer = rag_generate(query, retrieved)
    return {
        "answer": answer,
        "retrieved": retrieved
    } 