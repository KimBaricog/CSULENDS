import "./style/verifiedbadge.css";

// A small blue check that means "an admin checked this student's school documents".
export default function VerifiedBadge({ size = "md" }) {
  return (
    <span className={`vbadge vbadge--${size}`} title="Verified student" role="img" aria-label="Verified student">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M7 12.5l3.2 3.2L17 8.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
