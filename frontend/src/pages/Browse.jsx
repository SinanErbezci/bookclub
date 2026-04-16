import { useEffect, useState } from "react";
import RecentlyAdded from "../features/RecentlyAdded";
import FeaturedAuthor from "../features/FeaturedAuthor";
import FeaturedGenre from "../features/FeaturedGenre";
import { getRecentBooks, getRandomAuthor, getRandomGenre } from "../api";

function Browse() {
  const [books, setBooks] = useState([]);
  const [author, setAuthor] = useState(null);
  const [genre, setGenre] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const [booksData, authorData, genreData] = await Promise.all([
        getRecentBooks(),
        getRandomAuthor(),
        getRandomGenre(),
      ]);

      setBooks(booksData.results);
      setAuthor(authorData);
      setGenre(genreData);
    }

    fetchData();
  }, []);

  if (!author || !genre) return <div>Loading...</div>;

  return (
    <div>
      <RecentlyAdded books={books} />
      <FeaturedAuthor author={author} />
      <FeaturedGenre genre={genre} />
    </div>
  );
}

export default Browse;