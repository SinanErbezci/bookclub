from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from library.models import Author, Book, Review


@override_settings(
    CACHES={"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}
)
class ReviewAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        User = get_user_model()
        cls.owner = User.objects.create_user(
            username="review_owner", email="owner@example.com", password="Passw0rd123!"
        )
        cls.other_user = User.objects.create_user(
            username="other_reviewer", email="other@example.com", password="Passw0rd123!"
        )
        author = Author.objects.create(name="Test Author")
        cls.book = Book.objects.create(
            source="tests",
            source_row_id="book-1",
            title="A Test Book",
            author=author,
        )

    def create_review(self, user=None, *, rating=5, content="An excellent test book."):
        self.client.force_authenticate(user=user or self.owner)
        return self.client.post(
            "/api/reviews/",
            {"book": self.book.pk, "rating": rating, "content": content},
            format="json",
        )

    def test_anonymous_users_can_read_reviews(self):
        response = self.client.get("/api/reviews/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_anonymous_users_cannot_create_reviews(self):
        response = self.client.post(
            "/api/reviews/",
            {"book": self.book.pk, "rating": 5, "content": "An excellent test book."},
            format="json",
        )
        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )
        self.assertEqual(Review.objects.count(), 0)

    def test_authenticated_user_can_create_review(self):
        response = self.create_review()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        review = Review.objects.get()
        self.assertEqual(review.user, self.owner)
        self.assertEqual(review.book, self.book)
        self.assertEqual(review.rating, 5)
        self.book.refresh_from_db()
        self.assertEqual(self.book.num_ratings, 1)
        self.assertEqual(float(self.book.rating), 5.0)

    def test_review_text_must_have_at_least_ten_characters(self):
        response = self.create_review(content="Short")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Review.objects.count(), 0)

    def test_duplicate_review_for_same_book_is_rejected(self):
        self.assertEqual(self.create_review().status_code, status.HTTP_201_CREATED)
        response = self.create_review(content="A second review attempt.")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Review.objects.count(), 1)

    def test_owner_can_update_review_and_book_rating(self):
        review = Review.objects.create(
            user=self.owner, book=self.book, rating=3, text="Original review content."
        )
        self.client.force_authenticate(user=self.owner)
        response = self.client.patch(
            f"/api/reviews/{review.pk}/",
            {"rating": 4, "content": "Updated review content."},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        review.refresh_from_db()
        self.assertEqual(review.rating, 4)
        self.assertEqual(review.text, "Updated review content.")
        self.book.refresh_from_db()
        self.assertEqual(self.book.num_ratings, 1)
        self.assertEqual(float(self.book.rating), 4.0)

    def test_other_user_cannot_update_review(self):
        review = Review.objects.create(
            user=self.owner, book=self.book, rating=3, text="Original review content."
        )
        self.client.force_authenticate(user=self.other_user)
        response = self.client.patch(
            f"/api/reviews/{review.pk}/", {"rating": 1}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        review.refresh_from_db()
        self.assertEqual(review.rating, 3)

    def test_other_user_cannot_delete_review(self):
        review = Review.objects.create(
            user=self.owner, book=self.book, rating=3, text="Original review content."
        )
        self.client.force_authenticate(user=self.other_user)
        response = self.client.delete(f"/api/reviews/{review.pk}/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Review.objects.filter(pk=review.pk).exists())

    def test_owner_can_delete_review(self):
        self.assertEqual(self.create_review().status_code, status.HTTP_201_CREATED)
        review = Review.objects.get()
        self.client.force_authenticate(user=self.owner)
        response = self.client.delete(f"/api/reviews/{review.pk}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Review.objects.filter(pk=review.pk).exists())
        self.book.refresh_from_db()
        self.assertEqual(self.book.num_ratings, 0)
        self.assertEqual(float(self.book.rating), 0.0)

    def test_multiple_reviews_update_book_average(self):
        self.assertEqual(self.create_review(rating=5).status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            self.create_review(
                self.other_user, rating=3, content="An enjoyable but uneven book."
            ).status_code,
            status.HTTP_201_CREATED,
        )
        self.book.refresh_from_db()
        self.assertEqual(self.book.num_ratings, 2)
        self.assertEqual(float(self.book.rating), 4.0)


class ReviewTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        User = get_user_model()
        author = Author.objects.create(name="Sam Rivera")
        cls.book = Book.objects.create(
            author=author, title="The Quiet Coast", source="test", source_row_id="1"
        )
        cls.reader = User.objects.create_user(username="reader", email="reader@example.test")
        cls.other = User.objects.create_user(username="other", email="other@example.test")

    def test_review_updates_rating_and_rejects_duplicates_and_foreign_edits(self):
        client = APIClient()
        client.force_login(self.reader)
        payload = {
            "book": self.book.pk,
            "rating": 4,
            "content": "A thoughtful story about coastal life.",
        }
        response = client.post("/api/reviews/", payload, format="json")
        self.assertEqual(response.status_code, 201)
        review_id = response.json()["id"]
        self.book.refresh_from_db()
        self.assertEqual(self.book.rating, Decimal("4.0"))
        self.assertEqual(self.book.num_ratings, 1)

        duplicate = client.post("/api/reviews/", payload, format="json")
        self.assertEqual(duplicate.status_code, 400)
        client.force_login(self.other)
        denied = client.patch(f"/api/reviews/{review_id}/", {"rating": 1}, format="json")
        self.assertEqual(denied.status_code, 403)
        self.assertEqual(Review.objects.get(pk=review_id).rating, 4)
        self.assertEqual(Review.objects.filter(book=self.book).count(), 1)

    def test_database_enforces_one_review_per_user_and_book(self):
        values = {
            "book": self.book,
            "user": self.reader,
            "rating": 4,
            "text": "A thoughtful story about coastal life.",
        }
        Review.objects.create(**values)
        with self.assertRaises(IntegrityError), transaction.atomic():
            Review.objects.create(**values)
