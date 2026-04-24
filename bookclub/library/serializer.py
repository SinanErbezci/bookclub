from rest_framework import serializers
from .models import Book, Author


class BookSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.name", read_only=True)
    publisher_name = serializers.CharField(source="publisher.name", read_only=True)
    genres = serializers.SerializerMethodField()

    def get_genres(self, obj):
        return [
        {"id": g.id, "name": g.name}
        for g in obj.genres.all()
    ]
    
    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "rating",
            "num_ratings",
            "cover",
            "author",
            "author_name",
            "description",
            "pub_date",
            "pages",
            "publisher",
            "publisher_name",
            "genres",
        ]

class BookListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.name", read_only=True)

    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "rating",
            "cover",
            "author",
            "author_name",
        ]

class AuthorSerializer(serializers.ModelSerializer):
    books = BookSerializer(many=True, read_only=True)
    book_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Author
        fields = ["id", "name", "books", "book_count"]