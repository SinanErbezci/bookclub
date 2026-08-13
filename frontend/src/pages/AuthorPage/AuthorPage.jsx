import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getAuthorById } from "../../api/authors";
import CarouselSection from "../../components/CarouselSection/CarouselSection";
import BookCard from "../../components/BookCard";
import AuthorPageSkeleton from "./AuthorPageSkeleton";
import personPlaceholder from "../../assets/profile.svg"
import NotFoundPage from "../NotFoundPage";
import styles from "./AuthorPage.module.css";


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
      <div className={styles.header}>
        <div className={styles.avatar}>
          <img
            src={personPlaceholder}
            alt={author.name}
            className={styles.avatarImg}
          />
        </div>
        <div className={styles.info}>
          <h1 className={styles.name}>{author.name}</h1>
          <p className={styles.meta}>
            {author.books?.length || 0} books
          </p>
        </div>
      </div>

      {/* BOOKS */}
      <div className={styles.booksSection}>
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