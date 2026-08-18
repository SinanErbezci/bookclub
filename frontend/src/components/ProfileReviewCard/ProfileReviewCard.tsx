import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import placeholderBook from "../../assets/placeholder_book.png";
import styles from "./ProfileReviewCard.module.css";
import StarRating from "../StarRating/StarRating";
import type { Review } from "../../types/review";

interface ProfileReviewCardProps {
  review: Review;
  isOwnProfile: boolean;
  onOpen: (review: Review) => void;
  onEdit: (review: Review) => void;
  onDelete: (review: Review) => void;
}

function ProfileReviewCard({
  review,
  isOwnProfile,
  onOpen,
  onEdit,
  onDelete,
}: ProfileReviewCardProps) {
  return (
    <article
      className={styles.reviewCard}
      onClick={() => onOpen(review)}
    >
      <Link
        to={`/books/${review.book.id}`}
        onClick={(e: MouseEvent<HTMLAnchorElement>) =>
          e.stopPropagation()
        }
        className={styles.coverLink}
      >
        <img
          src={review.book.cover ?? placeholderBook}
          alt={review.book.title}
          className={styles.cover}
        />
      </Link>

      <div className={styles.content}>
        <div className={styles.bookHeader}>
          <div className={styles.bookSection}>
            <Link
              to={`/books/${review.book.id}`}
              onClick={(e: MouseEvent<HTMLAnchorElement>) =>
                e.stopPropagation()
              }
              className={styles.title}
            >
              {review.book.title}
            </Link>

            <p className={styles.author}>
              {review.book.author_name}
            </p>
          </div>

          <StarRating
            value={review.rating}
            readOnly
            size="small"
          />
        </div>

        <p className={styles.reviewText}>
          {review.content}
        </p>

        <div className={styles.footer}>
          <span className={styles.date}>
            {new Date(
              review.created_at,
            ).toLocaleDateString()}
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