import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getSeriesById } from "../../api/books";
import CarouselSection from "../../components/CarouselSection/CarouselSection";
import BookCard from "../../components/BookCard";
import NotFoundPage from "../NotFoundPage";

import styles from "./SeriesPage.module.css";

function SeriesPage() {
  const { id } = useParams();

  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isValidSeriesId = /^\d+$/.test(id);

    if (!isValidSeriesId) {
      setSeries(null);
      setLoading(false);
      return;
    }

    async function fetchSeries() {
      try {
        setLoading(true);

        const data = await getSeriesById(id);

        setSeries(data);
      } catch (err) {
        console.error("Series fetch error:", err);
        setSeries(null);
      } finally {
        setLoading(false);
      }
    }

    fetchSeries();
  }, [id]);

  if (!series && !loading) {
    return <NotFoundPage />;
  }

  return (
    <div className="container mt-5">

      <header className={styles.header}>
        <h1 className={styles.title}>
          {series?.name || "Loading..."}
        </h1>

        {!loading && (
          <p className={styles.meta}>
            {series.books.length}{" "}
            {series.books.length === 1 ? "book" : "books"}
          </p>
        )}
      </header>

      <div className={styles.booksSection}>
        <CarouselSection
          title={`Books in ${series?.name || "this series"}`}
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