from rest_framework import serializers
from .models import Book, Author, Genre, Review


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
    books = serializers.SerializerMethodField()

    def get_books(self, obj):
        books = obj.books.all()[:12]
        return BookListSerializer(books, many=True).data
    
    class Meta:
        model = Author
        fields = ["id", "name", "books"]

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ["id", "name"]

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    content = serializers.CharField(source="text")

    class Meta:
        model = Review
        fields = [
            "id",
            "user",
            "rating",
            "content",
            "created_at",
            "updated_at",
            "book",
        ]
        read_only_fields = ["user", "created_at", "updated_at", "book"]

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "username": obj.user.username
        }
    
    def validate_content(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Review too short")
        return value