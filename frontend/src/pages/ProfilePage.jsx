import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { fetchUserProfile } from "../api/users";
import { deleteList, removeBookFromList } from "../api/lists";
import { deleteReview } from "../api/reviews";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import CarouselSection from "../components/CarouselSection/CarouselSection";
import BookCard from "../components/BookCard";
import Modal from "../components/Modal";
import ReviewModal from "../features/reviews/ReviewModal";
import ReviewFormModal from "../features/reviews/ReviewFormModal";
import ProfileReviewCard from "../components/profile/ProfileReviewCard";
import styles from "./ProfilePage.module.css";
import NotFoundPage from "./NotFoundPage";

function ProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedReview, setSelectedReview] =
    useState(null);
  const [editingReview, setEditingReview] =
    useState(null);

  // ✅ safer ownership check
  const isOwnProfile =
    user && (!id || user.id === Number(id));

  // 🔥 Load profile (FINAL FIXED)
  useEffect(() => {
    if (!authLoading && !id && !user) {
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
  }, [id, user, authLoading, navigate,]);

  async function loadProfile() {
    try {
      const targetId = id || user?.id;
      if (!targetId) return;

      const data = await fetchUserProfile(targetId);

      setData(data);
    } catch (err) {
      console.error(err);
      addToast("Failed to load profile", "error");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteReview(review) {
    if (!window.confirm("Delete this review?")) {
      return;
    }

    try {
      await deleteReview(review.id);

      addToast("Review deleted", "success");

      setData((prev) => ({
        ...prev,
        reviews: prev.reviews.filter(
          (r) => r.id !== review.id
        ),
      }));

      if (selectedReview?.id === review.id) {
        setSelectedReview(null);
      }
    } catch {
      addToast("Failed to delete review", "error");
    }
  }

  // 🔥 Delete list
  async function handleDeleteList(listId) {
    if (!window.confirm("Delete this list?")) return;

    try {
      await deleteList(listId);

      addToast("List deleted", "success");

      setData((prev) => ({
        ...prev,
        lists: prev.lists.filter((l) => l.id !== listId),
      }));
    } catch {
      addToast("Failed to delete list", "error");
    }
  }

  // 🔥 Remove book
  async function handleRemoveFromList(listId, bookId) {
    try {
      await removeBookFromList(listId, bookId);

      addToast("Removed from list", "success");

      // update profile data
      setData((prev) => ({
        ...prev,
        lists: prev.lists.map((l) =>
          l.id === listId
            ? {
              ...l,
              books: l.books.filter((b) => b.id !== bookId),
            }
            : l
        ),
      }));

      // update modal
      setSelectedList((prev) =>
        prev
          ? {
            ...prev,
            books: prev.books.filter((b) => b.id !== bookId),
          }
          : prev
      );
    } catch {
      addToast("Failed to remove book", "error");
    }
  }

  // 🔥 Loading & error states
  if (loading) return <p>Loading...</p>;
  if (!data || !data.user) return <NotFoundPage />;

  return (
    <>
      <div className={styles.page}>
        {/* HEADER */}
        <div className={styles.header}>
          <div className={styles.avatar}>
            {data.user.username[0].toUpperCase()}
          </div>

          <div className={styles.info}>
            <h2>{data.user.username}</h2>
            <p>
              {data.lists.length} lists • {data.reviews.length} reviews
            </p>
          </div>
        </div>

        {/* LISTS */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              Lists
            </h3>
          </div>

          {data.lists.length === 0 ? (
            <div className={styles.emptyState}>
              No lists yet
            </div>
          ) : (
            <div className={styles.listGrid}>
              {data.lists.map((list) => (
                <div
                  key={list.id}
                  className={styles.listCard}
                  onClick={() => setSelectedList(list)}
                >
                  <div className={styles.listCardHeader}>
                    <div className={styles.listTitle}>
                      <h4>{list.name}</h4>
                      <p className={styles.listCount}>
                        {list.books.length} books
                      </p>
                    </div>

                    {isOwnProfile && !list.is_system && (
                      <button
                        className={styles.deleteButton}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteList(list.id);
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className={styles.bookRow}>
                    {list.books.slice(0, 5).map((book) => (
                      <img
                        key={book.id}
                        src={book.cover}
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
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>
              Reviews
            </h3>
          </div>

          {data.reviews.length === 0 ? (
            <div className={styles.emptyState}>
              No reviews yet
            </div>
          ) : (
            <div className={styles.reviewList}>
              {data.reviews.map((review) => (
                <ProfileReviewCard
                  key={review.id}
                  review={review}
                  isOwnProfile={isOwnProfile}
                  onOpen={setSelectedReview}
                  onEdit={setEditingReview}
                  onDelete={handleDeleteReview}
                />
              ))}
            </div>
          )}
        </section>

        {/* MODAL */}
        <Modal
          isOpen={!!selectedList}
          onClose={() => setSelectedList(null)}
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
                  onAction={(b) =>
                    handleRemoveFromList(selectedList.id, b.id)
                  }
                />
              )}
            />
          )}
        </Modal>
        <ReviewModal
          review={selectedReview}
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      </div>
      <ReviewFormModal
        isOpen={!!editingReview}
        mode="edit"
        review={editingReview}
        onClose={() => setEditingReview(null)}
        onSuccess={loadProfile}
      />
    </>
  );
}

export default ProfilePage;