from django.db import models
from pgvector.django import VectorField


class BookSummary(models.Model):
    book = models.ForeignKey(
        "library.Book",
        on_delete=models.CASCADE,
        related_name="summaries",
    )

    prompt_version = models.CharField(
        max_length=20,
        blank=True,
    )

    input_tokens = models.PositiveIntegerField(
        default=0,
    )

    output_tokens = models.PositiveIntegerField(
        default=0,
    )

    total_tokens = models.PositiveIntegerField(
        default=0,
    )
    content = models.TextField(
        null=True,
        blank=True,
    )

    model_name = models.CharField(
        max_length=100,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"Summary for {self.book.title}"

    class Meta:
        ordering = ["book"]
        verbose_name = "Book Summary"
        verbose_name_plural = "Book Summaries"

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "book",
                    "prompt_version",
                    "model_name",
                ],
                name="unique_book_summary",
            )
        ]


class BookEmbedding(models.Model):
    class EmbeddingType(models.TextChoices):
        DESCRIPTION = "description", "Description"
        SUMMARY = "summary", "Summary"
        ENRICHED = "enriched", "Enriched"

    book = models.ForeignKey(
        "library.Book",
        on_delete=models.CASCADE,
        related_name="embeddings",
    )

    embedding_type = models.CharField(
        max_length=20,
        choices=EmbeddingType.choices,
    )

    model_name = models.CharField(
        max_length=100,
    )

    embedding = VectorField(
        dimensions=384,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["book", "embedding_type"],
                name="uniq_book_embedding_type",
            )
        ]
