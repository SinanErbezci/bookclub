function ReviewCard({ review, isMine }) {
  return (
    <div className={`review-card ${isMine ? "mine" : ""}`}>
      <div className="review-header">
        <strong>
          {review.user.username}
          {isMine && " (You)"}
        </strong>

        <span>⭐ {review.rating}/5</span>
      </div>

      <p className="review-text">{review.text}</p>

      <small>
        {new Date(review.created_at).toLocaleDateString()}
      </small>
    </div>
  );
}

export default ReviewCard;