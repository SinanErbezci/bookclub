"""API tests for user-owned reading lists."""

from django.test import override_settings
from rest_framework.test import APITestCase

from library.models import Author, Book, List as BookList, ListBook, User


@override_settings(
    CACHES={
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        }
    }
)
class BookListAPITests(APITestCase):
    @classmethod
    def setUpTestData(cls):
        cls.alice = User.objects.create_user(
            username="alice", email="alice@example.com", password="test-pass-123"
        )
        cls.bob = User.objects.create_user(
            username="bob", email="bob@example.com", password="test-pass-123"
        )
        cls.author = Author.objects.create(name="Test Author")
        cls.book = Book.objects.create(
            source="test",
            source_row_id="book-1",
            title="Test Book",
            author=cls.author,
        )
        cls.alice_list = BookList.objects.create(user=cls.alice, name="Sci-Fi")
        cls.bob_list = BookList.objects.create(user=cls.bob, name="Bob's Books")
        cls.system_list = BookList.objects.create(
            user=cls.alice, name="Favourites", is_system=True
        )

    def login_as_alice(self):
        # Bypass login here: this suite tests list permissions, not authentication.
        self.client.force_authenticate(user=self.alice)

    def test_anonymous_cannot_read_lists(self):
        response = self.client.get("/api/lists/")
        self.assertEqual(response.status_code, 403)

    def test_user_only_sees_their_own_lists(self):
        self.login_as_alice()
        response = self.client.get("/api/lists/")
        self.assertEqual(response.status_code, 200)
        returned_ids = {item["id"] for item in response.data}
        self.assertEqual(returned_ids, {self.alice_list.id, self.system_list.id})
        self.assertNotIn(self.bob_list.id, returned_ids)

    def test_create_list_trims_whitespace(self):
        self.login_as_alice()
        response = self.client.post("/api/lists/", {"name": "  Classics  "}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["name"], "Classics")
        self.assertTrue(
            BookList.objects.filter(user=self.alice, name="Classics", is_system=False).exists()
        )

    def test_reject_blank_list_name(self):
        self.login_as_alice()
        response = self.client.post("/api/lists/", {"name": "   "}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_reject_duplicate_list_name(self):
        self.login_as_alice()
        response = self.client.post("/api/lists/", {"name": "Sci-Fi"}, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(BookList.objects.filter(user=self.alice, name="Sci-Fi").count(), 1)

    def test_add_book_to_own_list(self):
        self.login_as_alice()
        url = f"/api/lists/{self.alice_list.id}/books/"
        response = self.client.post(url, {"book_id": self.book.id}, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["created"])
        self.assertTrue(
            ListBook.objects.filter(book_list=self.alice_list, book=self.book).exists()
        )

    def test_adding_same_book_twice_is_idempotent(self):
        self.login_as_alice()
        url = f"/api/lists/{self.alice_list.id}/books/"
        first = self.client.post(url, {"book_id": self.book.id}, format="json")
        second = self.client.post(url, {"book_id": self.book.id}, format="json")
        self.assertEqual(first.status_code, 201)
        self.assertEqual(second.status_code, 200)
        self.assertFalse(second.data["created"])
        self.assertEqual(
            ListBook.objects.filter(book_list=self.alice_list, book=self.book).count(), 1
        )

    def test_add_book_requires_book_id(self):
        self.login_as_alice()
        response = self.client.post(
            f"/api/lists/{self.alice_list.id}/books/", {}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_cannot_add_book_to_another_users_list(self):
        self.login_as_alice()
        response = self.client.post(
            f"/api/lists/{self.bob_list.id}/books/",
            {"book_id": self.book.id},
            format="json",
        )
        self.assertEqual(response.status_code, 404)
        self.assertFalse(
            ListBook.objects.filter(book_list=self.bob_list, book=self.book).exists()
        )

    def test_remove_book_from_own_list(self):
        ListBook.objects.create(book_list=self.alice_list, book=self.book)
        self.login_as_alice()
        response = self.client.delete(
            f"/api/lists/{self.alice_list.id}/books/{self.book.id}/"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["deleted"])
        self.assertFalse(
            ListBook.objects.filter(book_list=self.alice_list, book=self.book).exists()
        )

    def test_cannot_remove_book_from_another_users_list(self):
        ListBook.objects.create(book_list=self.bob_list, book=self.book)
        self.login_as_alice()
        response = self.client.delete(
            f"/api/lists/{self.bob_list.id}/books/{self.book.id}/"
        )
        self.assertEqual(response.status_code, 404)
        self.assertTrue(
            ListBook.objects.filter(book_list=self.bob_list, book=self.book).exists()
        )

    def test_delete_own_custom_list(self):
        self.login_as_alice()
        response = self.client.delete(f"/api/lists/{self.alice_list.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(BookList.objects.filter(id=self.alice_list.id).exists())

    def test_cannot_delete_system_list(self):
        self.login_as_alice()
        response = self.client.delete(f"/api/lists/{self.system_list.id}/")
        self.assertEqual(response.status_code, 403)
        self.assertTrue(BookList.objects.filter(id=self.system_list.id).exists())

    def test_cannot_delete_another_users_list(self):
        self.login_as_alice()
        response = self.client.delete(f"/api/lists/{self.bob_list.id}/")
        self.assertEqual(response.status_code, 404)
        self.assertTrue(BookList.objects.filter(id=self.bob_list.id).exists())
