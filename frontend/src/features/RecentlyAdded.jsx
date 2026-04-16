import BookCard from "../components/BookCard";

function FeaturedGenre({ recentBook }) {
  const books = recentBook.books.slice(0, 5);
  const isScrollable = recentBook.book_count > 4;

  return (
    <section>
      <h1>
            Recently Added Books
      </h1>

      <div
        style={{
          display: "flex",
          overflowX: isScrollable ? "auto" : "hidden",
        }}
      >
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}

export default FeaturedGenre;