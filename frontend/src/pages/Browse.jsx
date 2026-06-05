import RecentlyAdded from "../features/RecentlyAdded";
import FeaturedAuthor from "../features/FeaturedAuthor";
import FeaturedGenre from "../features/FeaturedGenre";

function Browse() {
  return (
    <div className="container mt-4">
      <RecentlyAdded />
      <FeaturedAuthor />
      <FeaturedGenre />
    </div>
  );
}

export default Browse;