import { Link } from "react-router-dom";
import placeholder from "../assets/placeholder_book.png"
function BookCard({ book, showAuthor = false }) {
  return (
    <div className="book-card">
      <img
        src={book.cover || placeholder}
        alt={book.title}
        className="book-card-img"
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = placeholder;
        }}
      />

      <div className="book-card-body">
        <div className="twoliner">
          <Link to={`/book/${book.id}`} className="book-link book-card-title">
            {book.title}
          </Link>
        </div>

        {showAuthor && (
          <Link to={`/authors/${book.author}`} className="book-link book-card-author">
            {book.author_name}
          </Link>
        )}
      </div>
    </div>
  );
}

export default BookCard;