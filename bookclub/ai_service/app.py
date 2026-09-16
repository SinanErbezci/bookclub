import os

from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer


app = FastAPI()

MODEL_PATH = os.getenv(
    "MODEL_PATH",
    "BAAI/bge-small-en-v1.5",
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