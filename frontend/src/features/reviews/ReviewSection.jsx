import { useAuth } from "../../context/AuthContext";
import ReviewCard from "./ReviewCard";
import ReviewFormModal from "./ReviewFormModal";

function ReviewSection({ reviews, bookId, setReviews }) {
  const { user } = useAuth();

  const userReview = reviews.find(r => r.user.id === user?.id);
  const otherReviews = reviews.filter(r => r.user.id !== user?.id);

  function handleNewReview(review) {
    setReviews(prev => [review, ...prev]);
  }

  return (
    <div className="review-section">
      <h2>Reviews</h2>

      {/* Your Review */}
      {userReview && (
        <>
          <h3 className="your-review-title">Your Review</h3>
          <ReviewCard review={userReview} highlight />
        </>
      )}

      {/* Write Review */}
      {user && !userReview && (
        <ReviewFormModal bookId={bookId} onSuccess={handleNewReview} />
      )}

      {/* Other Reviews */}
      {otherReviews.length > 0 ? (
        otherReviews.map(r => (
          <ReviewCard key={r.id} review={r} />
        ))
      ) : (
        <p className="no-reviews">No reviews yet.</p>
      )}
    </div>
  );
}

export default ReviewSection;