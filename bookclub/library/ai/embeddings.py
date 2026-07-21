"""
Utilities for generating text embeddings used by BookClub AI.
"""
from __future__ import annotations
from sentence_transformers import SentenceTransformer
from django.conf import settings
import logging

from library.models import Book

logger = logging.getLogger(__name__)

def build_book_embedding_text(book: Book) -> str:
    """
    Build a natural language representation of a book suitable
    for semantic embeddings.
    """
    parts: list[str] = []

    def add_field(label: str, value: str | None) -> None:
        if value:
            value = value.strip()
            if value:
                parts.append(f"{label}: {value}")
    
    add_field("Title", book.title)
    add_field("Author",  book.author.name if book.author else None)

    genres = ", ".join(
        genre.name
        for genre in book.genres.all().order_by("name")
    )

    add_field("Genres", genres)
    add_field("Description", book.description)

    return "\n\n".join(parts)

class EmbeddingService:
    """Service responsible for generating text embeddings."""

    def __init__(self):
        logger.info(
            "Loading embedding model: %s",
            settings.EMBEDDING_MODEL_NAME,
        )

        self.model = SentenceTransformer(
            settings.EMBEDDING_MODEL_NAME
        )

        logger.info("Embedding model loaded successfully.")

    def generate(self, text: str) -> list[float]:
        """
        Generate an embedding for a single piece of text.
        """
        if not text.strip():
            raise ValueError("Cannot generate embedding from empty text.")

        logger.debug("Generating embedding.")

        embedding = self.model.encode(
            text,
            convert_to_numpy=True,
        )

        return embedding.tolist()

    def generate_batch(self, texts: list[str]) -> list[list[float]]:
        """
        Generate embeddings for multiple texts.
        """
        if not texts:
            raise ValueError("Cannot generate embeddings from an empty list.")

        logger.debug(
            "Generating embeddings for %d texts.",
            len(texts),
        )

        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True,
        )

        return embeddings.tolist()