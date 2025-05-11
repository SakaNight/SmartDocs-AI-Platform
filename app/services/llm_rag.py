from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch
import threading

_MODEL_NAME = "Qwen/Qwen2-0.5B-Chat"
_model = None
_tokenizer = None
_pipe = None
_model_lock = threading.Lock()

def get_llm():
    global _model, _tokenizer, _pipe
    with _model_lock:
        if _model is None or _tokenizer is None or _pipe is None:
            _tokenizer = AutoTokenizer.from_pretrained(_MODEL_NAME)
            _model = AutoModelForCausalLM.from_pretrained(_MODEL_NAME, torch_dtype=torch.float32)
            _pipe = pipeline("text-generation", model=_model, tokenizer=_tokenizer, max_new_tokens=256)
        return _pipe

def rag_generate(query: str, retrieved_chunks: list[str]) -> str:
    context = "\n".join(retrieved_chunks)
    prompt = f"Context:\n{context}\n\nQuestion: {query}\n\nPlease answer the question based on the context above:"
    pipe = get_llm()
    result = pipe(prompt)
    return result[0]["generated_text"][len(prompt):].strip() 