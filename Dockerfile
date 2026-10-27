# ==============================================================================
# CardioSense AI — Multi-Stage Production Dockerfile
# Serves both the AI Auscultation FastAPI Backend & React Web Interface
# ==============================================================================

# Stage 1: Build the React Web Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Production Python Runtime
FROM python:3.12-slim AS runner

WORKDIR /app

# Install system audio and DSP dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU wheels (keeps Docker image lightweight < 600MB)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    torch torchaudio torchvision

# Install Python backend dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend, Weights, and Models
COPY backend/ ./backend/
COPY data/ ./data/

# Copy built React frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Environment settings
ENV PYTHONUNBUFFERED=1 \
    PORT=8000 \
    MPLCONFIGDIR=/tmp/matplotlib

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Start Uvicorn
CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT}"]

