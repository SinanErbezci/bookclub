from celery import shared_task
from django.core.cache import cache
from django.db.models import Count
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth import get_user_model
from django.template.loader import render_to_string

from .models import Author, Genre

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
        cache.set(
            "homepage:random:author",
            author.id,
            timeout=60 * 60,
        )

    if genre:
        cache.set(
            "homepage:random:genre",
            genre.id,
            timeout=60 * 60,
        )

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

    subject = "Welcome to the Bookclub"

    context = {
        "username": user.username,
    }

    text_content = render_to_string(
        "emails/welcome.txt",
        context,
    )

    html_content = render_to_string(
        "emails/welcome.html",
        context
    )

    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email="noreply@sinanerbezci.com",
            to=[user.email],
        )
        email.attach_alternative(html_content, "text/html")
        email.send()

    except Exception as exc:
        raise self.retry(
            exc=exc,
            countdown=60,
        )

    return f"Welcome email sent to {user.email}"