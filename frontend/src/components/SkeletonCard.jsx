function SkeletonCard() {
  return (
    <div className="book-card">
      <div className="book-card-img skeleton-base skeleton-shimmer" />

      <div className="book-card-body">
        <div className="skeleton-base skeleton-shimmer skeleton-text title" />
        <div className="skeleton-base skeleton-shimmer skeleton-text author" />
      </div>
    </div>
  );
}

export default SkeletonCard;