from django.shortcuts import render, get_object_or_404,redirect
from django.http import HttpResponse, Http404, HttpResponseRedirect, JsonResponse
from django.db import IntegrityError
from django.db.models import Count
from django.contrib import messages
from django.contrib.auth import authenticate,login, logout
from django.contrib.auth.forms import UserCreationForm,AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views import generic
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.filters import SearchFilter, OrderingFilter
from .pagination import BookPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.urls import reverse
from django.core.exceptions import ObjectDoesNotExist
from django.core.paginator import Paginator
from .models import Book, Author, User, Genre, Review, UserFollower, List, ListBook
from .forms import CreateUserFrom
# from .documents import BookDocument, AuthorDocument, GenreDocument
from random import choice, randint
from decimal import Decimal
# from elasticsearch_dsl.query import Match
import json
from .serializer import BookSerializer, AuthorSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Max


# API Views
class BookViewSet(ReadOnlyModelViewSet):
    serializer_class = BookSerializer
    pagination_class = BookPagination
    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
        ]

    filterset_fields = {
        "author": ["exact"],
        "rating": ["gte", "lte"],
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

class RandomAuthorAPIView(APIView):
    def get(self, request):
        author = Author.objects.order_by("?").first()
        books = author.books.all()[:4]

        return Response({
            "id": author.id,
            "name": author.name,
            "books": BookSerializer(books, many=True).data
        })

class RandomGenreAPIView(APIView):
    def get(self, request):
        genre = Genre.objects.order_by("?").first()
        books = genre.books.all()[:4]

        return Response({
            "id": genre.id,
            "name": genre.name,
            "books": BookSerializer(books, many=True).data
        })


def index(request):
    hello = "hello, world"
    output = {"hello" : hello}
    return render(request, "library/index.html",output)

# User views
def login_view(request):
    if request.method == "POST":
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            login(request, form.get_user())
            return redirect("index")
            # username = form.cleaned_data["username"]
            # password = form.cleaned_data["password"]
            
            # user = authenticate(request, username=username, password=password)   

            # if user is not None:
            #     login(request, user)
            #     print("a")
            #     return redirect("index")
            # else:
            #     print("b")
    else:
        form = AuthenticationForm()

    return render(request, "library/login.html", {"form": form})


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def signup(request):
    if request.method == "POST":
        form = CreateUserFrom(request.POST)
        if form.is_valid():
            print("valid")
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password1"]
            form.save()
            new_user = authenticate(username=username, password=password)
            if new_user is not None:
                login(request,new_user)
                return redirect("index")
    else:  
        form = CreateUserFrom()

    return render(request, "library/signup.html", {"form": form})

# legacy
def browse(request):

    content = {}
    # Last added books
    content["recently"] = Book.objects.all().order_by("-pk")[:4]

    # Randomly select author
    random_author = (
        Author.objects
        .prefetch_related("books")
        .order_by("?")
        .first()
    )

    books_author = list(random_author.books.all()[:4])

    content["author"] = random_author
    content["author_books"] = books_author

    # Randomly select genre
    random_genre = Genre.objects.prefetch_related("books").order_by("?").first()

    books_genre = list(random_genre.books.all()[:4])

    content["genre"] = random_genre
    content["genre_books"] = books_genre

    
    
    return render(request, "library/browse.html", content)

def browse_book(request, book_id):

    if request.method == "POST" and request.user.is_authenticated:
        text = request.POST["text"]
        rating = request.POST["rating"]
        rating = int(rating)

        user_review = Review.objects.filter(book_id = book_id, user_id = request.user.id)
        if user_review.exists():
            print("user has review")
            return redirect("index")
        review = Review(book_id=book_id, user_id=request.user.id, rating=rating, text=text)
        review.save()
        messages.success(request, "You've succesfully submitted your review.")
        
        # Update Ratings
        book = Book.objects.get(pk=book_id)
        num_ratings = book.num_ratings
        book_rating = book.rating
        new_total = num_ratings * book_rating + rating
        new_rating = (Decimal(new_total) / Decimal(num_ratings + 1)).quantize(Decimal("1.0"))
        book.num_ratings = num_ratings + 1
        book.rating = new_rating
        book.save()

    
    content = {}
    if book_id:
        if request.user.is_authenticated:
            user_review = Review.objects.filter(book_id = book_id, user_id = request.user.id)
            onlist = ListBook.objects.filter(book__id = book_id, book_list__owner_id = request.user.id)

            content["listed"] = onlist.exists()
            content["listid"] = onlist.first().id if content["listed"] else None

                
            content["user_review"] = user_review.first().id if user_review.exists() else None

        book = get_object_or_404(Book, pk=book_id)
        content["book"] = book
        reviews = Review.objects.filter(book = book).exclude(user_id = request.user.id)
        content["reviews"] = reviews


    else:
        content["name"] = "home of books"
    
    return render(request, "library/browse_book.html", content)
    
def browse_author(request, author_id):
    content = {}
    try:
        author = Author.objects.get(pk=author_id)
    except ObjectDoesNotExist:
        return redirect("index")

    content["author"] = author
    print(author)
    books = author.books.all()
    content["books"] = books
    if books.count() > 4:
        content["over"] = True
    else:
        content["over"] = False
    return render(request, "library/browse_author.html", content)

def browse_genre(request, genre_id):
    content = {}
    try:
        genre = Genre.objects.get(pk = genre_id)
        content["name"] = genre.name
    except ObjectDoesNotExist:
        return redirect("index")

    paginator = Paginator(genre.books.all(), 4)
    page_num = request.GET.get('page')
    page_obj = paginator.get_page(page_num)
    content["page_obj"] = page_obj

    
    return render(request, "library/browse_genre.html", content)

# def search(request):
#     query = request.GET.get("q")
#     option = request.GET.get("option")

#     if query:
#         if option == "book" or option is None:
#             search_q = Match(title = {"query": query, "fuzziness" :"AUTO"})
#             books = BookDocument.search().query(search_q).to_queryset()
#             option = "book"
#             item_per_page = 4
#         elif option == "genre":
#             search_q = Match(name = {"query": query, "fuzziness" :"AUTO"})
#             books = GenreDocument.search().query(search_q).to_queryset()
#             item_per_page = 8
#         else:
#             search_q = Match(name = {"query":query, "fuzziness":"AUTO"})
#             books = AuthorDocument.search().query(search_q).to_queryset()
#             item_per_page = 8
        
#         if books.count() == 0:
#             content = {"noresult" : True}
#         else:
#             books_paginated = Paginator(books, item_per_page)
#             page_num = request.GET.get("page")
#             page_obj = books_paginated.get_page(page_num)
#             content = {"page_obj" : page_obj}
#         content["query"] = query
#         content["option"] = option
#     else:
#         content = {}

#     return render(request, "library/search.html", content)


# API Route Search
# def short_search(request):
#     query = request.GET.get("q")
#     result = {}
#     if not query:
#         return JsonResponse({"error": "no query"}, status=400)

#     result["data"] = {"book": None, "genre":None, "author":None}
    
#     search_q = Match(title = {"query":query, "fuzziness":"AUTO"})
#     b = BookDocument.search().query(search_q)[0:5]
#     books_dict = {}
#     for book in b:
#         books_dict[book.title] = book.meta.id
#     result["data"]["book"] = books_dict

#     search_q = Match(name = {"query":query, "fuzziness":"AUTO"})
#     g = GenreDocument.search().query(search_q)[0:5]
#     genres_dict = {}
#     for genre in g:
#         genres_dict[genre.name] = genre.meta.id
#     result["data"]["genre"] = genres_dict

#     search_q = Match(name = {"query":query, "fuzziness":"AUTO"})
#     a = AuthorDocument.search().query(search_q)[0:5]
#     authors_dict = {}
#     for author in a:
#         authors_dict[author.name] = author.meta.id
#     result["data"]["author"] = authors_dict

#     return JsonResponse(result, safe=False)

@login_required
def follow(request, user_id):
    if request.method == "POST":
        follower = User.objects.get(pk=request.user.id)
        following = User.objects.get(pk=user_id)
        data = json.loads(request.body)
        if data["text"] == "follow":
            follow = UserFollower.objects.create(follower = follower, following = following)
            follow.save()
        elif data["text"] == "unfollow":
            follow = UserFollower.objects.get(follower = follower, following = following)
            follow.delete()
    
    return redirect("index")

def profile(request):
    if request.user.is_authenticated:
        user = User.objects.get(pk=request.user.id)
        reviews = Review.objects.all().filter(user_id = user)
        followers = UserFollower.objects.all().filter(follower = user)
        lists = List.objects.all().filter(owner = user)
        content = {"user": user, "reviews":reviews, "followers":followers, "List":lists}
        return render(request, "library/profile.html",content)
    else:
        return redirect("index")

def user_profile(request,user_id):
    content = {}
    if request.user.is_authenticated:
        if request.user.id == user_id:
            return redirect("profile")
        
        try:
            follow_bool = UserFollower.objects.get(follower__id = request.user.id, following__id = user_id)
            follow_bool = True
        except UserFollower.DoesNotExist:
            follow_bool = False
        content["follow_bool"] = follow_bool
        
    user = User.objects.get(pk=user_id)
    reviews = Review.objects.all().filter(user_id = user)
    lists = List.objects.all().filter(owner = user)

    content["user"] =  user
    content["reviews"] = reviews
    content["List"] = lists

    return render(request, "library/user_profile.html", content)

@login_required
def listing(request):
    if request.method == "GET":
        list_id = request.GET.get("q")
        # give books of a list
        if list_id:
            books = Book.objects.filter(in_lists__book_list_id=list_id)
            serializer = BookSerializer(books, many=True)
            return Response(serializer.data)

        user_lists = List.objects.filter(owner=request.user)
        output = {lst.id: lst.name for lst in user_lists}
        return JsonResponse(output)
    
    elif request.method == "POST":
        if request.GET.get("q") == "create":
        # create new list and add the book to the list
            new_list = List.objects.create(owner_id=request.user.id, name=request.POST["list-name"])
            new_book_list = ListBook.objects.create(book_list = new_list, book_id=request.POST["book"])
        elif request.GET.get("q") == "add":
        # add book to a list
            new_book_list = ListBook.objects.create(book_list_id = request.POST["list-id"], book_id = request.POST["book"])
            print(new_book_list)
        elif request.GET.get("q") == "remove":
        # remove from the list
            remove_book_list = ListBook.objects.filter(book_list_id = request.POST["list"], book_id = request.POST["book"])
            remove_book_list.delete()

        if "HTTP_REFERER" in request.META:
            return redirect(request.META["HTTP_REFERER"])
        else:
            return redirect("index")
