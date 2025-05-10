from fastapi import APIRouter, Depends
from app.core.deps import require_role

router = APIRouter()

@router.get("/stats")
def stats(user=Depends(require_role("admin"))):
    return {"message": "Admin stats endpoint (admin only)", "user": user} 