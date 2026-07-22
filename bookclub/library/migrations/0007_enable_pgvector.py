from django.db import migrations
from pgvector.django import VectorExtension

class Migration(migrations.Migration):

    dependencies = [
        ('library', '0006_enable_trigram'),
    ]

    operations = [
        VectorExtension(),
    ]
