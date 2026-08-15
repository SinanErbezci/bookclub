import { useEffect, useState } from "react";

import { getRecentBooks } from "../../api/books";
import { getRandomAuthor } from "../../api/authors";
import { getRandomGenre } from "../../api/genres";

import type { BookListItem } from "../../types/book";
import type { Author } from "../../types/author";
import type { RandomGenre } from "../../types/genre";

import SemanticDiscovery from "../../components/SemanticDiscovery/SemanticDiscovery";
import BookCard from "../../components/BookCard";
import CarouselSection from "../../components/CarouselSection/CarouselSection";

function Browse() {
  const [recentBooks, setRecentBooks] =
    useState<BookListItem[]>([]);

  const [author, setAuthor] =
    useState<Author | null>(null);

  const [genre, setGenre] =
    useState<RandomGenre | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function fetchBrowseData(): Promise<void> {
      setLoading(true);

      const [
        recentBooksResponse,
        authorResponse,
        genreResponse,
      ] = await Promise.allSettled([
        getRecentBooks(),
        getRandomAuthor(),
        getRandomGenre(),
      ]);

      if (
        recentBooksResponse.status === "fulfilled"
      ) {
        setRecentBooks(
          recentBooksResponse.value,
        );
      }

      if (
        authorResponse.status === "fulfilled"
      ) {
        setAuthor(authorResponse.value);
      }

      if (
        genreResponse.status === "fulfilled"
      ) {
        setGenre(genreResponse.value);
      }

      setLoading(false);
    }

    fetchBrowseData();
  }, []);

  return (
    <div className="container mt-4">
      <SemanticDiscovery />

      <CarouselSection
        title="Recently Added"
        items={recentBooks}
        loading={loading}
        renderItem={(book) => (
          <BookCard
            key={book.id}
            book={book}
            showAuthor
          />
        )}
      />

      <CarouselSection
        title={
          author
            ? `Author: ${author.name}`
            : "Author: "
        }
        titleLink={
          author
            ? `/authors/${author.id}`
            : undefined
        }
        items={author?.books}
        loading={loading}
        renderItem={(book) => (
          <BookCard
            key={book.id}
            book={book}
          />
        )}
      />

      <CarouselSection
        title={
          genre
            ? `Genre: ${genre.name}`
            : "Genre: "
        }
        titleLink={
          genre
            ? `/genres/${genre.id}`
            : undefined
        }
        items={genre?.books}
        loading={loading}
        renderItem={(book) => (
          <BookCard
            key={book.id}
            book={book}
          />
        )}
      />
    </div>
  );
}

export default Browse;