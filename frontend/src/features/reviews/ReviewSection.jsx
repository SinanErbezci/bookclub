import { useEffect, useState } from "react";
import ReviewForm from "./ReviewForm";
import ReviewCard from "./ReviewCard";

function ReviewSection({ bookId, currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await fetch(`/api/reviews/?book=${bookId}`);
        const data = await res.json();
        setReviews(data.results || data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [bookId]);

  function handleNewReview(newReview) {
    setReviews((prev) => [newReview, ...prev]);
  }

  const userReview = null

  return (
    <div className="book-reviews-section">
      <h2>Reviews</h2>

      {/* ✅ Form only if user hasn't reviewed */}
      <ReviewForm
        bookId={bookId}
        onReviewCreated={handleNewReview}
      />

      {loading && <p>Loading...</p>}

      {!loading && reviews.length === 0 && (
        <p>No reviews yet.</p>
      )}

      <div className="review-list">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isMine={false}
          />
        ))}
      </div>
    </div>
  );
}

export default ReviewSection;