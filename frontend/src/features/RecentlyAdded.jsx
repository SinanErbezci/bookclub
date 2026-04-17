import BookCard from "../components/BookCard";

function RecentlyAdded({ books }) {
  if (!books || books.length === 0) {
    return <div>Loading...</div>;
  }

  const displayBooks = books.slice(0, 5);
  const isScrollable = books.length > 4;

  return (
    <section>
      <h1>Recently Added Books</h1>

      <div
        style={{
          display: "flex",
          overflowX: isScrollable ? "auto" : "hidden",
        }}
      >
        {displayBooks.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}

export default RecentlyAdded;