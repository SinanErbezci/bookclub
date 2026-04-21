import { useEffect, useState } from "react";
import { getRandomGenre } from "../api/genres";
import BookCard from "../components/BookCard";
import SkeletonRow from "../components/SkeletonRow";

function FeaturedGenre() {
  const [genre, setGenre] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getRandomGenre();
      setGenre(data);
    }

    fetchData();
  }, []);

  if (!genre) {
    return <SkeletonRow />;
  }

  return (
    <div className="fade-in">
    <section>
      <h2>Genre: {genre.name}</h2>

    <div className="recent-scroll-container">
      <div className="recent-scroll-row">
        {genre.books.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
      </div>
    </section>
    </div>
  );
}
export default FeaturedGenre;