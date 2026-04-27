import { useState } from "react";
import { createReview } from "../../api/reviews";
import { createPortal } from "react-dom";

function ReviewFormModal({ bookId, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const review = await createReview({
        book: bookId,
        rating,
        content,
      });

      onSuccess(review);
      setOpen(false);
      setContent("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="review-btn"
        onClick={() => {
          console.log("clicked");
          setOpen(true)
        }}
      >
        Write a Review
      </button>

{open &&
  createPortal(
    <div
      className="modal-overlay"
      onClick={() => setOpen(false)}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Write a Review</h3>

        {error && <p className="auth-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[1,2,3,4,5].map(n => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>

          <textarea
            placeholder="Write your review..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            minLength={10}
            maxLength={500}
          />

          <div className="modal-actions">
            <button type="button" onClick={() => setOpen(false)}>
              Cancel
            </button>

            <button type="submit" disabled={loading}>
              {loading ? "Posting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )}
    </>
  );
}

export default ReviewFormModal;