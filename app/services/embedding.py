from sentence_transformers import SentenceTransformer
from typing import List
import threading

_model = None
_model_lock = threading.Lock()

def get_model():
    global _model
    with _model_lock:
        if _model is None:
            _model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        return _model

def embed_texts(texts: List[str]) -> List[List[float]]:
    model = get_model()
    return model.encode(texts, show_progress_bar=False).tolist() 
