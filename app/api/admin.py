from fastapi import APIRouter

router = APIRouter()

@router.get("/stats")
def stats():
    return {"message": "Admin stats endpoint placeholder"} 