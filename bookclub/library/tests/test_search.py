from unittest.mock import patch

from django.test import TestCase
from rest_framework.test import APIClient

from ai.models import BookEmbedding
from library.models import Author, Book


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
