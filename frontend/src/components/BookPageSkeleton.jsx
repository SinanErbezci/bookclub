function BookPageSkeleton() {
  return (
    <div className="book-page container mt-5">
      <div className="book-layout">

        {/* LEFT */}
        <div className="book-cover-wrapper">
          <div className="skeleton-base skeleton-shimmer skeleton-cover" />
          <div className="skeleton-base skeleton-shimmer skeleton-rating" />
        </div>

        {/* RIGHT */}
        <div className="book-info">

          {/* TITLE */}
          <div className="skeleton-base skeleton-shimmer skeleton-title" />

          {/* AUTHOR */}
          <div className="skeleton-base skeleton-shimmer skeleton-author" />

          {/* META */}
          <div className="skeleton-base skeleton-shimmer skeleton-meta" />

          {/* GENRES (simulate pills) */}
          <div className="skeleton-genres">
            <div className="skeleton-base skeleton-shimmer skeleton-tag" />
            <div className="skeleton-base skeleton-shimmer skeleton-tag" />
            <div className="skeleton-base skeleton-shimmer skeleton-tag" />
          </div>

          {/* DESCRIPTION BLOCK */}
          <div className="skeleton-desc-group">
            <div className="skeleton-base skeleton-shimmer skeleton-desc" />
            <div className="skeleton-base skeleton-shimmer skeleton-desc" />
            <div className="skeleton-base skeleton-shimmer skeleton-desc" />
            <div className="skeleton-base skeleton-shimmer skeleton-desc short" />
          </div>

        </div>
      </div>
    </div>
  );
}

export default BookPageSkeleton;