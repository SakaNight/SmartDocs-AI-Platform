import faiss
import numpy as np
from typing import List
import os

class FaissService:
    def __init__(self, dim: int, index_path: str = "faiss.index"):
        self.dim = dim
        self.index_path = index_path
        if os.path.exists(index_path):
            self.index = faiss.read_index(index_path)
        else:
            self.index = faiss.IndexFlatL2(dim)

    def add(self, vectors: List[List[float]]):
        arr = np.array(vectors).astype('float32')
        self.index.add(arr)
        self.save()

    def save(self):
        faiss.write_index(self.index, self.index_path)

    def search(self, vector: List[float], top_k: int = 5):
        arr = np.array([vector]).astype('float32')
        D, I = self.index.search(arr, top_k)
        return I[0], D[0]

    def get_index_size(self):
        return self.index.ntotal 