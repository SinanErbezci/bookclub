from django.urls import path
from . import views

urlpatterns = [
    # Landing Page
    path("", views.index, name="index"),

    # Account login
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("signup", views.signup, name="signup"),

    # Browse Section
    path("browse/", views.browse, name="browse"),
    path("browse/books/<int:book_id>", views.browse_book, name="book"),
    path("browse/genres/<int:genre_id>", views.browse_genre, name="genre"),
    path("browse/authors/<int:author_id>", views.browse_author, name="author"),

    # Search Page
    # path("search", views.search, name="search"),

    # Profile Page
    path("profile", views.profile, name="profile"),
    path("profile/<int:user_id>", views.user_profile, name="user_profile"),

    # API Search, Follow
    # path("short", views.short_search, name="short_search"),
    path("follow/<int:user_id>", views.follow, name="follow"),

    # API List
    path("listing", views.listing, name="listing")


]