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

