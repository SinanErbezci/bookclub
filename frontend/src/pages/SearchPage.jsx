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

  const page =
    searchParams.get("page") || 1;

  const [results, setResults] =
    useState({
      books: [],
      books_count: 0,
      next: null,
      previous: null,
      authors: [],
      genres: [],
    });

  const [loading, setLoading] =
    useState(true);

  const totalPages = Math.ceil(
    results.books_count / 10
  );

  useEffect(() => {
    async function fetchResults() {
      if (!query.trim()) {
        setResults({
          books: [],
          books_count: 0,
          next: null,
          previous: null,
          authors: [],
          genres: [],
        });

        setLoading(false);

        return;
      }

      try {
        setLoading(true);

        const data =
          await searchAll(query, page, "full");

        setResults(data);

      } catch {
        setResults({
          books: [],
          books_count: 0,
          next: null,
          previous: null,
          authors: [],
          genres: [],
        });
      } finally {
        setLoading(false);
      }
    }

    fetchResults();

  }, [query, page]);

  const hasResults =
    results.books.length > 0 ||
    results.authors.length > 0 ||
    results.genres.length > 0;


  function getVisiblePages() {
    const currentPage = Number(page);

    const pages = [];

    // ALWAYS show first page
    pages.push(1);

    // LEFT ELLIPSIS
    if (currentPage > 4) {
      pages.push("...");
    }

    // MIDDLE PAGES
    for (
      let i = currentPage - 1;
      i <= currentPage + 1;
      i++
    ) {
      if (
        i > 1 &&
        i < totalPages
      ) {
        pages.push(i);
      }
    }

    // RIGHT ELLIPSIS
    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    // ALWAYS show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return [...new Set(pages)];
  }
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
            length: 10,
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
                {results.books_count} books found for "{query}"
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
              <div className="d-flex gap-2 mt-4 align-items-center justify-content-center flex-wrap">

                {results.previous && (
                  <Link
                    to={`/search?q=${query}&page=${Number(page) - 1
                      }`}
                    className="btn btn-outline-dark"
                  >
                    Previous
                  </Link>
                )}

                {getVisiblePages().map(
                  (item, index) => {

                    if (item === "...") {
                      return (
                        <span
                          key={index}
                          className="px-2"
                        >
                          ...
                        </span>
                      );
                    }

                    return (
                      <Link
                        key={item}
                        to={`/search?q=${query}&page=${item}`}
                        className={`btn ${Number(page) === item
                            ? "btn-dark"
                            : "btn-outline-dark"
                          }`}
                      >
                        {item}
                      </Link>
                    );
                  }
                )}

                {results.next && (
                  <Link
                    to={`/search?q=${query}&page=${Number(page) + 1
                      }`}
                    className="btn btn-outline-dark"
                  >
                    Next
                  </Link>
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