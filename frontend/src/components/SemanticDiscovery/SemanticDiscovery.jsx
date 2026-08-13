import { useState } from "react";
import { semanticSearch } from "../../api/search";
import BookCard from "../BookCard";
import CarouselSection from "../CarouselSection/CarouselSection";
import styles from "./SemanticDiscovery.module.css";

function SemanticDiscovery() {
  const [query, setQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Describe the kind of book you're looking for.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const results = await semanticSearch(
        trimmedQuery,
        10
      );

      setBooks(results);
    } catch (err) {
      setBooks([]);
      setError(
        err.message || "Unable to find recommendations."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          Describe Your Next Read 📚
        </h2>

        <p className={styles.subtitle}>
          Tell us what you're in the mood for. Describe
          the story, characters, setting, or atmosphere.
        </p>

        <form
          className={styles.form}
          onSubmit={handleSearch}
        >
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.textarea}
            placeholder="A dark fantasy with political intrigue, morally gray characters, and a slow-burn romance..."
            rows={4}
            maxLength={1000}
            disabled={loading}
          />

          <div className={styles.formFooter}>
            <span className={styles.charCount}>
              {query.length} / 1000
            </span>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !query.trim()}
            >
              {loading ? "Finding Books..." : "Find Books"}
            </button>
          </div>
        </form>

        {error && (
          <p className={styles.error}>{error}</p>
        )}
      </div>

      {(loading || books.length > 0) && (
        <CarouselSection
          title="Books That Match Your Description"
          items={books}
          loading={loading}
          renderItem={(book) => (
            <BookCard
              key={book.id}
              book={book}
              showAuthor
            />
          )}
        />
      )}
    </section>
  );
}

export default SemanticDiscovery;