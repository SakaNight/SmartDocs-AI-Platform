# SmartDocs AI Platform

A Retrieval-Augmented Generation (RAG) document Q&A platform with FastAPI backend, React + Ant Design frontend, HuggingFace Transformers, FAISS, PostgreSQL, JWT authentication, RBAC, logging, and Docker/AWS deployment support.

---

## Screenshots

### Welcome Page
![Landing](screenshots/landing.jpg)

---

### RAG Playground
![RAG Playground](screenshots/playground.jpg)

---

### Document Management
![Document Management](screenshots/doc-management.jpg)

---

### Admin Panel – Platform Stats & API Logs
![Stats](screenshots/stats.jpg)
![Stats](screenshots/api-log.jpg)

---

### Admin Panel – User Management
![Users](screenshots/user-management.jpg)

---

## Features

- Document Embedding & RAG Q&A (HuggingFace Transformers, FAISS)
- PDF Upload & Text Extraction
- Q&A with context retrieval
- User Authentication (JWT)
- Role-Based Access Control (RBAC: user/admin)
- API Request Logging & Admin Dashboard
- Statistics: User/Request/Active Users
- PostgreSQL Database (SQLAlchemy ORM)
- React + Ant Design Frontend
- Docker & Docker Compose Support
- AWS ECS Fargate + RDS Production Deployment
- CI/CD with GitHub Actions

---

## Project Structure

```
SmartDocs-AI-Platform/
├── app/                # FastAPI backend
│   ├── api/            # API routers (embed, ask, auth, admin)
│   ├── core/           # Config, security, dependencies
│   ├── db/             # Database models & session
│   ├── models/         # SQLAlchemy models
│   ├── services/       # Embedding, splitter, faiss, log, user
│   └── main.py         # FastAPI entrypoint
├── smartdocs-admin/    # React + Ant Design frontend (Vite + TS)
│   ├── src/
│   │   ├── pages/      # Home, Stats, Logs, Login, etc.
│   │   └── ...
│   └── ...
├── docker-compose.yml  # Local dev: backend + db
├── Dockerfile          # Backend Docker build
├── requirements.txt    # Python backend dependencies
├── README.md           # Project documentation
└── .github/workflows/  # GitHub Actions CI/CD
```

---

## Tech Stack

- Backend: FastAPI, SQLAlchemy, HuggingFace Transformers, FAISS, PyPDF, JWT, RBAC
- Frontend: React (Vite, Ant Design, TypeScript), Nginx static hosting
- Database: PostgreSQL (local & AWS RDS)
- Deployment: Docker, Docker Compose (local), AWS ECS Fargate (backend), AWS RDS (database), AWS S3 + ALB (frontend)
- CI/CD: GitHub Actions (lint, test, build, push, deploy)

---

## Local Development

   ```bash
   # Start backend + DB
   docker-compose up -d
   
   # Backend runs on http://localhost:8000
   # Frontend runs on http://localhost:5173 (Vite dev server)
   
   # Environment variables (smartdocs-admin/.env)
   VITE_API_BASE_URL=http://localhost:8000
   ```

---

## Production Deployment (AWS)

### Backend
- Docker image built from Dockerfile
- Deployed to AWS ECS Fargate, fronted by an Application Load Balancer (ALB)
- Logs aggregated via CloudWatch

### Database
- AWS RDS PostgreSQL
- Credentials and DB endpoint provided via ECS Task Definition (env vars from Secrets Manager/SSM)

### Frontend
- React/Vite app built via GitHub Actions
- Served as static files with Nginx
- Synced to S3 bucket and optionally behind CloudFront for HTTPS/CDN

### CI/CD (GitHub Actions)
- On each push to main:
	1.	Run flake8 linting and pytest
	2.	Build Docker image → push to GitHub Container Registry
	3.	Update ECS service with new image (zero-downtime deploy)
	4.	Build frontend (inject VITE_API_BASE_URL via .env.production)
	5.	Sync static assets to S3
	6.	(Optional) Invalidate CloudFront cache

---

## API Endpoints

- `/embed/`   - Upload & embed documents (PDF)
- `/ask/`     - Ask questions (RAG Q&A)
- `/auth/register` - User registration
- `/auth/login`    - User login (JWT)
- `/auth/me`       - Get current user info
- `/admin/stats`   - Admin: statistics
- `/admin/logs`    - Admin: API logs
- `/admin/users`   - Admin: user management
- `/ping`          - Health check
- `/docs`          - Swagger UI (API docs & test)

---

## Environment Variables

Backend (.env / ECS Task Definition):
```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=smartdocs
POSTGRES_USER=smartuser
POSTGRES_PASSWORD=yourpassword
SECRET_KEY=supersecretkey
````

Frontend (smartdocs-admin/.env):
```env
VITE_API_BASE_URL=http://localhost:8000
````

Frontend (production, injected in CI/CD):
```env
VITE_API_BASE_URL=https://<your-alb-dns>
````

---

## License

MIT © 2025 [Aries Chen]
