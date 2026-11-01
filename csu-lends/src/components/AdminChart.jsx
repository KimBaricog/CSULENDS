// A small bar chart: one bar per day. data = [{ day: "2026-10-25", count: 3 }, ...]
const formatDay = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });

export default function AdminChart({ title, data = [], color = "var(--primary-color, #2557e8)" }) {
  const max = Math.max(1, ...data.map((point) => point.count));
  const total = data.reduce((sum, point) => sum + point.count, 0);

  return (
    <figure className="adminchart">
      <figcaption>
        <strong>{title}</strong>
        <span>{total} in 14 days</span>
      </figcaption>

      <div className="adminchart-bars" role="img" aria-label={`${title}: ${total} in the last 14 days`}>
        {data.map((point) => (
          <div key={point.day} className="adminchart-col" title={`${formatDay(point.day)}: ${point.count}`}>
            <span className="adminchart-value">{point.count > 0 ? point.count : ""}</span>
            <span
              className="adminchart-bar"
              style={{ height: `${Math.max(point.count > 0 ? 8 : 3, (point.count / max) * 100)}%`, background: color }}
            />
          </div>
        ))}
      </div>

      {data.length > 0 && (
        <div className="adminchart-axis">
          <span>{formatDay(data[0].day)}</span>
          <span>Today</span>
        </div>
      )}
    </figure>
  );
}
