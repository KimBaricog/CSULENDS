// Simple line icons for item categories. Use like: <span>{ICONS.racket}</span>
// They take the text color of whatever contains them (stroke="currentColor").

export const ICONS = {
  racket: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g
        transform="rotate(-40 32 32)"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <ellipse cx="32" cy="22" rx="14" ry="18" />
        <path d="M32 4v36M18 22h28M21 10l22 24M43 10L21 34" strokeWidth="1.3" />
        <path d="M32 40v20" strokeWidth="5" />
      </g>
    </svg>
  ),
  calculator: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="14" y="7" width="36" height="50" rx="6" />
        <rect x="20" y="13" width="24" height="10" rx="2" />
        <path
          d="M22 32h2M32 32h2M42 32h2M22 41h2M32 41h2M42 41h2M22 50h2M32 50h2"
          strokeWidth="4"
        />
      </g>
    </svg>
  ),
  camera: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 20h12l4-6h16l4 6h12v32H8z" />
        <circle cx="32" cy="35" r="10" />
        <circle cx="32" cy="35" r="3.5" />
      </g>
    </svg>
  ),
  book: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 10h34a6 6 0 0 1 6 6v36H18a6 6 0 0 1-6-6z" />
        <path d="M12 46a6 6 0 0 1 6-6h34M24 20h18" />
      </g>
    </svg>
  ),
  gown: (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 8l8 8 8-8 14 8-4 12-6-2v28H20V26l-6 2-4-12z" />
        <path d="M32 16v40" />
      </g>
    </svg>
  ),
};
