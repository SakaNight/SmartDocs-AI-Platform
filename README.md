## Docker 部署

### 构建并运行（仅 FastAPI）
```bash
docker build -t smartdocs-api .
docker run -p 8000:8000 --env-file .env smartdocs-api
```

### 一键启动（FastAPI + PostgreSQL）
```bash
docker-compose up --build
```

- FastAPI 服务将运行在 http://localhost:8000
- PostgreSQL 服务将运行在本地 5434 端口

如需自定义环境变量，请修改 `.env` 或 `docker-compose.yml` 中的配置。 