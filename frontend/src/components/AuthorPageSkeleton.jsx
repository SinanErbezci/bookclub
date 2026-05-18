import CarouselSection from "./CarouselSection/CarouselSection";
import styles from "./AuthorPageSkeleton.module.css";

function AuthorPageSkeleton() {
  return (
    <div className="container mt-5">

      {/* HEADER */}
      <div className="author-header">

        <div className="author-avatar">
          <div className={styles.avatarSkeleton} />
        </div>

        <div className="author-info">
          <div className={styles.nameSkeleton} />
          <div className={styles.metaSkeleton} />
          <div className={styles.descSkeleton} />
        </div>

      </div>

      {/* BOOKS */}
      <div className="author-books-section">
        <CarouselSection
          title="Loading books..."
          items={[]}
          loading={true}
          renderItem={() => null}
        />
      </div>

    </div>
  );
}

export default AuthorPageSkeleton;