import { useEffect, useState } from "react";
import ReviewCard from "./ReviewCard";
import ReviewModal from "./ReviewModal";
import ReviewFormModal from "./ReviewFormModal";
import {
  getReviewsByBook,
  getUserReview,
  deleteReview,
} from "../../api/reviews";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function ReviewSection({ bookId }) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);

  const [selectedReview, setSelectedReview] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [nextUrl, setNextUrl] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {addToast} = useToast();

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
          ? reviewsData.results.filter(
            (r) => r.id !== userReviewData.id
          )
          : reviewsData.results;

        setReviews(filtered);
        setNextUrl(reviewsData.next);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const loadMore = async () => {
    if (!nextUrl || loadingMore) return;

    try {
      setLoadingMore(true);

      const data = await getReviewsByBook(bookId, nextUrl);

      const filtered = data.results.filter((r) => {
        if (userReview && r.id === userReview.id) return false;
        return true;
      });

      setReviews((prev) => {
        const existingIds = new Set(prev.map((r) => r.id));
        const newItems = filtered.filter((r) => !existingIds.has(r.id));
        return [...prev, ...newItems];
      });

      setNextUrl(data.next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async (reviewId) => {
  if (!window.confirm("Delete your review?")) return;

  try {
    await deleteReview(reviewId);
    
    addToast("Review deleted", "success");
    
    setUserReview(null);
  } catch (err) {
    setError(err.message);
    addToast("Failed to delete review", "error");
    fetchData();
  }
};

  useEffect(() => {
    if (!bookId) return;
    fetchData();
  }, [bookId, user]); // 🔥 refetch when login/logout changes

    useEffect(() => {
  addToast("Toast working", "success");
}, []);
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
                onDelete={() => handleDelete(userReview.id)}
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

      {nextUrl && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button
            className="btn load-more-btn"
            onClick={loadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}