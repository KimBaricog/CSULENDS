import "./style/visual.css";

const ICONS = {
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
};

const SHOWCASE = [
  {
    id: "racket",
    icon: "racket",
    name: "Badminton racket",
    fee: "₱20/day",
    className: "Visual-card--one",
    tint: "var(--tint-lime, #eef8c4)",
  },
  {
    id: "calculator",
    icon: "calculator",
    name: "Scientific calculator",
    fee: "₱10/day",
    className: "Visual-card--two",
    tint: "var(--tint-peach, #ffe6d6)",
  },
  {
    id: "camera",
    icon: "camera",
    name: "Digital camera",
    fee: "₱50/day",
    className: "Visual-card--three",
    tint: "var(--tint-purple, #e4ddfb)",
  },
];

function Visual() {
  return (
    <>
      <aside className="Visual-visual" aria-hidden="true">
        <div className="Visual-panel">
          {SHOWCASE.map((item) => (
            <div key={item.id} className={`Visual-card ${item.className}`}>
              <div
                className="Visual-card-thumb"
                style={{ background: item.tint }}
              >
                {ICONS[item.icon]}
              </div>
              <strong>{item.name}</strong>
              <span>{item.fee}</span>
            </div>
          ))}
          <div className="Visual-quote">
            <strong>Your classmates are sharing right now.</strong>
            <span>Log in to see what is available on campus today.</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Visual;
