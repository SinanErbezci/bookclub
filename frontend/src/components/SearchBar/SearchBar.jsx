import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { searchBooks } from "../../api/search";

import styles from "./SearchBar.module.css";

function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef(null);

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // debounce search
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const data = await searchBooks(query);

        setResults(data);
        setOpen(true);

      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);

  }, [query]);

  return (
    <div
      className={styles.wrapper}
      ref={wrapperRef}
    >
      <div className={styles.searchBar}>
        <div className={styles.searchBarInput}>

          <input
            type="search"
            placeholder="Search books..."
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            className={styles.input}
          />

          <button
            className={styles.button}
            type="button"
          >
            <i
              className={`fa-solid fa-magnifying-glass ${loading ? styles.loadingIcon : ""
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

            ) : results.length === 0 ? (
              <div className={styles.empty}>
                No books found
              </div>

            ) : (
              results.map((book) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className={styles.result}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <div>
                    <div className={styles.resultTitle}>
                      {book.title}
                    </div>

                    <div className={styles.resultAuthor}>
                      {book.authors}
                    </div>
                  </div>
                </Link>
              ))
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default SearchBar;