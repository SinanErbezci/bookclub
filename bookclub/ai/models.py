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

    # we'll add the remaining fields next