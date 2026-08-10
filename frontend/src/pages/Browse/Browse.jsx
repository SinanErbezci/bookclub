import { useEffect, useState } from "react";

import { getRecentBooks } from "../../api/books";
import { getRandomAuthor } from "../../api/authors";
import { getRandomGenre } from "../../api/genres";

import BookCard from "../../components/BookCard";
import CarouselSection from "../../components/CarouselSection/CarouselSection";

function Browse() {
  const [recentBooks, setRecentBooks] = useState([]);
  const [author, setAuthor] = useState(null);
  const [genre, setGenre] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBrowseData() {
      setLoading(true);

      const [
        recentBooksResponse,
        authorResponse,
        genreResponse,
      ] = await Promise.allSettled([
        getRecentBooks(),
        getRandomAuthor(),
        getRandomGenre(),
      ]);

      if (recentBooksResponse.status === "fulfilled") {
        setRecentBooks(recentBooksResponse.value.results);
      }

      if (authorResponse.status === "fulfilled") {
        setAuthor(authorResponse.value);
      }

      if (genreResponse.status === "fulfilled") {
        setGenre(genreResponse.value);
      }

      setLoading(false);
    }

    fetchBrowseData();
  }, []);

  return (
    <div className="container mt-4">

      <CarouselSection
        title="Recently Added"
        items={recentBooks}
        loading={loading}
        renderItem={(book) => (
          <BookCard
            key={book.id}
            book={book}
            showAuthor
          />
        )}
      />

      <CarouselSection
        title={
          author
            ? `Author: ${author.name}`
            : "Author: "
        }
        titleLink={
          author
            ? `/authors/${author.id}`
            : null
        }
        items={author?.books}
        loading={loading}
        renderItem={(book) => (
          <BookCard
            key={book.id}
            book={book}
          />
        )}
      />

      <CarouselSection
        title={
          genre
            ? `Genre: ${genre.name}`
            : "Genre: "
        }
        titleLink={
          genre
            ? `/genres/${genre.id}`
            : null
        }
        items={genre?.books}
        loading={loading}
        renderItem={(book) => (
          <BookCard
            key={book.id}
            book={book}
          />
        )}
      />

    </div>
  );
}

export default Browse;