import BookCard from "../components/BookCard";

function FeaturedAuthor({ author }) {
  if (!author) return null;

  return (
    <section className="featured-section">

      <h2 className="form-title mt-5 mb-3">
        Author: {author.name}
      </h2>

      <div className="recent-scroll-container">
        <div className="recent-scroll-row justify-content-center">
        {author.books?.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
        </div>
      </div>

    </section>
  );
}

export default FeaturedAuthor;