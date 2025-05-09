from fastapi import FastAPI
from app.api import embed, ask, auth, admin

app = FastAPI(title="SmartDocs AI API Platform")

app.include_router(embed.router, prefix="/embed", tags=["Embed"])
app.include_router(ask.router, prefix="/ask", tags=["Ask"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

@app.get("/ping")
def ping():
    return {"message": "pong"} 