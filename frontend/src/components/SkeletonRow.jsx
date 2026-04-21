// src/components/SkeletonRow.jsx
import SkeletonCard from "./SkeletonCard";

function SkeletonRow() {
  return (
    <div className="recent-scroll-container">
      <div className="recent-scroll-row">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="book-card-wrapper" key={i}>
            <SkeletonCard />
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkeletonRow;