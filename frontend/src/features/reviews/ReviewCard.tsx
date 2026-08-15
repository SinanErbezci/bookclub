import { formatTimeAgo } from "../../utils/time";
import styles from "./ReviewCard.module.css";
import StarRating from "../../components/StarRating/StarRating";

import type { Review } from "../../types/review";

interface ReviewCardProps {
  review: Review;
  isOwn?: boolean;
  onRead?: (review: Review) => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ReviewCard({
  review,
  isOwn = false,
  onRead,
  onEdit,
  onDelete,
}: ReviewCardProps) {
  const formattedDate =
    new Date(
      review.created_at,
    ).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const isEdited =
    new Date(review.updated_at).getTime() -
      new Date(review.created_at).getTime() >
    1000;

  return (
    <div className={styles.row}>
      <div
        className={`${styles.card} ${
          isOwn ? styles.mine : ""
        }`}
      >
        <div className={styles.inner}>
          <div className={styles.user}>
            <img
              className={styles.avatar}
              src="/assets/default-avatar.svg"
              alt="profile"
            />

            <p className={styles.userName}>
              {isOwn
                ? "You"
                : review.user?.username}
            </p>
          </div>

          <div
            className={styles.contentArea}
          >
            <StarRating
              value={review.rating}
              readOnly
              size="small"
            />

            <p
              className={
                styles.reviewPreview
              }
            >
              {review.content}
            </p>

            <p className={styles.meta}>
              <small>
                Review on{" "}
                {formattedDate}

                {isEdited && (
                  <span
                    style={{
                      marginLeft: "6px",
                      opacity: 0.6,
                    }}
                  >
                    • Edited{" "}
                    {formatTimeAgo(
                      review.updated_at,
                    )}
                  </span>
                )}
              </small>
            </p>

            <div
              className={styles.actions}
            >
              <button
                className="btn btn-ghost linkUnderline"
                onClick={() =>
                  onRead?.(review)
                }
              >
                Read more
              </button>

              {isOwn && (
                <>
                  <button
                    className="btn btn-ghost linkUnderline"
                    onClick={onEdit}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-ghost linkUnderline"
                    onClick={onDelete}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}