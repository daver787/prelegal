# Stage 1: Build Next.js static frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Stage 2: Python backend
FROM python:3.12-slim
WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

COPY backend/pyproject.toml /app/backend/pyproject.toml
RUN uv pip install --system --no-cache fastapi "uvicorn[standard]"

COPY backend/ /app/backend/
COPY --from=frontend-builder /frontend/out /app/backend/static/

RUN mkdir -p /app/data

EXPOSE 8000
WORKDIR /app/backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
