import SkeletonRow from "./SkeletonRow";

function AuthorPageSkeleton() {
  return (
    <div className="container mt-5">

      <div className="author-header">
        <div className="skeleton-base skeleton-shimmer author-avatar" />

        <div className="author-info">
          <div className="skeleton-base skeleton-shimmer skeleton-title" />
          <div className="skeleton-base skeleton-shimmer skeleton-meta" />
          <div className="skeleton-base skeleton-shimmer skeleton-desc short" />
        </div>
      </div>

      <div className="author-books-section">
        <SkeletonRow count={4} />
      </div>

    </div>
  );
}

export default AuthorPageSkeleton;