## Stage 1: build the static Next.js frontend
FROM node:22-slim AS frontend-builder

WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

## Stage 2: FastAPI backend, serving the built frontend as static files
FROM python:3.12-slim AS backend

RUN pip install --no-cache-dir uv

WORKDIR /app
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --locked --no-install-project

COPY backend/app ./app
COPY --from=frontend-builder /frontend/out ./static

ENV STATIC_DIR=/app/static \
    DATABASE_PATH=/app/data/prelegal.db \
    PATH="/app/.venv/bin:${PATH}"

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
