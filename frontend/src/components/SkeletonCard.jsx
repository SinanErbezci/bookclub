function SkeletonCard() {
  return (
    <div className="book-card">
      <div className="book-card-img skeleton shimmer"></div>

      <div className="book-card-body">
        <div className="skeleton skeleton-title shimmer"></div>
        <div className="skeleton skeleton-author shimmer"></div>
      </div>
    </div>
  );
}

export default SkeletonCard;