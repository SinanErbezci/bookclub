import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getAuthorById } from "../api/authors";
import CarouselSection from "../components/CarouselSection/CarouselSection";
import BookCard from "../components/BookCard";
import AuthorPageSkeleton from "../components/AuthorPageSkeleton";
import personPlaceholder from "../assets/profile.svg"
import NotFoundPage from "./NotFoundPage";

function AuthorPage() {
  const { id } = useParams();

  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isValidAuthorId = /^\d+$/.test(id);

    if (!isValidAuthorId) {
      setAuthor(null);
      setLoading(false);
      return;
    }

    async function fetchAuthor() {
      try {
        setLoading(true);

        const data = await getAuthorById(id);

        setAuthor(data);
      } catch (err) {
        console.error(err);
        setAuthor(null);
      } finally {
        setLoading(false);
      }
    }

    fetchAuthor();
  }, [id]);

  if (loading) {
    return <AuthorPageSkeleton />
  }

  if (!author) {
    return <NotFoundPage />;
  }

  return (
    <div className="container mt-5">

      {/* HEADER */}
      <div className="author-header">
        <div className="author-avatar">
          <img
            src={personPlaceholder}
            alt={author.name}
            className="author-avatar-img"
          />
        </div>
        <div className="author-info">
          <h1 className="author-name">{author.name}</h1>
          <p className="author-meta">
            {author.books?.length || 0} books
          </p>
          <p className="author-desc">Information about the author</p>
        </div>
      </div>

      {/* BOOKS */}
      <div className="author-books-section">
        <CarouselSection
          title={`Books by ${author.name}`}
          items={author.books || []}
          loading={false}
          renderItem={(book) => (
            <BookCard key={book.id} book={book} />
          )}
        />
      </div>

    </div>
  );
}

export default AuthorPage;