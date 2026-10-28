import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    # Enable reload only in local dev when not in Docker production
    reload = os.environ.get("RELOAD", "true").lower() in ("true", "1")
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=reload)
