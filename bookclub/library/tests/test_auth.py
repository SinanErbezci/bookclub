from unittest.mock import patch

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from library.models import List


User = get_user_model()


@override_settings(
    CACHES={
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        }
    }
)
class AuthenticationAPITests(APITestCase):
    def setUp(self):
        cache.clear()
        self.addCleanup(cache.clear)
        self.client = APIClient(enforce_csrf_checks=True)
        self.password = "StrongPass123!"
        self.user = User.objects.create_user(
            username="existing_reader",
            email="existing@example.com",
            password=self.password,
        )

    def post_with_csrf(self, path, data=None):
        bootstrap = self.client.get("/api/csrf/")
        self.assertEqual(bootstrap.status_code, status.HTTP_200_OK)
        return self.client.post(
            path, data, format="json", HTTP_X_CSRFTOKEN=bootstrap.json()["csrfToken"]
        )

    def test_anonymous_me_returns_no_user(self):
        response = self.client.get("/api/me/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, {"user": None})

    def test_csrf_endpoint_returns_token(self):
        response = self.client.get("/api/csrf/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json().get("csrfToken"))
        self.assertIn(settings.CSRF_COOKIE_NAME, response.cookies)

    def test_login_with_valid_credentials(self):
        response = self.post_with_csrf(
            "/api/login/",
            {"username": self.user.username, "password": self.password},
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], self.user.username)
        self.assertEqual(
            self.client.get("/api/me/").data["user"]["id"],
            self.user.id,
        )

    def test_login_with_invalid_credentials(self):
        response = self.post_with_csrf(
            "/api/login/",
            {"username": self.user.username, "password": "wrong-password"},
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(self.client.get("/api/me/").data, {"user": None})

    def test_logout_clears_session(self):
        self.client.login(username=self.user.username, password=self.password)
        response = self.post_with_csrf("/api/logout/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get("/api/me/").data, {"user": None})

    def test_signup_creates_user_system_lists_and_schedules_email(self):
        with patch("library.views.send_welcome_email.delay") as send_email:
            with self.captureOnCommitCallbacks(execute=True) as callbacks:
                response = self.post_with_csrf(
                    "/api/signup/",
                    {
                        "username": "new_reader",
                        "email": "new@example.com",
                        "password": self.password,
                    },
                )

            self.assertEqual(response.status_code, status.HTTP_200_OK)
            user = User.objects.get(username="new_reader")
            self.assertEqual(
                set(List.objects.filter(user=user, is_system=True).values_list("name", flat=True)),
                {"Favourites", "Want to Read"},
            )
            self.assertEqual(len(callbacks), 1)
            send_email.assert_called_once_with(user.id)
            self.assertEqual(self.client.get("/api/me/").data["user"]["id"], user.id)

    def test_signup_rejects_duplicate_username(self):
        response = self.post_with_csrf(
            "/api/signup/",
            {
                "username": self.user.username,
                "email": "different@example.com",
                "password": self.password,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 1)

    def test_signup_rejects_invalid_email(self):
        response = self.post_with_csrf(
            "/api/signup/",
            {
                "username": "new_reader",
                "email": "not-an-email",
                "password": self.password,
            },
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username="new_reader").exists())

    def test_anonymous_cannot_create_list(self):
        response = self.client.post(
            "/api/lists/", {"name": "My Books"}, format="json"
        )
        self.assertIn(
            response.status_code,
            [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN],
        )
        self.assertEqual(List.objects.count(), 0)

    def test_anonymous_can_browse_books(self):
        response = self.client.get("/api/books/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
