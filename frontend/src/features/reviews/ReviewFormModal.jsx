import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import StarRating from "./StarRating";
import {
  createReview,
  updateReview,
} from "../../api/reviews";

export default function ReviewFormModal({
  isOpen,
  onClose,
  mode,
  review,
  bookId,
  onSuccess,
}) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [hoverRating, setHoverRating] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setRating(review?.rating || 0);
    setText(review?.content || "");
  }, [review, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (text.length < 10) {
      setError("Review must be at least 10 characters");
      return;
    }

    if (text.length > 2000) {
      setError("Review cannot exceed 2000 characters");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (mode === "create") {
        await createReview({ book: bookId, rating, content: text });
      } else {
        await updateReview(review.id, { rating, content: text });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="review-form">

        <h2 className="review-form-title">
          {mode === "create" ? "Write a Review" : "Edit Your Review"}
        </h2>

        {/* ⭐ Rating */}
        <div className="review-form-section">
          <label className="text-center h4">Rating</label>
          <StarRating
            value={hoverRating ?? rating}
            onChange={setRating}
            onHover={setHoverRating}
            onLeave={() => setHoverRating(null)}
          />
        </div>

        {/* ✍️ Text */}
        <div className="review-form-section">
          <label class="text-center h4">Your Review</label>

          <textarea
            className="review-textarea"
            value={text}
            onChange={(e) => {
              setText(e.target.value);

              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            style={{ overflow: "hidden" }}
            maxLength={2000}
            placeholder="Share your thoughts... (10–2000 characters)"
          />

          <div className="char-count">
            {text.length} / 2000
          </div>
        </div>

        {/* ❌ Error */}
        {error && <p className="error">{error}</p>}

        {/* ✅ Actions */}
        <div className="review-form-actions">
          <button className="btn secondary" onClick={onClose}>
            Cancel
          </button>

          <button
            className="btn primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </Modal>
  );
}