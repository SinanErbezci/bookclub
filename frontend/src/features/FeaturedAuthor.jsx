import { useEffect, useState } from "react";
import { getRandomAuthor } from "../api/authors";
import BookCard from "../components/BookCard";
import SkeletonRow from "../components/SkeletonRow";

function FeaturedAuthor() {
  const [author, setAuthor] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getRandomAuthor();
      setAuthor(data);
    }

    fetchData();
  }, []);

  if (!author) {
    return <SkeletonRow />;
  }

  return (
    <div className="fade-in">
    <section>
      <h2>Author: {author.name}</h2>

      <div className="recent-scroll-container">
        <div className="recent-scroll-row">
        {author.books.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
      </div>
    </section>
    </div>
  );
}

export default FeaturedAuthor;