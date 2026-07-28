from django.db import models
from pgvector.django import VectorField


class BookAI(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        COMPLETED = "completed", "Completed"
        FAILED = "failed", "Failed"

    book = models.OneToOneField(
        "library.Book",
        on_delete=models.CASCADE,
        related_name="ai",
    )

    summary_status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    embedding_status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    summary = models.TextField(blank=True)

    text_embedding = VectorField(
        dimensions=384,
        null=True,
        blank=True,
    )

    summary_model_name = models.CharField(max_length=100, blank=True)

    embedding_model_name = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"AI for {self.book.title}"

    class Meta:
        ordering = ["book"]
        verbose_name = "Book AI"
        verbose_name_plural = "Book AI Records"
