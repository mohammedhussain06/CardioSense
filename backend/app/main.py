import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.app.core.database import init_db
from backend.app.api.predict import router as predict_router
from backend.app.api.history import router as history_router
from backend.app.api.samples import router as samples_router
from backend.app.api.eval_report import router as eval_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes SQLite database tables on server startup."""
    print("[CardioSense] Initializing SQLite database...")
    await init_db()
    print("[CardioSense] Database ready.")
    yield


app = FastAPI(
    title="CardioSense API",
    description="Intelligent Phonocardiogram (PCG) Heart Sound Analysis & Auscultation Decision Support Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for local and deployed frontend/mobile clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(predict_router)
app.include_router(history_router)
app.include_router(samples_router)
app.include_router(eval_router)


@app.get("/health", tags=["Health"])
async def health_check():
    """Returns server status, compute device, and DSP version."""
    import torch
    return {
        "status": "online",
        "service": "CardioSense Auscultation Intelligence API",
        "version": "1.0.0",
        "compute_device": "cuda" if torch.cuda.is_available() else "cpu",
        "dsp_pipeline": "Butterworth 4th-Order 20-200Hz Bandpass + 2kHz Resampling"
    }


# Mount production frontend build if available (Serves Web UI at /)
FRONTEND_DIST_CANDIDATES = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../frontend/dist")),
    "/app/frontend/dist",
    "frontend/dist",
]
FRONTEND_DIST = next((p for p in FRONTEND_DIST_CANDIDATES if os.path.isdir(p)), None)
if FRONTEND_DIST:
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
