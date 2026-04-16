function BookCard({ book }) {
  return (
    <div className="card text-center mx-2 bg-primary shadow">
      <img
        className="card-img-top mx-auto"
        src={book.cover}
        alt="book cover"
        style={{ width: "200px", height: "300px" }}
      />

      <div className="card-body">
        <a className="fw-bold" href={`/books/${book.id}`}>
          {book.title}
        </a>

        {book.author_name && (
          <div>
            <a href={`/authors/${book.author}`}>
              {book.author_name}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookCard;