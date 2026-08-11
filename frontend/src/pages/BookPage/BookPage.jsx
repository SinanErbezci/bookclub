import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getBookById,
  getBookRecommendations,
  getRecommendationExplanation,
} from "../../api/books";
import { getReviewsByBook } from "../../api/reviews";
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

function BookPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const [reviews, setReviews] = useState([]);

  const [similarBooks, setSimilarBooks] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  const description = book?.description || "";
  const isLong = description.length > 300;

  const [explanations, setExplanations] = useState({});
  const [loadingExplanations, setLoadingExplanations] = useState({});

  const [selectedRecommendationId, setSelectedRecommendationId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recommendationErrors, setRecommendationErrors] = useState({});

  const explanation = explanations[selectedRecommendationId];
  const isLoading = loadingExplanations[selectedRecommendationId];
  const hasError = recommendationErrors[selectedRecommendationId];

  const handleExplain = async (sourceId, recommendedId) => {
    if (explanations[recommendedId]) {
      return;
    }
    if (loadingExplanations[recommendedId]) {
      return;
    }

    try {
      setRecommendationErrors(prev => ({
        ...prev,
        [recommendedId]: false,
      }));
      setLoadingExplanations(prev => ({
        ...prev,
        [recommendedId]: true,
      }));

      const data = await getRecommendationExplanation(
        sourceId,
        recommendedId
      );

      setExplanations(prev => ({
        ...prev,
        [recommendedId]: data,
      }));
    } catch (err) {
      console.error(err);
      setRecommendationErrors(prev => ({
        ...prev,
        [recommendedId]: true,
      }));
    } finally {
      setLoadingExplanations(prev => ({
        ...prev,
        [recommendedId]: false,
      }));
    }
  };

  const clickRecommendation = (sourceBookId, recommendationId) => {
    setSelectedRecommendationId(recommendationId);
    setIsModalOpen(true);

    if (!user) {
      return;
    }

    handleExplain(sourceBookId, recommendationId);
  };

  // 📘 Fetch book
  useEffect(() => {
    const isValidAuthorId = /^\d+$/.test(id);

    if (!isValidAuthorId) {
      setBook(null);
      setLoading(false);
      return;
    }
    async function fetchBook() {
      setLoading(true);
      try {
        const data = await getBookById(id);
        setBook(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id]);

  // 📚 Fetch Recommendation
  useEffect(() => {
    if (!book) {
      return;
    }

    async function fetchRecommendations() {
      try {
        setLoadingSimilar(true);

        const recommendations =
          await getBookRecommendations(
            book.id
          );

        setSimilarBooks(
          recommendations
        );

      } catch (err) {
        console.error(err);
        setSimilarBooks([]);
      } finally {
        setLoadingSimilar(false);
      }
    }

    fetchRecommendations();

  }, [book]);

  // ✍️ Fetch reviews
  useEffect(() => {
    async function fetchReviews() {
      try {
        const data = await getReviewsByBook(id);
        setReviews(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchReviews();
  }, [id]);

  if (loading) {
    return <BookPageSkeleton />;
  }
  if (!book) return <NotFoundPage />

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
              e.target.onerror = null;
              e.target.src = placeholder_book;
            }}
          />

          <div className={styles.rating}>
            ⭐ {book.rating} ({book.num_ratings})
          </div>

          {user && (
            <ListDropdown book={book} />
          )}
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
              <span>
                Published: {new Date(book.pub_date).getFullYear()}
              </span>
            )}
          </p>

          {book.series && (
            <div className={styles.series}>
              <span className={styles.seriesLabel}>
                Series:
              </span>{" "}
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
                className="genre-tag"
              >
                {genre.name}
              </Link>
            ))}
          </div>

          {book.description && (
            <>
              <div
                className={`${styles.description} ${expanded ? styles.expanded : ""
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

      <ReviewSection
        reviews={reviews}
        setReviews={setReviews}
        bookId={id}
      />

      <CarouselSection
        title="You May Also Like"
        items={similarBooks}
        loading={loadingSimilar}
        renderItem={(recommendedBook) => (
          <BookCard
            key={recommendedBook.id}
            book={recommendedBook}
            recommendationSourceId={book.id}
            explanation={explanations[recommendedBook.id]}
            loadingExplanations={loadingExplanations[recommendedBook.id]}
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