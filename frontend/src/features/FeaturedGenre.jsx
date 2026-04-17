import BookCard from "../components/BookCard";

function FeaturedGenre({ genre }) {
  if (!genre) return <div>Loading...</div>;
  
  const books = genre.books.slice(0, 5);
  const isScrollable = genre.book_count > 4;


  return (
    <section>
      <h1>
        Check out genre of{" "}
        <a href={`/genres/${genre.id}`}>
          {genre.name}
        </a>
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