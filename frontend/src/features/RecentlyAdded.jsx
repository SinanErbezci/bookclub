import BookCard from "../components/BookCard";

function RecentlyAdded({ books }) {
  return (
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
  );
}

export default RecentlyAdded;