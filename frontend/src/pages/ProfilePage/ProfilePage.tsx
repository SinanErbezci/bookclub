import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { fetchUserProfile } from "../../api/users";
import {
  deleteList,
  removeBookFromList,
} from "../../api/lists";
import { deleteReview } from "../../api/reviews";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

import CarouselSection from "../../components/CarouselSection/CarouselSection";
import BookCard from "../../components/BookCard";
import Modal from "../../components/Modal";
import ReviewModal from "../../features/reviews/ReviewModal";
import ReviewFormModal from "../../features/reviews/ReviewFormModal";
import ProfileReviewCard from "../../components/ProfileReviewCard/ProfileReviewCard";
import LoadingScreen from "../../components/LoadingScreen";

import NotFoundPage from "../NotFoundPage";

import type { UserProfile } from "../../types/user";
import type { List } from "../../types/list";
import type { Review } from "../../types/review";
import { ApiError } from "../../types/api";

import styles from "./ProfilePage.module.css";

function ProfilePage() {
  const { id } =
    useParams<{ id: string }>();

  const navigate = useNavigate();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const { addToast } = useToast();

  const [error, setError] =
    useState<ApiError | null>(null);

  const [data, setData] =
    useState<UserProfile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [selectedList, setSelectedList] =
    useState<List | null>(null);

  const [selectedReview, setSelectedReview] =
    useState<Review | null>(null);

  const [editingReview, setEditingReview] =
    useState<Review | null>(null);

  const isOwnProfile =
    !!user &&
    (!id || user.id === Number(id));

  const loadProfile =
    useCallback(async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const targetId =
          id || user?.id;

        if (!targetId) return;

        const profile =
          await fetchUserProfile(
            targetId,
          );

        setData(profile);
      } catch (err) {
        console.error(err);

        setData(null);

        if (err instanceof ApiError) {
          setError(err);
        } else {
          setError(
            new ApiError(
              "Failed to load profile.",
              500,
              null,
            ),
          );
        }
      } finally {
        setLoading(false);
      }
    }, [id, user]);

  useEffect(() => {
    if (
      !authLoading &&
      !id &&
      !user
    ) {
      navigate("/login");
      return;
    }

    const isValidProfileId =
      !id || /^\d+$/.test(id);

    if (!isValidProfileId) {
      setLoading(false);
      setData(null);
      return;
    }

    if (!authLoading) {
      loadProfile();
    }
  }, [
    id,
    user,
    authLoading,
    navigate,
    loadProfile,
  ]);

  async function handleDeleteReview(
    review: Review,
  ): Promise<void> {
    if (
      !window.confirm(
        "Delete this review?",
      )
    ) {
      return;
    }

    try {
      await deleteReview(review.id);

      addToast(
        "Review deleted",
        "success",
      );

      setData((prev) =>
        prev
          ? {
            ...prev,
            reviews:
              prev.reviews.filter(
                (r) =>
                  r.id !== review.id,
              ),
          }
          : prev,
      );

      if (
        selectedReview?.id ===
        review.id
      ) {
        setSelectedReview(null);
      }
    } catch {
      addToast(
        "Failed to delete review",
        "error",
      );
    }
  }

  async function handleDeleteList(
    listId: number,
  ): Promise<void> {
    if (
      !window.confirm(
        "Delete this list?",
      )
    ) {
      return;
    }

    try {
      await deleteList(listId);

      addToast(
        "List deleted",
        "success",
      );

      setData((prev) =>
        prev
          ? {
            ...prev,
            lists: prev.lists.filter(
              (list) =>
                list.id !== listId,
            ),
          }
          : prev,
      );
    } catch {
      addToast(
        "Failed to delete list",
        "error",
      );
    }
  }

  async function handleRemoveFromList(
    listId: number,
    bookId: number,
  ): Promise<void> {
    try {
      await removeBookFromList(
        listId,
        bookId,
      );

      addToast(
        "Removed from list",
        "success",
      );

      setData((prev) =>
        prev
          ? {
            ...prev,
            lists: prev.lists.map(
              (list) =>
                list.id === listId
                  ? {
                    ...list,
                    books:
                      list.books.filter(
                        (book) =>
                          book.id !==
                          bookId,
                      ),
                  }
                  : list,
            ),
          }
          : prev,
      );

      setSelectedList((prev) =>
        prev
          ? {
            ...prev,
            books:
              prev.books.filter(
                (book) =>
                  book.id !==
                  bookId,
              ),
          }
          : prev,
      );
    } catch {
      addToast(
        "Failed to remove book",
        "error",
      );
    }
  }

  if (loading) {
    return (
      <LoadingScreen
        text="Loading profile..."
        fullPage
      />
    );
  }

  if (error?.status === 404) {
    return <NotFoundPage />;
  }

  if (error) {
    return (
      <div className={styles.error}>
        Failed to load profile. Please try
        again.
      </div>
    );
  }

  if (!data || !data.user) {
    return <NotFoundPage />;
  }

  return (
    <>
      <div className={styles.page}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.avatar}>
            {data.user.username[0].toUpperCase()}
          </div>

          <div className={styles.info}>
            <h2>
              {data.user.username}
            </h2>

            <p>
              {data.lists.length} lists •{" "}
              {data.reviews.length} reviews
            </p>
          </div>
        </div>

        {/* LISTS */}
        <section className={styles.section}>
          <div
            className={
              styles.sectionHeader
            }
          >
            <h3
              className={
                styles.sectionTitle
              }
            >
              Lists
            </h3>
          </div>

          {data.lists.length === 0 ? (
            <div
              className={
                styles.emptyState
              }
            >
              No lists yet
            </div>
          ) : (
            <div
              className={styles.listGrid}
            >
              {data.lists.map((list) => (
                <div
                  key={list.id}
                  className={
                    styles.listCard
                  }
                  onClick={() =>
                    setSelectedList(list)
                  }
                >
                  <div
                    className={
                      styles.listCardHeader
                    }
                  >
                    <div
                      className={
                        styles.listTitle
                      }
                    >
                      <h4>
                        {list.name}
                      </h4>

                      <p
                        className={
                          styles.listCount
                        }
                      >
                        {list.books.length}{" "}
                        books
                      </p>
                    </div>

                    {isOwnProfile &&
                      !list.is_system && (
                        <button
                          className={
                            styles.deleteButton
                          }
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteList(
                              list.id,
                            );
                          }}
                          aria-label={`Delete ${list.name} list`}
                        >
                          ✕
                        </button>
                      )}
                  </div>

                  <div
                    className={
                      styles.bookRow
                    }
                  >
                    {list.books
                      .slice(0, 5)
                      .map((book) => (
                        <img
                          key={book.id}
                          src={
                            book.cover ??
                            undefined
                          }
                          alt={book.title}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* REVIEWS */}
        <section className={styles.section}>
          <div
            className={
              styles.sectionHeader
            }
          >
            <h3
              className={
                styles.sectionTitle
              }
            >
              Reviews
            </h3>
          </div>

          {data.reviews.length === 0 ? (
            <div
              className={
                styles.emptyState
              }
            >
              No reviews yet
            </div>
          ) : (
            <div
              className={
                styles.reviewList
              }
            >
              {data.reviews.map(
                (review) => (
                  <ProfileReviewCard
                    key={review.id}
                    review={review}
                    isOwnProfile={
                      isOwnProfile
                    }
                    onOpen={
                      setSelectedReview
                    }
                    onEdit={
                      setEditingReview
                    }
                    onDelete={
                      handleDeleteReview
                    }
                  />
                ),
              )}
            </div>
          )}
        </section>

        {/* LIST MODAL */}
        <Modal
          isOpen={!!selectedList}
          onClose={() =>
            setSelectedList(null)
          }
        >
          {selectedList && (
            <CarouselSection
              title={selectedList.name}
              items={selectedList.books}
              renderItem={(book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  showAuthor
                  action="Remove"
                  onAction={(book) =>
                    handleRemoveFromList(
                      selectedList.id,
                      book.id,
                    )
                  }
                />
              )}
            />
          )}
        </Modal>

        <ReviewModal
          review={selectedReview}
          isOpen={!!selectedReview}
          onClose={() =>
            setSelectedReview(null)
          }
        />
      </div>

      {editingReview && (
        <ReviewFormModal
          isOpen
          mode="edit"
          review={editingReview}
          bookId={editingReview.book.id}
          onClose={() => setEditingReview(null)}
          onSuccess={loadProfile}
        />
      )}
    </>
  );
}

export default ProfilePage;