import { useEffect, useState } from "react";
import { getRecentBooks } from "../api/books";
import BookCard from "../components/BookCard";
import SkeletonRow from "../components/SkeletonRow";

function RecentlyAdded() {
  const [books, setBooks] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getRecentBooks();
      setBooks(data.results);
    }

    fetchData();
  }, []);

  if (!books) {
    return <SkeletonRow />;
  }

  return (
    <div className="fade-in">
    <section className="recently-added">
      <h2 className="form-title mt-5 mb-3">
        Recently Added Books
      </h2>

      <div className="recent-scroll-container">
        <div className="recent-scroll-row">
          {books.map(book => (
            <div className="book-card-wrapper" key={book.id}>
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </div>
    </section>
    </div>
  );
}

export default RecentlyAdded;