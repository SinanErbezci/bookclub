from django.shortcuts import render, get_object_or_404,redirect
from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse
from django.db import IntegrityError
from django.db.models import Count
from django.contrib import messages
from django.contrib.auth import authenticate,login, logout, get_user_model
from django.contrib.auth.forms import UserCreationForm,AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import generic
from django.views.decorators.csrf import ensure_csrf_cookie

from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from .pagination import BookPagination, ReviewPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.urls import reverse
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ObjectDoesNotExist
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.paginator import Paginator
from .models import Book, Author, User, Genre, Review, UserFollower, List, ListBook
from .forms import CreateUserFrom
# from .documents import BookDocument, AuthorDocument, GenreDocument
from random import choice, randint
from decimal import Decimal
# from elasticsearch_dsl.query import Match
import json
from .serializer import BookSerializer, AuthorSerializer, BookListSerializer, GenreSerializer, ReviewSerializer, ListSerializer
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny, IsAuthenticated
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.decorators import action
from django.db.models import Max, Avg


# ====== API Views ======

# Helper Functions
def update_book_rating(book):
    agg = book.reviews.aggregate(
        count=Count("id"),
        avg=Avg("rating")
    )

    book.num_ratings = agg["count"]
    book.rating = agg["avg"] or 0
    book.save()

User = get_user_model()

@method_decorator(ensure_csrf_cookie, name="dispatch")
class CSRFAPIView(APIView):
    permission_classes = []  # AllowAny

    def get(self, request):
        return JsonResponse({"detail": "CSRF cookie set"})

class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)

        if user is None:
            return Response({"error": "Invalid credentials"}, status=400)

        login(request, user)

        return Response({
            "id": user.id,
            "username": user.username
        })


class LogoutAPIView(APIView):
    def post(self, request):
        logout(request)
        return Response({"message": "Logged out"})


class MeAPIView(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({"user": None})

        return Response({
            "user": {
                "id": request.user.id,
                "username": request.user.username
            }
        })

class SignupAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Username and password required"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already taken"}, status=400)
        
        try:
            validate_password(password)
        except DjangoValidationError as e:
            return Response({"error": e.messages[0]}, status=400)
        
        user = User.objects.create_user(username=username, password=password)

        # auto login after signup
        login(request, user)

        return Response({
            "id": user.id,
            "username": user.username
        })
    
class BookViewSet(ReadOnlyModelViewSet):
    pagination_class = BookPagination

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
        ]

    filterset_fields = {
        "author": ["exact"],
        "rating": ["gte", "lte"],
        "genres__id": ["exact"],
    }

    search_fields = ["title"]

    ordering_fields = ["rating", "title", "num_ratings", "id"]
    ordering = ["-rating"]
        
    def get_queryset(self):
        return (
            Book.objects
            .select_related("author", "publisher", "series")
            .prefetch_related("genres")
        )

    def get_serializer_class(self):
        if self.action == "list":
            return BookListSerializer
        return BookSerializer
    
class AuthorViewSet(ReadOnlyModelViewSet):
    queryset = Author.objects.all()

    def get_serializer_class(self):
        return AuthorSerializer
    
class GenreViewSet(ReadOnlyModelViewSet):
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

class RandomAuthorAPIView(APIView):
    def get(self, request):
        author = Author.objects.order_by("?").first()
        books = author.books.all()[:4]

        return Response({
            "id": author.id,
            "name": author.name,
            "books": BookListSerializer(books, many=True).data
        })

class RandomGenreAPIView(APIView):
    def get(self, request):
        genre = Genre.objects.order_by("?").first()
        books = genre.books.all()[:4]

        return Response({
            "id": genre.id,
            "name": genre.name,
            "books": BookListSerializer(books, many=True).data
        })


class ReviewViewSet(ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = ReviewPagination

    def get_queryset(self):
        queryset = Review.objects.select_related("user", "book")

        book_id = self.request.query_params.get("book")
        user_id = self.request.query_params.get("user")

        if book_id:
            queryset = queryset.filter(book_id=book_id)

        if user_id:
            queryset = queryset.filter(user_id=user_id)


        return queryset.order_by("-created_at")
    
    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def user(self, request):
        book_id = request.query_params.get("book")

        if not book_id:
            return Response({"error": "Book is required"}, status=400)

        review = Review.objects.filter(
            book_id=book_id,
            user=request.user
        ).select_related("user", "book").first()

        if not review:
            return Response({"detail": "Not found"}, status=404)

        serializer = self.get_serializer(review)
        return Response(serializer.data)

    # ✅ CLEAN CREATE HANDLING
    def create(self, request, *args, **kwargs):
        book_id = request.data.get("book")

        if not book_id:
            raise ValidationError("Book is required")

        book = get_object_or_404(Book, id=book_id)

        # 🔥 prevent duplicate reviews EARLY
        if Review.objects.filter(book=book, user=request.user).exists():
            raise ValidationError("You already reviewed this book")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        review = serializer.save(user=request.user, book=book)

        update_book_rating(book)

        return Response(serializer.data, status=201)

    # ✅ UPDATE
    def perform_update(self, serializer):
        review = serializer.instance

        if self.request.user != review.user:
            raise PermissionDenied("You cannot edit this review")

        review = serializer.save()
        update_book_rating(review.book)

    # ✅ DELETE
    def perform_destroy(self, instance):
        if self.request.user != instance.user:
            raise PermissionDenied("You cannot delete this review")

        book = instance.book
        instance.delete()

        update_book_rating(book)

class UserProfileAPIView(APIView):
    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)

        lists = (
            List.objects
            .filter(user=user)
            .prefetch_related("books__author")
        )

        reviews = (
            Review.objects
            .filter(user=user)
            .select_related("book__author")
            .order_by("-created_at")
        )

        return Response({
            "user": {
                "id": user.id,
                "username": user.username
            },
            "lists": ListSerializer(lists, many=True).data,
            "reviews": ReviewSerializer(reviews, many=True).data
        })
    
class CreateListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = request.data.get("name")

        if not name or not name.strip():
            raise ValidationError("List name is required")

        # enforce uniqueness (you already have DB constraint, but this gives cleaner error)
        if List.objects.filter(user=request.user, name=name).exists():
            raise ValidationError("You already have a list with this name")

        book_list = List.objects.create(
            user=request.user,
            name=name.strip().lower()
        )

        return Response({
            "id": book_list.id,
            "name": book_list.name
        }, status=201)

class AddToListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, list_id):
        book_id = request.data.get("book_id")

        if not book_id:
            raise ValidationError({"book_id": "This field is required."})

        book_list = get_object_or_404(List, id=list_id, user=request.user)
        book = get_object_or_404(Book, id=book_id)

        obj, created = ListBook.objects.get_or_create(
            book_list=book_list,
            book=book
        )

        return Response(
            {"success": True, "created": created},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
    
class RemoveFromListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, list_id, book_id):
        book_list = get_object_or_404(
            List,
            id=list_id,
            user=request.user
        )

        deleted, _ = ListBook.objects.filter(
            book_list=book_list,
            book_id=book_id
        ).delete()

        return Response(
            {"success": True, "deleted": bool(deleted)},
            status=status.HTTP_200_OK
        )

class DeleteListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, list_id):
        book_list = get_object_or_404(
            List,
            id=list_id,
            user=request.user
        )

        book_list.delete()

        return Response({"success": True}, status=status.HTTP_200_OK)
