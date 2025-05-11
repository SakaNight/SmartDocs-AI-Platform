# SmartDocs AI Platform

A RAG-based document Q&A platform with FastAPI backend and React frontend.

## Features

- Document splitting and embedding
- Vector search with FAISS
- RAG-based Q&A using HuggingFace models
- User authentication and RBAC
- Admin dashboard
- Docker containerization
- CI/CD with GitHub Actions
- AWS deployment

## Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/SmartDocs-AI-Platform.git
cd SmartDocs-AI-Platform
```

2. Install dependencies:
```bash
# Backend
pip install -r requirements.txt

# Frontend
cd smartdocs-admin
npm install
```

3. Start the development servers:
```bash
# Backend
uvicorn app.main:app --reload

# Frontend
cd smartdocs-admin
npm start
```

## Docker Deployment

1. Build the Docker image:
```bash
docker build -t smartdocs .
```

2. Run the container:
```bash
docker run -p 8000:8000 smartdocs
```

## AWS Deployment

1. Set up AWS resources:
   - Create an ECS cluster
   - Create an RDS PostgreSQL instance
   - Set up VPC and security groups
   - Create IAM roles for ECS tasks

2. Configure GitHub Secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `DATABASE_URL`
   - `SECRET_KEY`

3. Update task-definition.json:
   - Replace `YOUR_ACCOUNT_ID` with your AWS account ID
   - Replace `YOUR_USERNAME` with your GitHub username
   - Update environment variables

4. Push to main branch to trigger deployment:
```bash
git push origin main
```

## CI/CD Pipeline

The project uses GitHub Actions for CI/CD:

1. **Test**: Runs linting and unit tests
2. **Build**: Builds and pushes Docker image to GitHub Container Registry
3. **Deploy**: Deploys to AWS ECS Fargate

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `MODEL_PATH`: Path to HuggingFace model
- `EMBEDDING_MODEL`: HuggingFace embedding model name

## License

MIT 