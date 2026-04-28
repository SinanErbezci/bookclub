export default function ReviewCard({
  review,
  isOwn = false,
  onRead,
  onEdit,
}) {
  const formattedDate = new Date(review.date).toLocaleDateString();

  return (
    <div className="review-row">
      <div className="review-card clickme">
        <div className="review-inner">
          
          <div className="review-user">
            <img src="/default-avatar.svg" alt="profile" />
            <p className="oneliner">
              {review.user?.username || "You"}
            </p>
          </div>

          <div className="review-content-area">
            <div className="star-outer">
              <div
                className="star-inner"
                style={{ width: `${(review.rating / 5) * 100}%` }}
              />
            </div>

            <p className="twoliner">{review.text}</p>

            <p className="review-meta">
              <small>Review on {formattedDate}</small>

              <button onClick={() => onRead?.(review)}>
                Read Review
              </button>

              {isOwn && (
                <button onClick={() => onEdit?.()}>
                  Edit
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}