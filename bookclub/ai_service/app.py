import asyncio
import os

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from prometheus_fastapi_instrumentator import Instrumentator
from sentence_transformers import SentenceTransformer


app = FastAPI()

Instrumentator().instrument(app).expose(app)

MODEL_PATH = os.getenv(
    "MODEL_PATH",
    "BAAI/bge-small-en-v1.5",
)

OBSERVABILITY_TEST_ENDPOINTS = (
    os.getenv("OBSERVABILITY_TEST_ENDPOINTS", "false").lower() == "true"
)

model = SentenceTransformer(
    MODEL_PATH,
    device="cpu",
)


class EmbedRequest(BaseModel):
    text: str


@app.get("/health/live/")
def health_live():
    return {"status": "ok"}


@app.get("/health/ready/")
def health_ready():
    return {"status": "ready"}


@app.post("/embed")
def embed(request: EmbedRequest):
    embedding = model.encode(
        "Represent this sentence for searching relevant passages: "
        + request.text,
        convert_to_numpy=True,
    )

    return {
        "embedding": embedding.tolist(),
    }


if OBSERVABILITY_TEST_ENDPOINTS:

    @app.get("/internal/test/500/")
    def observability_test_500():
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Intentional 500 response for observability testing."
            },
        )

    @app.get("/internal/test/slow/")
    async def observability_test_slow():
        await asyncio.sleep(3)

        return {
            "detail": "Intentional slow response for observability testing."
        }