import pgvector.django.indexes
from django.contrib.postgres.operations import AddIndexConcurrently
from django.db import migrations


class Migration(migrations.Migration):
    atomic = False

    dependencies = [
        ("ai", "0004_alter_bookembedding_embedding_type"),
        ("library", "0012_alter_user_email"),
    ]

    operations = [
        AddIndexConcurrently(
            model_name="bookembedding",
            index=pgvector.django.indexes.HnswIndex(
                ef_construction=64,
                fields=["embedding"],
                m=16,
                name="book_embedding_hnsw_cosine",
                opclasses=["vector_cosine_ops"],
            ),
        ),
    ]