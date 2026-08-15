import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

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

import type { Review } from "../../types/review";

import styles from "./ReviewSection.module.css";

interface ReviewSectionProps {
  bookId: number;
}

export default function ReviewSection({
  bookId,
}: ReviewSectionProps) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [reviews, setReviews] =
    useState<Review[]>([]);

  const [userReview, setUserReview] =
    useState<Review | null>(null);

  const [selectedReview, setSelectedReview] =
    useState<Review | null>(null);

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [nextUrl, setNextUrl] =
    useState<string | null>(null);

  const [loadingMore, setLoadingMore] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const fetchData =
    useCallback(async (): Promise<void> => {
      setLoading(true);

      try {
        const [
          reviewsData,
          userReviewData,
        ] = await Promise.all([
          getReviewsByBook(bookId),
          user
            ? getUserReview(bookId)
            : Promise.resolve(null),
        ]);

        setUserReview(
          userReviewData,
        );

        const filtered =
          userReviewData
            ? reviewsData.results.filter(
                (review) =>
                  review.id !==
                  userReviewData.id,
              )
            : reviewsData.results;

        setReviews(filtered);
        setNextUrl(reviewsData.next);
        setError(null);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError(
            "Failed to load reviews.",
          );
        }
      } finally {
        setLoading(false);
      }
    }, [bookId, user]);

  useEffect(() => {
    if (!bookId) return;

    void fetchData();
  }, [bookId, fetchData]);

  async function handleDelete(
    reviewId: number,
  ): Promise<void> {
    if (
      !window.confirm(
        "Delete your review?",
      )
    ) {
      return;
    }

    try {
      await deleteReview(reviewId);

      addToast(
        "Review deleted",
        "success",
      );

      setUserReview(null);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to delete review";

      setError(message);

      addToast(
        "Failed to delete review",
        "error",
      );

      await fetchData();
    }
  }

  async function handleLoadMore(): Promise<void> {
    /*
     * The current getReviewsByBook() API
     * accepts only bookId.
     *
     * The old JS implementation passed
     * nextUrl as a second argument, so
     * pagination needs to be addressed at
     * the API layer before we restore this.
     */
    return;
  }

  return (
    <div className={styles.section}>
      <h2 className={styles.title}>
        Reviews
      </h2>

      {loading && (
        <p className="text-center">
          Loading...
        </p>
      )}

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {!loading && !error && (
        <>
          {userReview && (
            <>
              <h3
                className={
                  styles.yourReviewTitle
                }
              >
                Your Review
              </h3>

              <ReviewCard
                review={userReview}
                isOwn
                onRead={
                  setSelectedReview
                }
                onEdit={() =>
                  setIsFormOpen(true)
                }
                onDelete={() =>
                  handleDelete(
                    userReview.id,
                  )
                }
              />

              <div
                className={styles.divider}
              />
            </>
          )}

          {!userReview && user && (
            <div
              className={
                styles.writeReview
              }
            >
              <button
                className="btn btn-primary"
                onClick={() =>
                  setIsFormOpen(true)
                }
              >
                Write a Review
              </button>
            </div>
          )}

          {!user && (
            <Link
              to="/login"
              className={styles.loginLink}
            >
              Log in to write a review
            </Link>
          )}

          {reviews.length === 0 &&
            !userReview &&
            user && (
              <div className="emptyState">
                No reviews yet.
              </div>
            )}

          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onRead={
                setSelectedReview
              }
            />
          ))}
        </>
      )}

      <ReviewModal
        review={selectedReview}
        isOpen={!!selectedReview}
        onClose={() =>
          setSelectedReview(null)
        }
      />

      <ReviewFormModal
        isOpen={isFormOpen}
        onClose={() =>
          setIsFormOpen(false)
        }
        mode={
          userReview
            ? "edit"
            : "create"
        }
        review={userReview}
        bookId={bookId}
        onSuccess={fetchData}
      />

      {nextUrl && (
        <div
          className={styles.loadMore}
        >
          <button
            className="btn btn-ghost"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore
              ? "Loading..."
              : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}