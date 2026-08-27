from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer


app = FastAPI()

model = SentenceTransformer(
    "BAAI/bge-small-en-v1.5",
    device="cpu",
)


class EmbedRequest(BaseModel):
    text: str


@app.get("/health")
def health():
    return {"status": "healthy"}


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