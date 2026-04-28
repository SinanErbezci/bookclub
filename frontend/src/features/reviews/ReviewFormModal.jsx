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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setRating(review?.rating || 0);
    setText(review?.text || "");
  }, [review, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (text.length < 50) {
      setError("Review must be at least 50 characters");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (mode === "create") {
        await createReview({ book: bookId, rating, text });
      } else {
        await updateReview(review.id, { rating, text });
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
      <h3>
        {mode === "create" ? "Write a Review" : "Edit Review"}
      </h3>

      <StarRating value={rating} onChange={setRating} />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={500}
      />

      {error && <p className="error">{error}</p>}

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Saving..." : "Submit"}
      </button>
    </Modal>
  );
}