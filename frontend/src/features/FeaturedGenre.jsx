import BookCard from "../components/BookCard";

function FeaturedGenre({ genre }) {
  if (!genre) return null;

  return (
    <section className="featured-section">

      <h2 className="form-title mt-5 mb-3">
        Genre: {genre.name}
      </h2>

      <div className="recent-scroll-container">
        <div className="recent-scroll-row justify-content-center">
        {genre.books?.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
        </div>
      </div>

    </section>
  );
}

export default FeaturedGenre;