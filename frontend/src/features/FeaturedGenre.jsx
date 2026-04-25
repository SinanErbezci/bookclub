import { useEffect, useState } from "react";
import { getRandomGenre } from "../api/genres";
import BookCard from "../components/BookCard";
import SkeletonRow from "../components/SkeletonRow";
import CarouselSection from "../components/CarouselSection";

function FeaturedGenre() {
  const [genre, setGenre] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const data = await getRandomGenre();
      setGenre(data);

      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <CarouselSection 
    title={`Genre: ${genre?.name}`}
    items={genre?.books}
    loading={loading}
    renderItem={(book) => (
      <BookCard key={book.id} book={book} />
    )}
    />
  );
}
export default FeaturedGenre;