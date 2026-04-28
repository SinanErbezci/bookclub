import { useEffect, useState } from "react";
import ReviewCard from "./ReviewCard";
import ReviewModal from "./ReviewModal";
import ReviewFormModal from "./ReviewFormModal";
import {
  getReviewsByBook,
  getUserReview,
} from "../../api/reviews";
import { useAuth } from "../../context/AuthContext";

export default function ReviewSection({ bookId }) {
  const { user } = useAuth();

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
      user ? getUserReview(bookId) : Promise.resolve(null),
    ])
      .then(([reviewsData, userReviewData]) => {
        setUserReview(userReviewData);

        // 🔥 remove user's review from list
        const filtered = userReviewData
          ? reviewsData.filter((r) => r.id !== userReviewData.id)
          : reviewsData;

        setReviews(filtered);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!bookId) return;
    fetchData();
  }, [bookId, user]); // 🔥 refetch when login/logout changes

  return (
    <div className="review-container">
      <h2>Reviews</h2>

      {/* LOADING */}
      {loading && <p>Loading...</p>}

      {/* ERROR */}
      {error && <p className="error">{error}</p>}

      {/* CONTENT */}
      {!loading && !error && (
        <>
          {/* ✅ YOUR REVIEW */}
          {userReview && (
            <>
              <h3 className="your-review-title">Your Review</h3>

              <ReviewCard
                review={userReview}
                isOwn
                onRead={setSelectedReview}
                onEdit={() => setIsFormOpen(true)}
              />

              <div className="divider" />
            </>
          )}

          {/* ✅ WRITE BUTTON (only if logged in & no review) */}
          {!userReview && user && (
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <button
                className="btn primary"
                onClick={() => setIsFormOpen(true)}
              >
                Write a Review
              </button>
            </div>
          )}

          {/* ✅ LOGGED OUT MESSAGE */}
          {!user && (
            <p className="empty">Log in to write a review</p>
          )}

          {/* ✅ EMPTY STATE */}
          {reviews.length === 0 && !userReview && user && (
            <p className="empty">No reviews yet.</p>
          )}

          {/* ✅ OTHER REVIEWS */}
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onRead={setSelectedReview}
            />
          ))}
        </>
      )}

      {/* 🔍 READ MODAL */}
      <ReviewModal
        review={selectedReview}
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
      />

      {/* ✍️ CREATE / EDIT MODAL */}
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