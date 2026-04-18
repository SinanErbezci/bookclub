import { Link } from "react-router-dom";

function BookCard({ book }) {
  return (
    <Link to={`/books/${book.id}`} className="card-link me-4">
      <div className="book-card">

        {/* IMAGE */}
        <img
          src={book.cover}
          alt={book.title}
          className="book-card-img"
        />

        {/* TEXT */}
        <div className="book-card-body">

          <div className="book-card-title twoliner">
            {book.title}
          </div>

          <div className="book-card-author oneliner">
            {book.author_name}
          </div>

        </div>

      </div>
    </Link>
  );
}

export default BookCard;