import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { getBooksByGenrePaginated } from "../api/books";
import { getGenreById } from "../api/genres";

import BookCard from "../components/BookCard";
import SkeletonRow from "../components/SkeletonRow";

function GenrePage() {
  const { id } = useParams();

  const [genre, setGenre] = useState(null);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(1);

  const loaderRef = useRef(null);

  // 🔹 Fetch genre name
  useEffect(() => {
    async function fetchGenre() {
      try {
        const data = await getGenreById(id);
        setGenre(data);
      } catch (err) {
        console.error("Genre fetch error:", err);
      }
    }

    fetchGenre();
  }, [id]);

  // 🔹 Reset + initial fetch when genre changes
  useEffect(() => {
    setBooks([]);
    setNextPage(1);
    fetchBooks(1);
  }, [id]);

  // 🔹 Fetch paginated books
  async function fetchBooks(page) {
    try {
      setLoading(true);

      const data = await getBooksByGenrePaginated(id, page);

      // ✅ deduplicate safely
      setBooks((prev) => {
        const existingIds = new Set(prev.map((b) => b.id));

        const newBooks = data.results.filter(
          (b) => !existingIds.has(b.id)
        );

        return [...prev, ...newBooks];
      });

      setNextPage(data.next ? page + 1 : null);

    } catch (err) {
      console.error("Books fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

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
  }, [nextPage, loading]);

  return (
    <div className="container mt-5">

      {/* 🔹 Title */}
      <h1 className="genre-title">
        {genre ? genre.name : "Loading..."}
      </h1>

      {/* 🔹 Grid */}
      <div className="genre-grid">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}

        {/* initial skeleton */}
        {loading && books.length === 0 && <SkeletonRow count={4} />}
      </div>

      {/* 🔹 Loading more indicator */}
      {loading && books.length > 0 && (
        <div className="loading-more">Loading...</div>
      )}

      {/* 🔹 Sentinel element */}
      <div ref={loaderRef} className="infinite-loader" />

    </div>
  );
}

export default GenrePage;