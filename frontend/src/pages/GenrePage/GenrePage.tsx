import {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useParams } from "react-router-dom";

import {
  getBooksByGenrePaginated,
} from "../../api/books";
import { getGenreById } from "../../api/genres";

import BookGrid from "../../components/BookGrid/BookGrid";
import NotFoundPage from "../NotFoundPage";

import type { Genre } from "../../types/genre";
import type { BookListItem } from "../../types/book";

import styles from "./GenrePage.module.css";

function GenrePage() {
  const { id } =
    useParams<{ id: string }>();

  const [genre, setGenre] =
    useState<Genre | null>(null);

  const [genreLoading, setGenreLoading] =
    useState(true);

  const [books, setBooks] =
    useState<BookListItem[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [nextPage, setNextPage] =
    useState<number | null>(1);

  const [error, setError] =
    useState<string | null>(null);

  const loaderRef =
    useRef<HTMLDivElement | null>(null);

  const fetchBooks = useCallback(
    async (page: number): Promise<void> => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const data =
          await getBooksByGenrePaginated(
            Number(id),
            page,
          );

        setBooks((prev) => {
          const existingIds = new Set(
            prev.map((book) => book.id),
          );

          const newBooks =
            data.results.filter(
              (book) =>
                !existingIds.has(book.id),
            );

          return [
            ...prev,
            ...newBooks,
          ];
        });

        setNextPage(
          data.next
            ? page + 1
            : null,
        );
      } catch (err) {
        console.error(
          "Books fetch error:",
          err,
        );

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "Failed to load books.",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [id],
  );

  // Fetch genre name
  useEffect(() => {
    if (
      !id ||
      !/^\d+$/.test(id)
    ) {
      setGenre(null);
      setGenreLoading(false);
      return;
    }

    async function fetchGenre(): Promise<void> {
      try {
        setGenreLoading(true);

        const data = await getGenreById(Number(id));

        setGenre(data);
      } catch (err) {
        console.error(
          "Genre fetch error:",
          err,
        );

        setGenre(null);
      } finally {
        setGenreLoading(false);
      }
    }

    void fetchGenre();
  }, [id]);

  // Reset + initial fetch
  // when genre changes
  useEffect(() => {
    setBooks([]);
    setNextPage(1);
    setError(null);

    void fetchBooks(1);
  }, [id, fetchBooks]);

  // Infinite scroll observer
  useEffect(() => {
    const observer =
      new IntersectionObserver(
        (entries) => {
          const first =
            entries[0];

          if (
            first.isIntersecting &&
            nextPage !== null &&
            !loading
          ) {
            void fetchBooks(
              nextPage,
            );
          }
        },
        {
          threshold: 0.5,
        },
      );

    const current =
      loaderRef.current;

    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [
    nextPage,
    loading,
    fetchBooks,
  ]);

  if (!genre && !genreLoading) {
    return <NotFoundPage />;
  }

  return (
    <div className="container mt-5">
      <h1 className={styles.title}>
        {genre
          ? genre.name
          : "Loading..."}
      </h1>

      <BookGrid
        books={books}
        loading={
          loading &&
          books.length === 0
        }
        skeletonCount={8}
      />

      {loading &&
        books.length > 0 && (
          <div
            className={
              styles.loadingMore
            }
          >
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
        className={
          styles.infiniteLoader
        }
      />
    </div>
  );
}

export default GenrePage;