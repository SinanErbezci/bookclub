import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import { searchBooks } from "../api/search";

import BookCard from "../components/BookCard";
import SkeletonCard from "../components/SkeletonCard";

function SearchPage() {
  const [searchParams] = useSearchParams();

  const query =
    searchParams.get("q") || "";

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function fetchResults() {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const data =
          await searchBooks(query);

        setResults(data);

      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();

  }, [query]);

  return (
    <div className="container mt-5">

      <h1 className="mb-4">
        Search Results
      </h1>

      <p className="mb-4">
        Results for: <strong>{query}</strong>
      </p>

      <div className="genre-grid">

        {loading ? (
          Array.from({ length: 8 }).map(
            (_, i) => (
              <SkeletonCard key={i} />
            )
          )
        ) : results.length === 0 ? (
          <p>No books found.</p>
        ) : (
          results.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              showAuthor
            />
          ))
        )}

      </div>

    </div>
  );
}

export default SearchPage;