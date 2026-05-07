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

  const [lists, setLists] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loadingLists, setLoadingLists] = useState(false);
  const [newListName, setNewListName] = useState("");


  const description = book?.description || "";
  const isLong = description.length > 300;

  const isInAnyList = book
    ? lists.some(list =>
      list.books.some(b => b.id === book.id)
    )
    : false;

  // 📘 Fetch book
  useEffect(() => {
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

  // 📚 Fetch user lists (SAFE VERSION)
  useEffect(() => {
    if (!user?.id || !book?.id) return;

    async function fetchLists() {
      setLoadingLists(true);
      try {
        const data = await fetchUserProfile(user.id);
        setLists(data.lists);
      } catch (err) {
        console.error("Failed to fetch lists:", err);
        setLists([]); // prevent crash
      } finally {
        setLoadingLists(false);
      }
    }

    fetchLists();
  }, [user, book]);

  // outside click close
  useEffect(() => {
    function handleClickOutside(e) {
      if (!e.target.closest(".list-section")) {
        setShowPicker(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  async function refreshLists() {
    if (!user?.id) return;
    try {
      const data = await fetchUserProfile(user.id);
      setLists(data?.lists || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdd(listId) {
    try {
      const res = await addBookToList(listId, book.id);

      if (res.created) {
        addToast("Added to list", "success");
      } else {
        addToast("Already in list", "error");
      }

      await refreshLists();
      setShowPicker(false);
    } catch {
      addToast("Failed to add book", "error");
    }
  }

  async function handleRemove(listId) {
    try {
      const res = await removeBookFromList(listId, book.id);

      if (res.deleted) {
        addToast("Removed from list", "success");
      } else {
        addToast("Already removed", "error");
      }

      await refreshLists();
      setShowPicker(false);
    } catch {
      addToast("Failed to remove book", "error");
    }
  }

  async function handleCreateList() {
    if (!newListName.trim()) return;

    try {
      const newList = await createList(newListName);
      const res = await addBookToList(newList.id, book.id);

      if (res.created) {
        addToast(`Added to "${newList.name}"`, "success");
      } else {
        addToast("Already in list", "success");
      }

      await refreshLists();
      setNewListName("");
      setShowPicker(false);
    } catch (err) {
      addToast(err.message || "Failed to create list", "error");
    }
  }

  if (loading) return <BookPageSkeleton />;
  if (!book) return <p>Book not found.</p>;

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
            <div className="list-section">
              <button
                className={`list-toggle-btn ${isInAnyList ? "active" : ""}`}
                onClick={() => setShowPicker(p => !p)}
              >
                {isInAnyList ? "✓ In List" : "+ Add to List"}
              </button>

              {showPicker && (
                <div className="list-dropdown">
                  {loadingLists ? (
                    <p>Loading...</p>
                  ) : (
                    <>
                      {lists.map(list => {
                        const inList = list.books.some(
                          b => b.id === book.id
                        );

                        return (
                          <div key={list.id} className="list-row">
                            <span className="twoliner">{list.name}</span>

                            {inList ? (
                              <button onClick={() => handleRemove(list.id)}>
                                Remove
                              </button>
                            ) : (
                              <button onClick={() => handleAdd(list.id)}>
                                Add
                              </button>
                            )}
                          </div>
                        );
                      })}

                      <div className="list-create">
                        <input
                          value={newListName}
                          onChange={(e) => setNewListName(e.target.value)}
                          placeholder="New list..."
                        />
                        <button onClick={handleCreateList}>
                          Create
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
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