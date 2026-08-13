import { Link } from "react-router-dom";
import placeholder from "../assets/placeholder_book.png";
import styles from "./BookCard.module.css";

function BookCard({
  book,
  showAuthor = false,
  action = null,
  onAction = null,
  recommendationSourceId = null,
  onExplain = null,
}) {
  return (
    <div className={styles.card}>
      <div className={styles.imgWrapper}>
        <img
          src={book.cover || placeholder}
          alt={book.title}
          className={styles.img}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholder;
          }}
        />

        {action && (
          <button
            className={styles.actionIcon}
            onClick={(e) => {
              e.stopPropagation();
              onAction?.(book);
            }}
          >
            −
          </button>
        )}
      </div>

      <div className={styles.body}>
        <div className="twoliner">
          <Link
            to={`/books/${book.id}`}
            className={styles.title}
          >
            {book.title}
          </Link>
        </div>

        {showAuthor && book.author && (
          <Link
            to={`/authors/${book.author}`}
            className={styles.author}
          >
            {book.author_name || "Unknown Author"}
          </Link>
        )}

        {recommendationSourceId !== null && (
          <button
            className={styles.explainButton}
            onClick={(e) => {
              e.stopPropagation();
              onExplain?.(recommendationSourceId, book.id);
            }}
          >
            ✨ Explain
          </button>
        )}
      </div>
    </div>
  );
}

export default BookCard;