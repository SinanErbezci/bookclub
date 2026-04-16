import BookCard from "../components/BookCard";
import { Link } from "react-router-dom";

function FeaturedAuthor({ author }) {
  const books = author.books.slice(0, 5);
  const isScrollable = author.book_count > 4;

  return (
    <section>
      <h1>
        Check out books from{" "}
        <Link to={`/authors/${author.id}`}>
            {author.name}
        </Link>
      </h1>

      <div
        style={{
          display: "flex",
          overflowX: isScrollable ? "auto" : "hidden",
          justifyContent: isScrollable ? "flex-start" : "center",
        }}
      >
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </section>
  );
}

export default FeaturedAuthor;