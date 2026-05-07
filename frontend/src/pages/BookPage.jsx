import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBookById, getBooksByGenre } from "../api/books";
import { getReviewsByBook } from "../api/reviews";
import CarouselSection from "../components/CarouselSection/CarouselSection";
import ReviewSection from "../features/reviews/ReviewSection";
import BookCard from "../components/BookCard";
import BookPageSkeleton from "../components/BookPageSkeleton";
import placeholder_book from "../assets/placeholder_book.png";
import { useAuth } from "../context/AuthContext";
import {
  addBookToList,
  removeBookFromList,
  createList,
} from "../api/lists";
import { fetchUserProfile } from "../api/users";
import { useToast } from "../context/ToastContext";
import NotFoundPage from "./NotFoundPage";
import LoadingScreen from "../components/LoadingScreen";
import ListDropdown from "../components/lists/ListDropdown";

function BookPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [similarBooks, setSimilarBooks] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  const description = book?.description || "";
  const isLong = description.length > 300;

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

  // 📚 Fetch similar books
  useEffect(() => {
    if (!book?.genres?.length) return;

    async function fetchSimilar() {
      try {
        setLoadingSimilar(true);
        const genreId = book.genres[0].id;
        const data = await getBooksByGenre(genreId);

        const filtered = data.filter((b) => b.id !== book.id);
        setSimilarBooks(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSimilar(false);
      }
    }

    fetchSimilar();
  }, [book]);

  // ✍️ Fetch reviews
  useEffect(() => {
    async function fetchReviews() {
      try {
        setLoadingReviews(true);
        const data = await getReviewsByBook(id);
        setReviews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingReviews(false);
      }
    }

    fetchReviews();
  }, [id]);

if (loading) {
  return (
    <LoadingScreen
      text="Loading book..."
      fullPage
    />
  );
}
  if (!book) return <NotFoundPage />

  return (
    <div className="book-page container mt-5">
      <div className="book-layout">

        {/* LEFT */}
        <div className="book-cover-wrapper">
          <img
            src={book.cover || placeholder_book}
            alt={book.title}
            className="book-cover-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholder_book;
            }}
          />

          <div className="book-rating">
            ⭐ {book.rating} ({book.num_ratings})
          </div>

{user && (
  <ListDropdown book={book} />
)}
        </div>

        {/* RIGHT */}
        <div className="book-info">
          <h2 className="book-title">{book.title}</h2>

          <h5 className="book-author">
            by{" "}
            <Link to={`/authors/${book.author}`}>
              {book.author_name}
            </Link>
          </h5>

          <p className="book-meta">
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

          <div className="book-genres">
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
                className={`book-description ${expanded ? "expanded" : ""
                  }`}
              >
                <p>{description}</p>
              </div>

              {isLong && (
                <button
                  className="btn btn-ghost read-more-btn"
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
        title="Similar Books"
        items={similarBooks}
        loading={loadingSimilar}
        renderItem={(book) => (
          <BookCard key={book.id} book={book} />
        )}
      />
    </div>
  );
}

export default BookPage;