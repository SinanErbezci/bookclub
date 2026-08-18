import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getBookById,
  getBookRecommendations,
  getRecommendationExplanation,
} from "../../api/books";
import CarouselSection from "../../components/CarouselSection/CarouselSection";
import ReviewSection from "../../features/reviews/ReviewSection";
import BookCard from "../../components/BookCard";
import placeholder_book from "../../assets/placeholder_book.png";
import { useAuth } from "../../context/AuthContext";
import NotFoundPage from "../NotFoundPage";
import ListDropdown from "../../components/ListDropdown/ListDropdown";
import RecommendationModal from "../../components/RecommendationModal/RecommendationModal";
import styles from "./BookPage.module.css";
import BookPageSkeleton from "./BookPageSkeleton";

import type { Book, BookListItem } from "../../types/book";
import type { RecommendationExplanation } from "../../types/recommendation";

function BookPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const [similarBooks, setSimilarBooks] = useState<BookListItem[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  const description = book?.description || "";
  const isLong = description.length > 300;

  const [explanations, setExplanations] = useState<
    Record<number, RecommendationExplanation>
  >({});
  
  const [loadingExplanations, setLoadingExplanations] = useState<
    Record<number, boolean>
  >({});
  const [recommendationErrors, setRecommendationErrors] = useState<
    Record<number, boolean>
  >({});

  const [selectedRecommendationId, setSelectedRecommendationId] = useState<
    number | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const explanation =
    selectedRecommendationId !== null
      ? explanations[selectedRecommendationId]
      : undefined;

  const isLoading =
    selectedRecommendationId !== null
      ? loadingExplanations[selectedRecommendationId]
      : false;

  const hasError =
    selectedRecommendationId !== null
      ? recommendationErrors[selectedRecommendationId]
      : false;

  const handleExplain = async (sourceId: number, recommendedId: number) => {
    if (explanations[recommendedId]) {
      return;
    }
    if (loadingExplanations[recommendedId]) {
      return;
    }

    try {
      setRecommendationErrors((prev) => ({
        ...prev,
        [recommendedId]: false,
      }));
      setLoadingExplanations((prev) => ({
        ...prev,
        [recommendedId]: true,
      }));

      const data = await getRecommendationExplanation(sourceId, recommendedId);

      setExplanations((prev) => ({
        ...prev,
        [recommendedId]: data,
      }));
    } catch (err) {
      console.error(err);
      setRecommendationErrors((prev) => ({
        ...prev,
        [recommendedId]: true,
      }));
    } finally {
      setLoadingExplanations((prev) => ({
        ...prev,
        [recommendedId]: false,
      }));
    }
  };

  const clickRecommendation = (
    sourceBookId: number,
    recommendationId: number,
  ) => {
    setSelectedRecommendationId(recommendationId);
    setIsModalOpen(true);

    if (!user) {
      return;
    }

    handleExplain(sourceBookId, recommendationId);
  };

  // 📘 Fetch book
  useEffect(() => {
    if (!id || !/^\d+$/.test(id)) {
      setBook(null);
      setLoading(false);
      return;
    }

    const bookId = Number(id);

    async function fetchBook() {
      setLoading(true);

      try {
        const data = await getBookById(bookId);
        setBook(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id]);

  useEffect(() => {
    if (!book) {
      return;
    }

    const bookId = book.id;

    async function fetchRecommendations() {
      try {
        setLoadingSimilar(true);

        const recommendations = await getBookRecommendations(bookId);

        setSimilarBooks(recommendations);
      } catch (err) {
        console.error(err);
        setSimilarBooks([]);
      } finally {
        setLoadingSimilar(false);
      }
    }

    fetchRecommendations();
  }, [book]);

  useEffect(() => {
    setExplanations({});
    setLoadingExplanations({});
    setRecommendationErrors({});
    setSelectedRecommendationId(null);
    setIsModalOpen(false);
  }, [id]);

  if (loading) {
    return <BookPageSkeleton />;
  }
  if (!book) return <NotFoundPage />;

  return (
    <div className="container mt-5">
      <div className={styles.layout}>
        {/* LEFT */}
        <div className={styles.coverWrapper}>
          <img
            src={book.cover || placeholder_book}
            alt={book.title}
            className={styles.coverImage}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = placeholder_book;
            }}
          />

          <div className={styles.rating}>
            ⭐ {book.rating} ({book.num_ratings})
          </div>

          {user && <ListDropdown book={book} />}
        </div>

        {/* RIGHT */}
        <div className={styles.info}>
          <h2 className={styles.title}>{book.title}</h2>

          <h5 className={styles.author}>
            by{" "}
            <Link to={`/authors/${book.author}`} className={styles.entityLink}>
              {book.author_name}
            </Link>
          </h5>

          <p className={styles.meta}>
            {book.publisher_name && (
              <>
                <span>Publisher: {book.publisher_name}</span> |{" "}
              </>
            )}
            {book.pub_date && (
              <span>Published: {new Date(book.pub_date).getFullYear()}</span>
            )}
          </p>

          {book.series && (
            <div className={styles.series}>
              <span className={styles.seriesLabel}>Series:</span>{" "}
              <Link
                to={`/series/${book.series.id}`}
                className={styles.seriesLink}
              >
                {book.series.name}
              </Link>
              {book.series_num && (
                <span className={styles.seriesNumber}>
                  {" "}
                  (#{book.series_num})
                </span>
              )}
            </div>
          )}

          <div className={styles.genres}>
            {book.genres?.map((genre) => (
              <Link
                key={genre.id}
                to={`/genres/${genre.id}`}
                className={styles.genreTag}
              >
                {genre.name}
              </Link>
            ))}
          </div>

          {book.description && (
            <>
              <div
                className={`${styles.description} ${
                  expanded ? styles.expanded : ""
                }`}
              >
                <p>{description}</p>
              </div>

              {isLong && (
                <button
                  className={`btn btn-ghost ${styles.readMoreBtn}`}
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "Read less" : "Read more"}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <ReviewSection bookId={book.id} />

      <CarouselSection
        title="You May Also Like"
        items={similarBooks}
        loading={loadingSimilar}
        renderItem={(recommendedBook) => (
          <BookCard
            key={recommendedBook.id}
            book={recommendedBook}
            recommendationSourceId={book.id}
            onExplain={clickRecommendation}
          />
        )}
      />
      <RecommendationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        explanation={explanation}
        isLoading={isLoading}
        hasError={hasError}
        user={user}
      />
    </div>
  );
}

export default BookPage;
