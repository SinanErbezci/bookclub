import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { searchAll } from "../../api/search";
import type {
  SearchAuthor,
  SearchBook,
  SearchGenre,
} from "../../types/search";

import bookPlaceholder from "../../assets/placeholder_book.png";
import styles from "./SearchBar.module.css";

type SearchResult =
  | (SearchBook & { type: "book" })
  | (SearchAuthor & { type: "author" })
  | (SearchGenre & { type: "genre" });

interface SearchResults {
  books: SearchBook[];
  authors: SearchAuthor[];
  genres: SearchGenre[];
}

function SearchBar() {
  const [query, setQuery] = useState("");

  const [results, setResults] =
    useState<SearchResults>({
      books: [],
      authors: [],
      genres: [],
    });

  const [loading, setLoading] =
    useState(false);

  const [open, setOpen] =
    useState(false);

  const [selectedIndex, setSelectedIndex] =
    useState(-1);

  const wrapperRef =
    useRef<HTMLDivElement>(null);

  const resultRefs =
    useRef<(HTMLAnchorElement | null)[]>([]);

  const navigate = useNavigate();

  const flatResults: SearchResult[] = [
    ...results.books.map((item) => ({
      ...item,
      type: "book" as const,
    })),

    ...results.authors.map((item) => ({
      ...item,
      type: "author" as const,
    })),

    ...results.genres.map((item) => ({
      ...item,
      type: "genre" as const,
    })),
  ];

  const hasResults =
    flatResults.length > 0;

  function handleSearchSubmit(): void {
    if (!query.trim() || loading) return;

    navigate(
      `/search?q=${encodeURIComponent(query)}`,
    );

    setResults({
      books: [],
      authors: [],
      genres: [],
    });

    setSelectedIndex(-1);
    setOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(
      e: MouseEvent,
    ): void {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          e.target as Node,
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({
        books: [],
        authors: [],
        genres: [],
      });

      setOpen(false);
      setSelectedIndex(-1);

      return;
    }

    const timeout = setTimeout(
      async () => {
        try {
          setLoading(true);

          const data = await searchAll(
            query,
            1,
            "dropdown",
          );

          setResults(data);
          setOpen(true);
          setSelectedIndex(-1);
        } catch {
          setResults({
            books: [],
            authors: [],
            genres: [],
          });
        } finally {
          setLoading(false);
        }
      },
      300,
    );

    return () =>
      clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (
      selectedIndex >= 0 &&
      resultRefs.current[selectedIndex]
    ) {
      resultRefs.current[
        selectedIndex
      ]?.scrollIntoView({
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  function navigateToItem(
    item: SearchResult,
  ): void {
    if (item.type === "book") {
      navigate(`/books/${item.id}`);
    }

    if (item.type === "author") {
      navigate(`/authors/${item.id}`);
    }

    if (item.type === "genre") {
      navigate(`/genres/${item.id}`);
    }

    setOpen(false);
    setQuery("");
  }

  function handleKeyDown(
    e: KeyboardEvent<HTMLInputElement>,
  ): void {
    if (e.key === "Enter") {
      if (
        selectedIndex >= 0 &&
        flatResults[selectedIndex]
      ) {
        navigateToItem(
          flatResults[selectedIndex],
        );
      } else {
        handleSearchSubmit();
      }
    }

    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();

      setSelectedIndex((prev) =>
        prev < flatResults.length - 1
          ? prev + 1
          : prev,
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();

      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : 0,
      );
    }

    if (e.key === "Escape") {
      setOpen(false);
    }
  }

  let currentIndex = -1;

  return (
    <div
      className={styles.wrapper}
      ref={wrapperRef}
    >
      <div className={styles.searchBar}>

        <div className={styles.searchBarInput}>

          <input
            type="search"
            placeholder="Search books, authors, genres..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            onKeyDown={handleKeyDown}
            className={styles.input}
          />

          <button
            className={styles.button}
            type="button"
            onClick={handleSearchSubmit}
          >
            <i
              className={`fa-solid fa-magnifying-glass ${loading
                  ? styles.loadingIcon
                  : ""
                }`}
            ></i>
          </button>

        </div>

        {open && (
          <div className={styles.results}>

            {loading ? (
              <div className={styles.empty}>
                Loading...
              </div>

            ) : !hasResults ? (
              <div className={styles.empty}>
                No results found
              </div>

            ) : (
              <>
                {/* BOOKS */}
                {results.books.length > 0 && (
                  <>
                    <div
                      className={
                        styles.sectionTitle
                      }
                    >
                      Books
                    </div>

                    {results.books.map(
                      (book) => {
                        currentIndex++;

                        return (
                          <Link
                            ref={(el) => {
                            resultRefs.current[currentIndex] = el;}}
                            key={`book-${book.id}`}
                            to={`/books/${book.id}`}
                            className={`${styles.result} ${selectedIndex ===
                                currentIndex
                                ? styles.active
                                : ""
                              }`}
                            onClick={() => {
                              setOpen(false);
                              setQuery("");
                            }}
                          >
                            <img
                              src={
                                book.cover ||
                                bookPlaceholder
                              }
                              alt={book.title}
                              className={
                                styles.cover
                              }
                            />

                            <div
                              className={
                                styles.resultContent
                              }
                            >
                              <div
                                className={
                                  styles.resultTitle
                                }
                              >
                                {book.title}
                              </div>

                              <div
                                className={
                                  styles.resultAuthor
                                }
                              >
                                {
                                  book.author_name
                                }
                              </div>
                            </div>
                          </Link>
                        );
                      }
                    )}
                  </>
                )}

                {/* AUTHORS */}
                {results.authors.length > 0 && (
                  <>
                    <div
                      className={
                        styles.sectionTitle
                      }
                    >
                      Authors
                    </div>

                    {results.authors.map(
                      (author) => {
                        currentIndex++;

                        return (
                          <Link
                            ref={(el) => {
                            resultRefs.current[currentIndex] = el;}}
                            key={`author-${author.id}`}
                            to={`/authors/${author.id}`}
                            className={`${styles.result} ${selectedIndex ===
                                currentIndex
                                ? styles.active
                                : ""
                              }`}
                            onClick={() => {
                              setOpen(false);
                              setQuery("");
                            }}
                          >
                            <div
                              className={
                                styles.resultContent
                              }
                            >
                              <div
                                className={
                                  styles.resultTitle
                                }
                              >
                                {author.name}
                              </div>
                            </div>
                          </Link>
                        );
                      }
                    )}
                  </>
                )}

                {/* GENRES */}
                {results.genres.length > 0 && (
                  <>
                    <div
                      className={
                        styles.sectionTitle
                      }
                    >
                      Genres
                    </div>

                    {results.genres.map(
                      (genre) => {
                        currentIndex++;

                        return (
                          <Link
                            ref={(el) => {
                            resultRefs.current[currentIndex] = el;}}
                            key={`genre-${genre.id}`}
                            to={`/genres/${genre.id}`}
                            className={`${styles.result} ${selectedIndex ===
                                currentIndex
                                ? styles.active
                                : ""
                              }`}
                            onClick={() => {
                              setOpen(false);
                              setQuery("");
                            }}
                          >
                            <div
                              className={
                                styles.resultContent
                              }
                            >
                              <div
                                className={
                                  styles.resultTitle
                                }
                              >
                                {genre.name}
                              </div>
                            </div>
                          </Link>
                        );
                      }
                    )}
                  </>
                )}
              </>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default SearchBar;