from django.db import migrations
# Remove outlier books with long descriptions

BOOK_IDS_TO_DELETE = [
    18913,  # Spiritus Mundi
    22018,  # Spiritus Mundi - The Romance
    51534,  # Hamlet as Told on the Street
    39302,  # الإسلام وأصول الحكم
    43879,  # اشتراكية الإسلام
]


def remove_outlier_books(apps, schema_editor):
    Book = apps.get_model("library", "Book")

    Book.objects.filter(id__in=BOOK_IDS_TO_DELETE).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("library", "0009_auto_20260803_1230"), 
    ]

    operations = [
        migrations.RunPython(
            remove_outlier_books,
            migrations.RunPython.noop,
        ),
    ]