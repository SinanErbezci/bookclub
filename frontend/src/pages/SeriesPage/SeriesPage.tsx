import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getSeriesById } from "../../api/books";
import { ApiError } from "../../types/api";

import CarouselSection from "../../components/CarouselSection/CarouselSection";
import BookCard from "../../components/BookCard";
import NotFoundPage from "../NotFoundPage";

import type { SeriesDetail } from "../../types/book";

import styles from "./SeriesPage.module.css";

function SeriesPage() {
  const { id } = useParams<{ id: string }>();

  const [series, setSeries] =
    useState<SeriesDetail | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<ApiError | null>(null);

  useEffect(() => {
    if (!id || !/^\d+$/.test(id)) {
      setSeries(null);
      setLoading(false);
      return;
    }

    async function fetchSeries(): Promise<void> {
      try {
        setLoading(true);
        setError(null);

        const data = await getSeriesById(Number(id));

        setSeries(data);
      } catch (err) {
        console.error(
          "Series fetch error:",
          err,
        );

        setSeries(null);

        if (err instanceof ApiError) {
          setError(err);
        } else {
          setError(
            new ApiError(
              "Failed to load series.",
              500,
              null,
            ),
          );
        }
      } finally {
        setLoading(false);
      }
    }

    fetchSeries();
  }, [id]);

  if (error?.status === 404) {
    return <NotFoundPage />;
  }

  if (error) {
    return (
      <p className={styles.error}>
        Failed to load series.
      </p>
    );
  }

  if (!series && !loading) {
    return <NotFoundPage />;
  }

  return (
    <div className="container mt-5">
      <header className={styles.header}>
        <h1 className={styles.title}>
          {series?.name || "Loading..."}
        </h1>

        {!loading && series && (
          <p className={styles.meta}>
            {series.books.length}{" "}
            {series.books.length === 1
              ? "book"
              : "books"}
          </p>
        )}
      </header>

      <div className={styles.booksSection}>
        <CarouselSection
          title={`Books in ${series?.name || "this series"
            }`}
          items={series?.books || []}
          loading={loading}
          renderItem={(book) => (
            <BookCard
              key={book.id}
              book={book}
              showAuthor
            />
          )}
        />
      </div>
    </div>
  );
}

export default SeriesPage;