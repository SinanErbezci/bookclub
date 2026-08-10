import BookCard from "../BookCard";
import Skeleton from "../Skeleton/Skeleton";
import styles from "./BookGrid.module.css";

function BookGrid({
  books = [],
  loading = false,
  skeletonCount = 8,
  showAuthor = false,
}) {
  return (
    <div className={styles.grid}>
      {loading
        ? Array.from({ length: skeletonCount }).map((_, index) => (
            <div className={styles.card} key={index}>
              <Skeleton className={styles.cover} />

              <div className={styles.info}>
                <Skeleton className={styles.title} />
                <Skeleton className={styles.author} />
              </div>
            </div>
          ))
        : books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              showAuthor={showAuthor}
            />
          ))}
    </div>
  );
}

export default BookGrid;