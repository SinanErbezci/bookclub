import { useEffect, useState } from "react";
import { getRandomAuthor } from "../api/authors";
import BookCard from "../components/BookCard";
import SkeletonRow from "../components/SkeletonRow";
import CarouselSection from "./CarouselSection";

function FeaturedAuthor() {
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      const data = await getRandomAuthor();
      setAuthor(data);

      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <CarouselSection 
    title={`Genre: ${author?.name}`}
    items={author?.books}
    loading={loading}
    renderItem={(book) => (
      <BookCard key={book.id} book={book} />
    )}
    />
  );
}

export default FeaturedAuthor;