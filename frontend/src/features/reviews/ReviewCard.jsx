import { formatTimeAgo } from "../../utils/time"; 

export default function ReviewCard({
  review,
  isOwn = false,
  onRead,
  onEdit,
  onDelete,
}) {

  const formattedDate = new Date(review.created_at).toLocaleDateString(
    undefined,
    { year: "numeric", month: "short", day: "numeric" }
  );

  const isEdited =
    new Date(review.updated_at) - new Date(review.created_at) > 1000;

  return (
    <div className="review-row">
      <div className="review-card">
        <div className="review-inner">

          <div className="review-user">
            <img src={review.user?.avatar || "/assets/default-avatar.svg"} alt="profile" />
            <p className="oneliner">
              {isOwn ? "You" : review.user?.username}
            </p>

          </div>

          <div className="review-content-area">
            <div className="star-outer">
              <div
                className="star-inner"
                style={{ width: `${(review.rating / 5) * 100}%` }}
              />
            </div>

            <p className="twoliner">{review.content}</p>

            <p className="review-meta">
              <small>Review on {formattedDate}
                {isEdited && (
                  <span style={{ marginLeft: "6px", opacity: 0.6 }}>
                    • Edited {formatTimeAgo(review.updated_at)}
                  </span>
                )}
              </small>
            </p>


            <div className="review-actions">
              <button onClick={() => onRead?.(review)}>Read more</button>

              {isOwn && (
                <>
                  <button onClick={onEdit}>Edit</button>
                  <button onClick={onDelete}>Delete</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}