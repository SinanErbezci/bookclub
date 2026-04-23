import { useState, useRef, useEffect } from "react";
import SkeletonRow from "../components/SkeletonRow";

function CarouselSection({
  title,
  items = [],
  loading,
  renderItem,
}) {
  const containerRef = useRef(null);

  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  const CARD_WIDTH = 180;
  const GAP = 16;

  const safeItems = items || [];
  const itemCount = safeItems.length;

  // 🔥 calculate visible cards dynamically
  useEffect(() => {
    function calculateVisible() {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.offsetWidth;
      const count = Math.floor(containerWidth / (CARD_WIDTH + GAP));

      setVisibleCount(count > 0 ? count : 1);
    }

    calculateVisible();
    window.addEventListener("resize", calculateVisible);

    return () => window.removeEventListener("resize", calculateVisible);
  }, []);

  // 🔥 max index
  const maxIndex = Math.max(0, itemCount - visibleCount);

  // 🔥 keep index valid
  useEffect(() => {
    if (index > maxIndex) {
      setIndex(maxIndex);
    }
  }, [maxIndex, index]);

  // 🔥 center mode
  const shouldCenter = itemCount <= visibleCount;

  // 🔥 movement
  const translateX = index * (CARD_WIDTH + GAP);

  function handlePrev() {
    setIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }

  function handleNext() {
    setIndex((prev) => (prev < maxIndex ? prev + 1 : prev));
  }

  return (
    <section>
      <h2 className="form-title mt-4">{title}</h2>

      <div className="carousel-wrapper">
        {/* LEFT ARROW (hidden when unnecessary) */}
        {!shouldCenter && (
          <button
            onClick={handlePrev}
            disabled={index === 0}
            className="carousel-arrow"
          >
            ◀
          </button>
        )}

        {/* VIEWPORT */}
        <div className="carousel-container" ref={containerRef}>
          <div
            className={`carousel-row ${shouldCenter ? "centered" : ""}`}
            style={{
              transform: shouldCenter
                ? "translateX(0)"
                : `translateX(-${translateX}px)`,
            }}
          >
            {loading ? (
              <SkeletonRow count={visibleCount} />
            ) : itemCount === 0 ? (
              <p>No items found.</p>
            ) : (
              safeItems.map((item) => renderItem(item))
            )}
          </div>
        </div>

        {/* RIGHT ARROW (hidden when unnecessary) */}
        {!shouldCenter && (
          <button
            onClick={handleNext}
            disabled={index >= maxIndex}
            className="carousel-arrow"
          >
            ▶
          </button>
        )}
      </div>
    </section>
  );
}

export default CarouselSection;