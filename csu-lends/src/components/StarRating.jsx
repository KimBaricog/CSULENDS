import "./style/starrating.css";

// Shows a rating as stars. value is 0 to 5 (decimals are fine, like 4.6).
export default function StarRating({ value = 0, count, size = "md", showNumber = true }) {
  const percent = Math.max(0, Math.min(100, (Number(value) / 5) * 100));
  const hasRatings = count === undefined || count > 0;

  if (!hasRatings) return <span className="stars-none">No ratings yet</span>;

  return (
    <span className={`stars stars--${size}`}>
      <span
        className="stars-row"
        style={{ "--stars-percent": `${percent}%` }}
        role="img"
        aria-label={`${Number(value).toFixed(1)} out of 5 stars`}
      >
        ★★★★★
      </span>
      {showNumber && (
        <span className="stars-text">
          <strong>{Number(value).toFixed(1)}</strong>
          {count !== undefined && <span> ({count} {count === 1 ? "rating" : "ratings"})</span>}
        </span>
      )}
    </span>
  );
}

// Five buttons for choosing a rating.
export function StarInput({ value, onChange }) {
  return (
    <div className="starinput" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
          className={n <= value ? "is-on" : ""}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
