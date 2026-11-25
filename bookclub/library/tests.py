from decimal import Decimal
from unittest.mock import patch

from django.db import IntegrityError, transaction
from django.test import TestCase
from rest_framework.test import APIClient

from ai.models import BookEmbedding

from .models import Author, Book, List, Review, User


class SignupTests(TestCase):
    def test_signup_starts_session_creates_system_lists_and_queues_welcome(self):
        client = APIClient()
        with patch("library.views.send_welcome_email.delay") as queue_welcome:
            with self.captureOnCommitCallbacks() as callbacks:
                response = client.post(
                    "/api/signup/",
                    {
                        "username": "reader",
                        "email": "reader@example.test",
                        "password": "paperback-river-479",
                    },
                    format="json",
                )
            self.assertEqual(response.status_code, 200)
            user_id = response.json()["id"]
            queue_welcome.assert_not_called()
            self.assertEqual(len(callbacks), 1)
            callbacks[0]()
            queue_welcome.assert_called_once_with(user_id)

        me = client.get("/api/me/")
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json(), {"user": {"id": user_id, "username": "reader"}})
        self.assertCountEqual(
            List.objects.filter(user_id=user_id).values_list("name", "is_system"),
            [("Favourites", True), ("Want to Read", True)],
        )


class ReviewTests(TestCase):
    @classmethod
    def setUpTestData(cls):
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


class SearchTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        author = Author.objects.create(name="Sam Rivera")
        cls.match = Book.objects.create(
            author=author, title="Lighthouse Keeper", source="test", source_row_id="1"
        )
        cls.unrelated = Book.objects.create(
            author=author, title="Desert Botany", source="test", source_row_id="2"
        )

    def test_keyword_search_returns_only_the_matching_book(self):
        self.assert_keyword_match("lighthouse", self.match)

    def test_keyword_search_matches_a_non_prefix_whole_word(self):
        book = Book.objects.create(
            author=self.match.author,
            title="Beyond the Fog: Stories of Remote Islands and Atlantic Shipwrecks",
            source="test",
            source_row_id="3",
        )
        self.assert_keyword_match("fog", book)

    def test_keyword_search_matches_a_transposed_letter_typo(self):
        self.assert_keyword_match("lighthuose", self.match)

    def assert_keyword_match(self, query, expected):
        response = APIClient().get("/api/search/", {"q": query})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["books_count"], 1)
        self.assertEqual([book["id"] for book in data["books"]], [expected.pk])

    def test_semantic_search_ranks_books_by_vector_distance(self):
        query_vector = [1.0, 0.0] + [0.0] * 382
        other_vector = [0.0, 1.0] + [0.0] * 382
        for book, vector in ((self.match, query_vector), (self.unrelated, other_vector)):
            BookEmbedding.objects.create(
                book=book,
                embedding_type=BookEmbedding.EmbeddingType.SUMMARY_NO_TITLE,
                model_name="test",
                embedding=vector,
            )

        client = APIClient()
        for vector, expected in (
            (query_vector, [self.match.pk, self.unrelated.pk]),
            (other_vector, [self.unrelated.pk, self.match.pk]),
        ):
            with self.subTest(expected=expected):
                with patch("ai.services.ai_client.AIClient.embed_query", return_value=vector) as embed:
                    response = client.get("/api/search/semantic/", {"q": "coastal stories"})
                self.assertEqual(response.status_code, 200)
                embed.assert_called_once_with("coastal stories")
                self.assertEqual([book["id"] for book in response.json()], expected)
