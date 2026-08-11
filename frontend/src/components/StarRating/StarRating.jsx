import styles from "./StarRating.module.css";

export default function StarRating({
  value,
  onChange,
  onHover,
  onLeave,
  readOnly = false,
  size = "medium",
}) {
  return (
    <div className={`${styles.rating} ${styles[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= value;

        if (readOnly) {
          return (
            <span
              key={star}
              className={`${styles.star} ${
                active ? styles.active : ""
              }`}
              aria-hidden="true"
            >
              ★
            </span>
          );
        }

        return (
          <button
            key={star}
            type="button"
            className={`${styles.star} ${
              active ? styles.active : ""
            }`}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => onHover?.(star)}
            onMouseLeave={onLeave}
            aria-label={`Rate ${star} out of 5`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}