import { useState } from "react";

function ReviewForm({ bookId, onReviewCreated }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!rating) {
      alert("Please select a rating");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("/api/reviews/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          book: bookId,
          rating,
          text,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || data.non_field_errors?.[0]);
        return;
      }

      onReviewCreated(data);

      setText("");
      setRating(0);

    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Write a Review</h3>

      {/* ⭐ Star rating */}
      <div className="star-input">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${
              star <= (hover || rating) ? "active" : ""
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </span>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={2000}
        placeholder="Write your review..."
      />

      <p>{text.length}/2000</p>

      <button disabled={submitting}>
        {submitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

export default ReviewForm;