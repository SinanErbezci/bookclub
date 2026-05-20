import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import { searchAll } from "../api/search";

import BookCard from "../components/BookCard";
import SkeletonCard from "../components/SkeletonCard";

function SearchPage() {
  const [searchParams] =
    useSearchParams();

  const query =
    searchParams.get("q") || "";

  const [results, setResults] =
    useState({
      books: [],
      authors: [],
      genres: [],
    });

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!query.trim()) {
        setResults({
          books: [],
          authors: [],
          genres: [],
        });

        setLoading(false);

        return;
      }

      try {
        setLoading(true);

        const data =
          await searchAll(query);

        setResults(data);

      } catch {
        setResults({
          books: [],
          authors: [],
          genres: [],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchResults();

  }, [query]);

  const hasResults =
    results.books.length > 0 ||
    results.authors.length > 0 ||
    results.genres.length > 0;

  return (
    <div className="container mt-5">

      <h1 className="mb-2">
        Search Results
      </h1>

      <p className="mb-5">
        Results for:
        {" "}
        <strong>{query}</strong>
      </p>

      {loading ? (
        <div className="genre-grid">
          {Array.from({
            length: 8,
          }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

      ) : !hasResults ? (
        <p>
          No books, authors, or genres
          found.
        </p>

      ) : (
        <>
          {/* BOOKS */}
          {results.books.length > 0 && (
            <section className="mb-5">

              <h2 className="form-title mb-4">
                Books
                {" "}
                ({results.books.length})
              </h2>

              <div className="genre-grid">

                {results.books.map(
                  (book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      showAuthor
                    />
                  )
                )}

              </div>

            </section>
          )}

          {/* AUTHORS */}
          {results.authors.length > 0 && (
            <section className="mb-5">

              <h2 className="form-title mb-4">
                Authors
                {" "}
                ({results.authors.length})
              </h2>

              <div className="d-flex flex-column gap-3">

                {results.authors.map(
                  (author) => (
                    <Link
                      key={author.id}
                      to={`/authors/${author.id}`}
                      className="book-link"
                    >
                      {author.name}
                    </Link>
                  )
                )}

              </div>

            </section>
          )}

          {/* GENRES */}
          {results.genres.length > 0 && (
            <section className="mb-5">

              <h2 className="form-title mb-4">
                Genres
                {" "}
                ({results.genres.length})
              </h2>

              <div className="d-flex flex-column gap-3">

                {results.genres.map(
                  (genre) => (
                    <Link
                      key={genre.id}
                      to={`/genres/${genre.id}`}
                      className="book-link"
                    >
                      {genre.name}
                    </Link>
                  )
                )}

              </div>

            </section>
          )}
        </>
      )}

    </div>
  );
}

export default SearchPage;