function BookCard({ book, showAuthor = false }) {
  return (
    <div className="book-card">
      <img
        src={book.cover}
        alt={book.title}
        className="book-card-img"
      />

      <div className="book-card-body">
        <div className="twoliner">
          <a href={`/books/${book.id}`} className="book-link book-card-title">
            {book.title}
          </a>
        </div>

        {showAuthor && (
          <a
            href={`/authors/${book.author}`}
            className="book-link book-card-author"
          >
            {book.author_name}
          </a>
        )}
      </div>
    </div>
  );
}

export default BookCard;