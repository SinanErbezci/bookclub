import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBookById, getBooksByGenre } from "../api/books";
import CarouselSection from "../components/CarouselSection";
import ReviewSection from "../features/reviews/ReviewSection";
import BookCard from "../components/BookCard";
import BookPageSkeleton from "../components/BookPageSkeleton";
import placeholder_book from "../assets/placeholder_book.png";

function BookPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const [similarBooks, setSimilarBooks] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  const MAX_LENGTH = 300;
  const description = book?.description || "";
  const isLong = description.length > MAX_LENGTH;

  const displayText = expanded
    ? description
    : description.slice(0, MAX_LENGTH);

  useEffect(() => {
    async function fetchBook() {
      setLoading(true);

      const data = await getBookById(id); // 🔥 later dynamic

      setBook(data);
      setLoading(false);
    }

    fetchBook();
  }, [id]);

  useEffect(() => {
    async function fetchSimilar() {
      if (!book?.genres?.length) return;

      try {
        setLoadingSimilar(true);

        const genreId = book.genres[0].id;  // 🔥 first genre
        const data = await getBooksByGenre(genreId);

        // remove current book
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

  if (loading) {
    return <BookPageSkeleton />;
  }

  if (!book) {
    return <p>Book not found.</p>;
  }

  console.log(book.genres);
  return (
    <div className="book-page container mt-5">
      <div className="book-layout">

        {/* LEFT: COVER + RATING */}
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
        </div>

        {/* RIGHT: INFO */}
        <div className="book-info">
          <h2 className="book-title">{book.title}</h2>

          <h5 className="book-author">
            by{" "}
            <Link to={`/authors/${book.author}`} className="author-link">
              {book.author_name}
            </Link>
          </h5>

          {/* META INFO */}
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

          {/* GENRES */}
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

          {/* DESCRIPTION */}
          {book.description && (
            <>
              <div className={`book-description ${expanded ? "expanded" : ""}`}>
                <p>
                  {displayText}
                  {!expanded && isLong && "..."}
                </p>
              </div>

              {isLong && (
                <button
                  className="read-more-btn"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "Read less" : "Read more"}
                  <span className={`arrow ${expanded ? "open" : ""}`}>
                    ↓
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <ReviewSection
        bookId={id}   // pass logged-in user
      />

      <div className="book-suggestion-section">
        <CarouselSection
          title="Similar Books"
          items={similarBooks}
          loading={loadingSimilar}
          renderItem={(book) => (
            <BookCard key={book.id} book={book} />
          )}
        />
      </div>
    </div>
  );
}

export default BookPage;