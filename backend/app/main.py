import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import ask, predict
from app.services import classifier, rag

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="MycoScan API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    app.state.model_handle = classifier.load_model(settings)
    app.state.rag_ready = rag.is_rag_available()


app.include_router(predict.router)
app.include_router(ask.router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_mode": app.state.model_handle.mode,
        "rag_mode": "real" if app.state.rag_ready else "fallback",
    }
