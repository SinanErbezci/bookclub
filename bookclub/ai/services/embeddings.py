"""
Utilities for generating text embeddings.
"""

from __future__ import annotations

import logging

from django.conf import settings
from sentence_transformers import SentenceTransformer

from ai.models import BookSummary
from library.models import Book

logger = logging.getLogger(__name__)


def build_description_embedding_text(
    book: Book,
) -> str:
    return _build_embedding_text(
        title=book.title,
        genres=_sorted_genres(book),
        body=book.description,
        body_label="Description",
    )


def build_summary_embedding_text(
    summary: BookSummary,
) -> str:
    return _build_embedding_text(
        title=summary.book.title,
        genres=_sorted_genres(summary.book),
        body=summary.content,
        body_label="Summary",
    )


def build_summary_without_title_embedding_text(
    summary: BookSummary,
) -> str:
    return _build_embedding_text(
        genres=_sorted_genres(summary.book),
        body=summary.content,
        body_label="Summary",
        include_title=False,
    )


def _sorted_genres(
    book: Book,
) -> list[str]:
    return [
        genre.name
        for genre in sorted(
            book.genres.all(),
            key=lambda genre: genre.name,
        )
    ]

def _build_embedding_text(
    *,
    genres: list[str],
    body: str | None,
    body_label: str,
    title: str | None = None,
    include_title: bool = True,
) -> str:
    """
    Build a natural language representation suitable for semantic
    embeddings.
    """
    parts: list[str] = []

    def add_field(
        label: str,
        value: str | None,
    ) -> None:
        if value:
            value = value.strip()

            if value:
                parts.append(
                    f"{label}: {value}"
                )

    if include_title:
        add_field(
            "Title",
            title,
        )

    add_field(
        "Genres",
        ", ".join(genres),
    )

    add_field(
        body_label,
        body,
    )

    return "\n\n".join(parts)




class EmbeddingService:
    """Service responsible for generating text embeddings."""

    _model = None

    QUERY_PREFIX = "Represent this sentence for searching relevant passages: "
    

    def __init__(self):
        if self.__class__._model is None:
            logger.info(
                "Loading embedding model: %s",
                settings.EMBEDDING_MODEL_NAME,
            )

            self.__class__._model = SentenceTransformer(
                settings.EMBEDDING_MODEL_NAME,
                device=settings.EMBEDDING_DEVICE,
            )

            logger.info(
                "Embedding model loaded successfully."
            )

        self.model = self.__class__._model

    def _embed(
        self,
        texts: str | list[str],
    ) -> list[float] | list[list[float]]:
        """
        Generate embeddings for one or more texts.
        """

        if isinstance(texts, str):
            if not texts.strip():
                raise ValueError(
                    "Cannot generate embedding from empty text."
                )
        else:
            if not texts:
                raise ValueError(
                    "Cannot generate embeddings from an empty list."
                )

            if any(not text.strip() for text in texts):
                raise ValueError(
                    "Cannot generate embeddings from empty text."
                )

        logger.debug("Generating embeddings.")

        embeddings = self.model.encode(
            texts,
            convert_to_numpy=True,
        )

        return embeddings.tolist()

    def embed_document(
        self,
        text: str,
    ) -> list[float]:
        """
        Generate an embedding for a document.
        """
        return self._embed(text)

    def embed_documents(
        self,
        texts: list[str],
    ) -> list[list[float]]:
        """
        Generate embeddings for multiple documents.
        """
        return self._embed(texts)

    def embed_query(
        self,
        query: str,
    ) -> list[float]:
        """
        Generate an embedding for a search query.
        """
        return self._embed(
            self.QUERY_PREFIX + query,
        )

    def embed_queries(
        self,
        queries: list[str],
    ) -> list[list[float]]:
        """
        Generate embeddings for multiple search queries.
        """
        return self._embed(
            [
                self.QUERY_PREFIX + query
                for query in queries
            ]
        )