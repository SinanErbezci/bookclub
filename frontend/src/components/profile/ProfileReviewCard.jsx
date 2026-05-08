import { Link } from "react-router-dom";
import styles from "./ProfileReviewCard.module.css";

function ProfileReviewCard({
  review,
  isOwnProfile,
  onOpen,
  onEdit,
  onDelete,
}) {
  return (
    <article
      className={styles.reviewCard}
      onClick={() => onOpen(review)}
    >
      <Link
        to={`/books/${review.book.id}`}
        onClick={(e) => e.stopPropagation()}
        className={styles.coverLink}
      >
        <img
          src={review.book.cover}
          alt={review.book.title}
          className={styles.cover}
        />
      </Link>

      <div className={styles.content}>
        <div className={styles.bookSection}>
          <Link
            to={`/books/${review.book.id}`}
            onClick={(e) => e.stopPropagation()}
            className={styles.title}
          >
            {review.book.title}
          </Link>

          <p className={styles.author}>
            {review.book.author_name}
          </p>
        </div>

        <div className={styles.ratingRow}>
          <div className="star-outer">
            <div
              className="star-inner"
              style={{
                width: `${(review.rating / 5) * 100}%`,
              }}
            />
          </div>

          <span className={styles.ratingValue}>
            {review.rating.toFixed(1)}
          </span>
        </div>

        <p className={styles.reviewText}>
          {review.content}
        </p>

        <div className={styles.footer}>
          <span className={styles.date}>
            {new Date(review.created_at).toLocaleDateString()}
          </span>

          {isOwnProfile && (
            <div className={styles.actions}>
              <button
                type="button"
                className="btn btn-ghost linkUnderline"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(review);
                }}
              >
                Edit
              </button>

              <button
                type="button"
                className="btn btn-ghost linkUnderline"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(review);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProfileReviewCard;