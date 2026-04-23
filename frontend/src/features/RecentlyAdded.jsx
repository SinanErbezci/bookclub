import { useEffect, useState } from "react";
import { getRecentBooks } from "../api/books";
import BookCard from "../components/BookCard";
import SkeletonRow from "../components/SkeletonRow";
import CarouselSection from "./CarouselSection";

function RecentlyAdded() {
  const [books, setBooks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const data = await getRecentBooks();
      setBooks(data.results);

      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <CarouselSection 
    title="Recently Added"
    items={books}
    loading={loading}
    renderItem={(book) => (
      <BookCard key={book.id} book={book} showAuthor />
    )}
    />
  );
}

export default RecentlyAdded;