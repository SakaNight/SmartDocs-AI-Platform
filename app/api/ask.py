from fastapi import APIRouter

router = APIRouter()

@router.post("/")
def ask():
    return {"message": "Ask endpoint placeholder"} 