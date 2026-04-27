import { useState } from "react";
import StarRating from "./StarRating";
import profileImg from "../../assets/profile.svg";

function ReviewCard({ review, highlight }) {
  const [expanded, setExpanded] = useState(false);

  const isLong = review.content.length > 200;
  const displayText = expanded
    ? review.content
    : review.content.slice(0, 200);

  return (
    <div className={`review-card ${highlight ? "highlight" : ""}`}>
      
      {/* Header */}
      <div className="review-header">
        <div className="review-user">
          <img src={profileImg} alt="user" />
          <div className="user-meta">
            <span className="username">{review.user.username}</span>
            <span className="review-date">
              {new Date(review.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <StarRating rating={review.rating} />
      </div>

      {/* Text */}
      <p className="review-text">
        {displayText}
        {!expanded && isLong && "..."}
      </p>

      {/* Footer */}
      {isLong && (
        <div className="review-footer">
          <button
            className="read-more"
            onClick={() => setExpanded((s) => !s)}
          >
            {expanded ? "Show less ↑" : "Read more ↓"}
          </button>
        </div>
      )}
    </div>
  );
}

export default ReviewCard;