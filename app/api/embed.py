from fastapi import APIRouter

router = APIRouter()

@router.post("/")
def embed_doc():
    return {"message": "Embed endpoint placeholder"} 