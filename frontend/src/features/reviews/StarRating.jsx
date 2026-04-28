export default function StarRating({
  value,
  onChange,
  onHover,
  onLeave,
}) {
  return (
    <div className="rating-star">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => onHover?.(star)}
          onMouseLeave={onLeave}
          className={star <= value ? "star active" : "star"}
        >
          ★
        </span>
      ))}
    </div>
  );
}


