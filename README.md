# AI Assistant

A production-ready full-stack AI chat platform with Google OAuth login, multi-model Gemini support, streaming responses, file uploads, and container/Kubernetes deployment support.

## Live Deployment

- Production URL: https://ai.jayshinde.tech
- SPA routing fallback is configured with Netlify redirects in [AI-Assistant-frontend/public/_redirects](AI-Assistant-frontend/public/_redirects)

## Highlights

- Google OAuth authentication with secure token verification
- Persistent chat sessions with per-chat model selection
- Real-time streaming AI responses
- Temporary chat mode (stateless, not stored in database)
- File upload support (images, PDF, text)
- Activity logging and audit trail endpoint
- Dark/light theme and responsive UI
- Docker and Kubernetes manifests included

## Tech Stack

### Frontend

- React 19
- Vite
- React Router DOM
- Ant Design
- Axios
- React Markdown
- Google OAuth (client)

### Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Uvicorn
- Google Gemini API
- Google OAuth token verification
- Python multipart upload handling

### DevOps / Deployment

- Docker (backend Dockerfile)
- Docker Compose orchestration
- Kubernetes manifests (Deployment + Service)
- Minikube (local K8s)
- Netlify SPA redirect rule

## Repository Structure

    AI-Assistant/
    ├── docker-compose.yaml
    ├── README.md
    ├── AI-Assistant-backend/
    │   ├── Dockerfile
    │   ├── deployment.yaml
    │   ├── service.yaml
    │   ├── requirements.txt
    │   ├── uploads/
    │   └── app/
    │       ├── main.py
    │       ├── config.py
    │       ├── database.py
    │       ├── models/
    │       ├── routes/
    │       ├── schemas/
    │       ├── services/
    │       └── utils/
    └── AI-Assistant-frontend/
        ├── package.json
        ├── vite.config.js
        ├── public/
        │   └── _redirects
        └── src/
            ├── components/
            ├── constants/
            ├── context/
            ├── hooks/
            ├── pages/
            └── services/

## Application Flow

1. User signs in with Google on frontend.
2. Frontend sends Google token to backend auth endpoint.
3. Backend verifies token with Google and creates/updates user record.
4. Authenticated user creates chat sessions and selects model.
5. Messages are stored in PostgreSQL.
6. Backend sends recent history to Gemini and returns reply (normal or stream).
7. Optional file uploads are stored and linked with message metadata.
8. Activity events are written to logs table for observability.

## API Overview

Base path for API routes is /api.

### Health and Logs

- GET /api/
- GET /api/logs?limit=100

### Authentication

- POST /api/auth/google
- GET /api/auth/me

### Chats

- GET /api/chats/
- POST /api/chats/
- PUT /api/chats/{chat_id}
- DELETE /api/chats/{chat_id}

### Messages

- GET /api/chats/{chat_id}/messages
- POST /api/chats/{chat_id}/messages
- POST /api/chats/{chat_id}/messages/stream
- POST /api/chats/temp

### Uploads

- POST /api/upload

## Local Development Setup

## 1) Prerequisites

- Python 3.11+
- Node.js 20+
- npm
- PostgreSQL
- Google OAuth client credentials
- Gemini API key

## 2) Backend Setup

    cd AI-Assistant-backend
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt

Create a backend .env file in AI-Assistant-backend with:

    DATABASE_URL=postgresql://username:password@localhost:5432/ai_assistant
    GEMINI_API_KEY=your_gemini_api_key
    GOOGLE_CLIENT_ID=your_google_oauth_client_id
    MAX_HISTORY_MESSAGES=20
    MAX_UPLOAD_SIZE_BYTES=5242880

Run backend:

    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

## 3) Frontend Setup

    cd AI-Assistant-frontend
    npm install

Create a frontend .env file in AI-Assistant-frontend with:

    VITE_API_BASE_URL=http://localhost:8000/api
    VITE_UPLOADS_BASE_URL=http://localhost:8000/uploads
    VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id

Run frontend:

    npm run dev

## 4) Access Locally

- Frontend: http://localhost:5173
- Backend API docs: http://localhost:8000/docs
- Backend health: http://localhost:8000/api/

## Docker

From repository root:

    docker compose up --build

Compose file: [docker-compose.yaml](docker-compose.yaml)

## Kubernetes and Minikube

Backend Kubernetes manifests are in [AI-Assistant-backend/deployment.yaml](AI-Assistant-backend/deployment.yaml) and [AI-Assistant-backend/service.yaml](AI-Assistant-backend/service.yaml).

Typical local Minikube flow:

    minikube start
    minikube -p minikube docker-env | Invoke-Expression
    cd AI-Assistant-backend
    docker build -t ai-backend:latest .
    kubectl apply -f deployment.yaml
    kubectl apply -f service.yaml
    kubectl get pods
    kubectl get svc
    minikube service fastapi-service --url

Important: deployment expects Kubernetes resources named ai-backend-secret and ai-backend-config.

## SPA Redirects

For client-side routing in production, the redirect rule is configured here:

- [AI-Assistant-frontend/public/_redirects](AI-Assistant-frontend/public/_redirects)

Rule used:

    /*    /index.html   200

## Security Notes

- Google token is validated server-side before granting access
- Protected routes require Authorization: Bearer token
- CORS allowlist is configured in backend app startup
- Uploaded files are validated for MIME type and size

## Observability

- Structured activity logs are persisted in database table activity_logs
- Log endpoint is available at GET /api/logs

