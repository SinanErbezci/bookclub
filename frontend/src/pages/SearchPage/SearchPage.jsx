import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import { searchAll, semanticSearch } from "../../api/search";
import BookGrid from "../../components/BookGrid/BookGrid";
import styles from "./SearchPage.module.css";

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

  const [semanticBooks, setSemanticBooks] =
    useState([]);

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

        setSemanticBooks([]);

        setLoading(false);

        return;
      }

      try {
        setLoading(true);

        const [
          searchResponse,
          semanticResponse,
        ] = await Promise.allSettled([
          searchAll(query, page, "full"),
          semanticSearch(query),
        ]);

        if (searchResponse.status === "fulfilled") {
          setResults(searchResponse.value);
        } else {
          setResults({
            books: [],
            books_count: 0,
            next: null,
            previous: null,
            authors: [],
            genres: [],
          });
        }

        if (semanticResponse.status === "fulfilled") {
          setSemanticBooks(
            semanticResponse.value
          );
        } else {
          setSemanticBooks([]);
        }

      } catch {
        setResults({
          books: [],
          books_count: 0,
          next: null,
          previous: null,
          authors: [],
          genres: [],
        });

        setSemanticBooks([]);

      } finally {
        setLoading(false);
      }
    }

    fetchResults();

  }, [query, page]);

  const hasResults =
    results.books.length > 0 ||
    semanticBooks.length > 0 ||
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

      <h1 className={styles.title}>
        Search Results
      </h1>

      <p className={styles.query}>
        Results for: <strong>{query}</strong>
      </p>
      {loading ? (
        <BookGrid
          loading={true}
          skeletonCount={10}
        />

      ) : !hasResults ? (
        <p>
          No books, authors, or genres
          found.
        </p>

      ) : (
        <>
          {/* BOOKS */}
          {results.books.length > 0 && (
            <section className={styles.section}>

              <h2 className={styles.sectionTitle}>
                {results.books_count} books found for "{query}"
              </h2>

              <BookGrid
                books={results.books}
                showAuthor
              />
              <div className={styles.pagination}>

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
                          className={styles.ellipsis}
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

          {semanticBooks.length > 0 && (
            <section className={styles.section}>

              <h2 className={styles.sectionTitle}>
                ✨ AI Recommendations
              </h2>

              <BookGrid
                books={semanticBooks}
                showAuthor
              />

            </section>
          )}
          {/* AUTHORS */}
          {results.authors.length > 0 && (
            <section className={styles.section}>

              <h2 className={styles.sectionTitle}>
                Authors
                {" "}
                ({results.authors.length})
              </h2>

              <div className={styles.resultList}>

                {results.authors.map(
                  (author) => (
                    <Link
                      key={author.id}
                      to={`/authors/${author.id}`}
                      className={styles.resultLink}
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
            <section className={styles.section}>

              <h2 className={styles.sectionTitle}>
                Genres
                {" "}
                ({results.genres.length})
              </h2>

              <div className={styles.resultList}>

                {results.genres.map(
                  (genre) => (
                    <Link
                      key={genre.id}
                      to={`/genres/${genre.id}`}
                      className={styles.resultLink}
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