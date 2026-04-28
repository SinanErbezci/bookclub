import { useEffect, useState } from "react";
import ReviewCard from "./ReviewCard";
import ReviewModal from "./ReviewModal";
import ReviewFormModal from "./ReviewFormModal";
import {
  getReviewsByBook,
  getUserReview,
} from "../../api/reviews";

export default function ReviewSection({ bookId }) {
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);

  const [selectedReview, setSelectedReview] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = () => {
    setLoading(true);

    Promise.all([
      getReviewsByBook(bookId),
      getUserReview(bookId),
    ])
      .then(([reviewsData, userReviewData]) => {
        setReviews(reviewsData);
        setUserReview(userReviewData);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!bookId) return;
    fetchData();
  }, [bookId]);

  return (
    <div className="review-container">
      <h2>Reviews</h2>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <>
          {userReview && (
            <>
              <h3>Your Review</h3>
              <ReviewCard
                review={userReview}
                isOwn
                onRead={setSelectedReview}
                onEdit={() => setIsFormOpen(true)}
              />
            </>
          )}

          {!userReview && (
            <button onClick={() => setIsFormOpen(true)}>
              Write Review
            </button>
          )}

          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onRead={setSelectedReview}
            />
          ))}
        </>
      )}

      <ReviewModal
        review={selectedReview}
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
      />

      <ReviewFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        mode={userReview ? "edit" : "create"}
        review={userReview}
        bookId={bookId}
        onSuccess={fetchData}
      />
    </div>
  );
}