import os
from dotenv import load_dotenv

load_dotenv()

# 优先使用 DATABASE_URL 环境变量，否则回退到分解式配置
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
if not SQLALCHEMY_DATABASE_URL:
    POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
    POSTGRES_DB = os.getenv("POSTGRES_DB", "smartdocs")
    POSTGRES_USER = os.getenv("POSTGRES_USER", "smartuser")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "yourpassword")
    SQLALCHEMY_DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}" 