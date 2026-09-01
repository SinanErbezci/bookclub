import json
from celery import shared_task
from django.db.models import Count
from django.core.mail import send_mail
from django.contrib.auth import get_user_model

from .models import Author, Genre, Book
from .redis_client import redis_client

User = get_user_model()


@shared_task
def refresh_random_homepage():
    author = (
        Author.objects.annotate(book_count=Count("books"))
        .filter(book_count__gte=4)
        .order_by("?")
        .first()
    )

    genre = (
        Genre.objects.annotate(book_count=Count("books"))
        .filter(book_count__gte=4)
        .order_by("?")
        .first()
    )

    if author:
        redis_client.set("homepage:random:author", author.id)

    if genre:
        redis_client.set("homepage:random:genre", genre.id)

    return {
        "author_id": author.id if author else None,
        "genre_id": genre.id if genre else None,
    }


@shared_task(bind=True, max_retries=3)
def send_welcome_email(self, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return f"User {user_id} no longer exists"

    if not user.email:
        return f"User {user_id} has no email address"

    try:
        send_mail(
            subject="Welcome to Bookclub",
            message=f"Welcome, {user.username}!",
            from_email="noreply@bookclub.local",
            recipient_list=[user.email],
        )
    except Exception as exc:
        raise self.retry(
            exc=exc,
            countdown=60,
        )

    return f"Welcome email sent to {user.email}"