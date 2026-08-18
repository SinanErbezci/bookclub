import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import CarouselSkeleton from "./CarouselSkeleton";
import styles from "./CarouselSection.module.css";

interface CarouselSectionProps<T> {
  title: string;
  titleLink?: string;
  items?: T[];
  loading?: boolean;
  renderItem?: (item: T) => ReactNode;
}

function CarouselSection<T>({
  title,
  titleLink,
  items = [],
  loading = false,
  renderItem,
}: CarouselSectionProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);

  const CARD_WIDTH = 180;
  const GAP = 16;

  const safeItems = items;
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
    <section className={styles.section}>
      <h2 className={styles.title}>
        {titleLink ? (
          <Link to={titleLink} className={styles.titleLink}>
            {title}
          </Link>
        ) : (
          title
        )}
      </h2>
      <div className={styles.wrapper}>
        {/* LEFT ARROW (hidden when unnecessary) */}
        {!shouldCenter && (
          <button
            type="button"
            onClick={handlePrev}
            disabled={index === 0}
            className={styles.arrow}
          >
            ◀
          </button>
        )}

        {/* VIEWPORT */}
        <div className={styles.container} ref={containerRef}>
          <div
            className={`${styles.row} ${shouldCenter ? styles.centered : ""}`}
            style={{
              transform: shouldCenter
                ? "translateX(0)"
                : `translateX(-${translateX}px)`,
            }}
          >
            {loading ? (
              <CarouselSkeleton count={Math.max(visibleCount, 4)} />
            ) : itemCount === 0 ? (
              <p>No items found.</p>
            ) : (
              safeItems.map((item) => renderItem?.(item))
            )}
          </div>
        </div>

        {/* RIGHT ARROW (hidden when unnecessary) */}
        {!shouldCenter && (
          <button
            type="button"
            onClick={handleNext}
            disabled={index >= maxIndex}
            className={styles.arrow}
          >
            ▶
          </button>
        )}
      </div>
    </section>
  );
}

export default CarouselSection;