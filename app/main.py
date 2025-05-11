from fastapi import FastAPI, Request, Response, status
from app.api import embed, ask, auth, admin
from app.db.database import SessionLocal, Base, engine
from app.services.log_service import log_api_call
from app.core.deps import get_current_user
from app.models import user, api_log
import asyncio
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SmartDocs AI API Platform")

# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 可根据需要指定前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 自动建表
Base.metadata.create_all(bind=engine)

app.include_router(embed.router, prefix="/embed", tags=["Embed"])
app.include_router(ask.router, prefix="/ask", tags=["Ask"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

@app.get("/ping")
def ping():
    return {"message": "pong"}

@app.middleware("http")
async def log_requests(request: Request, call_next):
    response: Response = await call_next(request)
    try:
        db = SessionLocal()
        username = "anonymous"
        # 尝试获取当前用户
        auth = request.headers.get("authorization")
        if auth and auth.startswith("Bearer "):
            token = auth.split(" ", 1)[1]
            payload = await asyncio.to_thread(get_current_user, token)
            if payload and isinstance(payload, dict):
                username = payload.get("sub", "anonymous")
        log_api_call(
            db,
            username=username,
            endpoint=request.url.path,
            method=request.method,
            status_code=response.status_code
        )
    except Exception:
        pass
    finally:
        if 'db' in locals():
            db.close()
    return response 