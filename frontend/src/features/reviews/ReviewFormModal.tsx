import {
  useEffect,
  useState,
} from "react";

import Modal from "../../components/Modal";
import StarRating from "../../components/StarRating/StarRating";

import {
  createReview,
  updateReview,
} from "../../api/reviews";

import type { Review } from "../../types/review";

import styles from "./ReviewForm.module.css";

type ReviewFormMode =
  | "create"
  | "edit";

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ReviewFormMode;
  review: Review | null;
  bookId: number;
  onSuccess: () => void | Promise<void>;
}

export default function ReviewFormModal({
  isOpen,
  onClose,
  mode,
  review,
  bookId,
  onSuccess,
}: ReviewFormModalProps) {
  const [rating, setRating] =
    useState(0);

  const [text, setText] =
    useState("");

  const [hoverRating, setHoverRating] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    setRating(review?.rating ?? 0);
    setText(review?.content ?? "");
    setError(null);
  }, [review, isOpen]);

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(): Promise<void> {
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (text.length < 10) {
      setError(
        "Review must be at least 10 characters",
      );
      return;
    }

    if (text.length > 2000) {
      setError(
        "Review cannot exceed 2000 characters",
      );
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (mode === "create") {
        await createReview({
          book: bookId,
          rating,
          content: text,
        });
      } else {
        if (!review) {
          setError(
            "Review could not be found.",
          );
          return;
        }

        await updateReview(review.id, {
          rating,
          content: text,
        });
      }

      await onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Failed to save review.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={styles.modalContent}
    >
      <div className={styles.container}>
        <h2 className={styles.title}>
          {mode === "create"
            ? "Write a Review"
            : "Edit Your Review"}
        </h2>

        <div
          className={styles.ratingSection}
        >
          <label
            className={styles.ratingLabel}
          >
            Rating
          </label>

          <StarRating
            value={
              hoverRating ?? rating
            }
            onChange={setRating}
            onHover={setHoverRating}
            onLeave={() =>
              setHoverRating(null)
            }
          />
        </div>

        <div className={styles.section}>
          <label className={styles.label}>
            Your Review
          </label>

          <textarea
            className={styles.textarea}
            value={text}
            onChange={(e) => {
              setText(e.target.value);

              e.target.style.height =
                "auto";

              e.target.style.height =
                `${e.target.scrollHeight}px`;
            }}
            style={{
              overflow: "hidden",
            }}
            maxLength={2000}
            placeholder="Share your thoughts... (10–2000 characters)"
          />

          <div className={styles.charCount}>
            {text.length} / 2000
          </div>
        </div>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Submit"}
          </button>
        </div>
      </div>
    </Modal>
  );
}