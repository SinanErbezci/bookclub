import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { searchBooks } from "../../api/search";

import styles from "./SearchBar.module.css";

function SearchBar() {
  const [query, setQuery] = useState("");

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);

  const [selectedIndex, setSelectedIndex] =
    useState(-1);

  const resultRefs = useRef([]);

  const wrapperRef = useRef(null);

  const navigate = useNavigate();

  // close dropdown outside click
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
      setSelectedIndex(-1);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const data = await searchBooks(query);

        setResults(data);

        setOpen(true);

        setSelectedIndex(-1);

      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);

  }, [query]);

  useEffect(() => {
    if (
      selectedIndex >= 0 &&
      resultRefs.current[selectedIndex]
    ) {
      resultRefs.current[
        selectedIndex
      ].scrollIntoView({
        block: "nearest",
      });
    }
  }, [selectedIndex]);

  function handleKeyDown(e) {
    if (!open) return;

    // DOWN
    if (e.key === "ArrowDown") {
      e.preventDefault();

      setSelectedIndex((prev) =>
        prev < results.length - 1
          ? prev + 1
          : prev
      );
    }

    // UP
    if (e.key === "ArrowUp") {
      e.preventDefault();

      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    }

    // ESC
    if (e.key === "Escape") {
      setOpen(false);
    }

    // ENTER
    if (e.key === "Enter") {
      // selected dropdown item
      if (
        selectedIndex >= 0 &&
        results[selectedIndex]
      ) {
        navigate(
          `/books/${results[selectedIndex].id}`
        );

      } else {
        // full search page
        navigate(
          `/search?q=${encodeURIComponent(query)}`
        );
      }

      setOpen(false);
    }
  }

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
            onKeyDown={handleKeyDown}
            className={styles.input}
          />

          <button
            className={styles.button}
            type="button"
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

            ) : results.length === 0 ? (
              <div className={styles.empty}>
                No books found
              </div>

            ) : (
              results.map((book, index) => (
                <Link
                  ref={(el) =>
                    (resultRefs.current[index] = el)
                  }
                  key={book.id}
                  to={`/books/${book.id}`}
                  className={`${styles.result} ${selectedIndex === index
                    ? styles.active
                    : ""
                    }`}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <img
                    src={book.cover}
                    alt={book.title}
                    className={styles.cover}
                  />

                  <div className={styles.resultContent}>

                    <div className={styles.resultTitle}>
                      {book.title}
                    </div>

                    <div className={styles.resultAuthor}>
                      {book.author_name}
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