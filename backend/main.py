"""FastAPI application entry point — startup lifecycle, route mounting, and static file serving."""

import os
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.config import MODEL_NAME, NUM_QUESTIONS, OLLAMA_BASE_URL
from backend.database import close_db, init_db
from backend.routes import router
from backend.seed_data import seed_demo_interviews


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: init DB, seed demo data, ensure LLM model is pulled. Shutdown: close DB."""
    # Database
    print("Connecting to MySQL...")
    await init_db()
    print("MySQL ready.")

    await seed_demo_interviews()

    # Ollama model
    async with httpx.AsyncClient(timeout=600.0) as client:
        resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
        model_names = [m["name"] for m in resp.json().get("models", [])]

        if MODEL_NAME not in model_names:
            print(f"Pulling model {MODEL_NAME}... (this may take a few minutes on first run)")
            await client.post(
                f"{OLLAMA_BASE_URL}/api/pull",
                json={"model": MODEL_NAME, "stream": False},
                timeout=600.0,
            )
            print(f"Model {MODEL_NAME} ready.")
        else:
            print(f"Model {MODEL_NAME} already available.")

    print(f"AI Interviewer ready — {NUM_QUESTIONS} questions per interview")
    yield

    await close_db()


# ── App setup ──────────────────────────────────────────────────────────────────

app = FastAPI(title="AI Interviewer", lifespan=lifespan)
app.include_router(router)

# ── Static file serving (React build) ─────────────────────────────────────────

STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")

if os.path.isdir(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react(full_path: str):
        """Serve the React SPA for all non-API routes."""
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
