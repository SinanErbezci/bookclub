export default function StarRating({ value, onChange }) {
  return (
    <div className="rating-star">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(star)}
          style={{
            cursor: "pointer",
            color: star <= value ? "#D4AF37" : "#ccc",
            fontSize: "2rem",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}