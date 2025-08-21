from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List
import re


def split_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 50) -> List[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ".", "!", "?", "。", "！", "？"]
    )
    return splitter.split_text(text)

def split_sentences(text):
    return [s.strip() for s in re.split(r'(?<=[。！？.!?])', text) if s.strip()]
