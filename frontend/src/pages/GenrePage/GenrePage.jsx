import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";

import { getBooksByGenrePaginated } from "../../api/books";
import { getGenreById } from "../../api/genres";
import BookGrid from "../../components/BookGrid/BookGrid";
import NotFoundPage from "../NotFoundPage";
import styles from "./GenrePage.module.css";

function GenrePage() {
  const { id } = useParams();

  const [genre, setGenre] = useState(null);
  const [genreLoading, setGenreLoading] =
    useState(true);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(1);
  const [error, setError] = useState(null);

  const loaderRef = useRef(null);

  const fetchBooks = useCallback(async (page) => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await getBooksByGenrePaginated(
          id,
          page
        );

      setBooks((prev) => {
        const existingIds = new Set(
          prev.map((b) => b.id)
        );

        const newBooks =
          data.results.filter(
            (b) => !existingIds.has(b.id)
          );

        return [...prev, ...newBooks];
      });

      setNextPage(
        data.next ? page + 1 : null
      );
    } catch (err) {
      console.error("Books fetch error:", err);
      setError(err.message);

    } finally {
      setLoading(false);
    }
  }, [id]);

  // 🔹 Fetch genre name
  useEffect(() => {
    const isValidGenreId = /^\d+$/.test(id);

    if (!isValidGenreId) {
      setGenre(null);
      setGenreLoading(false);
      return;
    }

    async function fetchGenre() {
      try {
        setGenreLoading(true);

        const data = await getGenreById(id);

        setGenre(data);
      } catch (err) {
        console.error(
          "Genre fetch error:",
          err
        );

        setGenre(null);
      } finally {
        setGenreLoading(false);
      }
    }


    fetchGenre();
  }, [id]);

  // 🔹 Reset + initial fetch when genre changes
  useEffect(() => {
    setBooks([]);
    setNextPage(1);
    setError(null);
    fetchBooks(1);
  }, [id, fetchBooks]);

  // 🔹 Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];

        if (first.isIntersecting && nextPage && !loading) {
          fetchBooks(nextPage);
        }
      },
      { threshold: 0.5 }
    );

    const current = loaderRef.current;

    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [nextPage, loading, fetchBooks]);

  if (!genre && !genreLoading) {
    return <NotFoundPage />;
  }
  return (
    <div className="container mt-5">

      <h1 className={styles.title}>
        {genre ? genre.name : "Loading..."}
      </h1>

      <BookGrid
        books={books}
        loading={loading && books.length === 0}
        skeletonCount={8}
      />

      {loading && books.length > 0 && (
        <div className={styles.loadingMore}>
          Loading...
        </div>
      )}

      {error && (
        <p className={styles.error}>
          {error}
        </p>
      )}

      <div
        ref={loaderRef}
        className={styles.infiniteLoader}
      />

    </div>
  );
};

export default GenrePage;