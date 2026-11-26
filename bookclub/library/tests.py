from decimal import Decimal
from unittest.mock import patch
from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth import authenticate
from django.core.cache import cache
from django.db import IntegrityError, transaction
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from ai.models import BookEmbedding

from .models import Author, Book, List, Review, User


@override_settings(CSRF_TRUSTED_ORIGINS=["http://localhost:5173"])
class AuthCSRFTests(TestCase):
    origin = "http://localhost:5173"
    password = "paperback-river-479"

    @classmethod
    def setUpTestData(cls):
        cls.reader = User.objects.create_user(
            username="reader", email="reader@example.test", password=cls.password
        )

    def setUp(self):
        cache.clear()
        self.addCleanup(cache.clear)

    def csrf_token(self, client):
        response = client.get("/api/csrf/", HTTP_ORIGIN=self.origin)
        self.assertEqual(response.status_code, 200)
        self.assertIn(settings.CSRF_COOKIE_NAME, response.cookies)
        return response.json()["csrfToken"]

    def test_anonymous_auth_rejects_invalid_csrf_before_side_effects(self):
        cases = (
            "no_token_or_cookie",
            "header_without_cookie",
            "cookie_without_header",
            "mismatched_header",
            "untrusted_origin",
        )
        for endpoint in ("login", "signup"):
            for case in cases:
                with self.subTest(endpoint=endpoint, case=case):
                    client = APIClient(enforce_csrf_checks=True)
                    headers = {"HTTP_ORIGIN": self.origin}
                    if case != "no_token_or_cookie":
                        token = self.csrf_token(client)
                        if case != "cookie_without_header":
                            headers["HTTP_X_CSRFTOKEN"] = token
                        if case == "header_without_cookie":
                            del client.cookies[settings.CSRF_COOKIE_NAME]
                        if case == "mismatched_header":
                            headers["HTTP_X_CSRFTOKEN"] = self.csrf_token(
                                APIClient(enforce_csrf_checks=True)
                            )
                        if case == "untrusted_origin":
                            headers["HTTP_ORIGIN"] = "https://unlisted.example.test"

                    username = self.reader.username if endpoint == "login" else case
                    payload = {
                        "username": username,
                        "email": f"{username}@example.test",
                        "password": self.password,
                    }
                    path = f"/api/{endpoint}/"
                    counts = User.objects.count(), List.objects.count()
                    with (
                        patch("library.views.authenticate", wraps=authenticate) as check_credentials,
                        patch("library.views.send_welcome_email.delay") as queue_welcome,
                        self.captureOnCommitCallbacks() as callbacks,
                    ):
                        if case == "no_token_or_cookie":
                            response = client.post(
                                path,
                                urlencode(payload),
                                content_type="application/x-www-form-urlencoded",
                                **headers,
                            )
                        else:
                            response = client.post(path, payload, format="json", **headers)

                    self.assertEqual(response.status_code, 403)
                    self.assertEqual(client.get("/api/me/").json(), {"user": None})
                    check_credentials.assert_not_called()
                    queue_welcome.assert_not_called()
                    self.assertEqual(callbacks, [])
                    self.assertEqual((User.objects.count(), List.objects.count()), counts)

    def test_rejected_auth_preserves_existing_session(self):
        client = APIClient(enforce_csrf_checks=True)
        client.force_login(self.reader)
        self.csrf_token(client)
        payload = {
            "username": "other",
            "email": "other@example.test",
            "password": self.password,
        }
        other = User.objects.create_user(
            username=payload["username"], email=payload["email"], password=self.password
        )
        for endpoint in ("login", "signup"):
            with self.subTest(endpoint=endpoint):
                signup_payload = {**payload, "username": "new", "email": "new@example.test"}
                with (
                    patch("library.views.authenticate", wraps=authenticate) as check_credentials,
                    patch("library.views.send_welcome_email.delay") as queue_welcome,
                    self.captureOnCommitCallbacks() as callbacks,
                ):
                    response = client.post(
                        f"/api/{endpoint}/",
                        payload if endpoint == "login" else signup_payload,
                        format="json",
                        HTTP_ORIGIN=self.origin,
                    )
                self.assertEqual(response.status_code, 403)
                self.assert_session(client, self.reader.pk, self.reader.username)
                check_credentials.assert_not_called()
                queue_welcome.assert_not_called()
                self.assertEqual(callbacks, [])
                self.assertCountEqual(User.objects.values_list("pk", flat=True), [self.reader.pk, other.pk])
                self.assertFalse(List.objects.exists())

    def assert_session(self, client, user_id, username):
        response = client.get("/api/me/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"user": {"id": user_id, "username": username}})

    def assert_rotated_token_allows_write(self, client, old_token, old_cookie, auth_response):
        cookie = auth_response.cookies[settings.CSRF_COOKIE_NAME].value
        self.assertNotEqual(cookie, old_cookie)
        payload = {"name": "Book notes"}
        stale = client.post(
            "/api/lists/", payload, format="json", HTTP_ORIGIN=self.origin,
            HTTP_X_CSRFTOKEN=old_token,
        )
        self.assertEqual(stale.status_code, 403)
        self.assertFalse(List.objects.filter(name=payload["name"]).exists())
        fresh = client.post(
            "/api/lists/", payload, format="json", HTTP_ORIGIN=self.origin,
            HTTP_X_CSRFTOKEN=self.csrf_token(client),
        )
        self.assertEqual(fresh.status_code, 201)
        self.assertEqual(fresh.json()["name"], payload["name"])

    def test_login_starts_session_and_rotates_csrf_token(self):
        client = APIClient(enforce_csrf_checks=True)
        token = self.csrf_token(client)
        cookie = client.cookies[settings.CSRF_COOKIE_NAME].value
        response = client.post(
            "/api/login/",
            {"username": self.reader.username, "password": self.password},
            format="json", HTTP_ORIGIN=self.origin, HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"id": self.reader.pk, "username": self.reader.username})
        self.assert_session(client, self.reader.pk, self.reader.username)
        self.assert_rotated_token_allows_write(client, token, cookie, response)

    def test_signup_starts_session_creates_system_lists_and_queues_welcome(self):
        client = APIClient(enforce_csrf_checks=True)
        token = self.csrf_token(client)
        cookie = client.cookies[settings.CSRF_COOKIE_NAME].value
        with patch("library.views.send_welcome_email.delay") as queue_welcome:
            with self.captureOnCommitCallbacks() as callbacks:
                response = client.post(
                    "/api/signup/",
                    {
                        "username": "new-reader",
                        "email": "new-reader@example.test",
                        "password": self.password,
                    },
                    format="json",
                    HTTP_ORIGIN=self.origin,
                    HTTP_X_CSRFTOKEN=token,
                )
            self.assertEqual(response.status_code, 200)
            user_id = response.json()["id"]
            self.assertEqual(
                response.json(),
                {"id": user_id, "username": "new-reader", "email": "new-reader@example.test"},
            )
            queue_welcome.assert_not_called()
            self.assertEqual(len(callbacks), 1)
            callbacks[0]()
            queue_welcome.assert_called_once_with(user_id)

        self.assert_session(client, user_id, "new-reader")
        self.assertCountEqual(
            List.objects.filter(user_id=user_id).values_list("name", "is_system"),
            [("Favourites", True), ("Want to Read", True)],
        )
        self.assert_rotated_token_allows_write(client, token, cookie, response)

    def test_valid_csrf_preserves_auth_validation_errors(self):
        client = APIClient(enforce_csrf_checks=True)
        headers = {"HTTP_ORIGIN": self.origin, "HTTP_X_CSRFTOKEN": self.csrf_token(client)}
        login = client.post(
            "/api/login/", {"username": self.reader.username, "password": "incorrect"},
            format="json", **headers,
        )
        self.assertEqual(login.status_code, 400)
        self.assertEqual(login.json(), {"error": "Invalid credentials"})
        payload = {
            "username": "new-reader",
            "email": "new-reader@example.test",
            "password": self.password,
        }
        cases = (
            ({"username": ""}, "Username, email, and password required"),
            ({"username": self.reader.username}, "Username already taken"),
            ({"email": self.reader.email}, "Email already registered"),
            ({"email": "invalid"}, "Enter a valid email address"),
            ({"password": "abc"}, "This password is too short. It must contain at least 6 characters."),
        )
        for changes, error in cases:
            with self.subTest(error=error):
                signup = client.post("/api/signup/", {**payload, **changes}, format="json", **headers)
                self.assertEqual(signup.status_code, 400)
                self.assertEqual(signup.json(), {"error": error})
        self.assertEqual(client.get("/api/me/").json(), {"user": None})

    def test_https_auth_checks_referer_without_origin(self):
        client = APIClient(enforce_csrf_checks=True)
        token = self.csrf_token(client)
        cases = (
            ({}, 403),
            ({"HTTP_REFERER": "https://unlisted.example.test/form"}, 403),
            ({"HTTP_REFERER": "https://testserver/form"}, 400),
        )
        for endpoint in ("login", "signup"):
            for headers, expected_status in cases:
                with self.subTest(endpoint=endpoint, referer=headers.get("HTTP_REFERER")):
                    response = client.post(
                        f"/api/{endpoint}/", {}, format="json", secure=True,
                        HTTP_X_CSRFTOKEN=token, **headers,
                    )
                    self.assertEqual(response.status_code, expected_status)


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
