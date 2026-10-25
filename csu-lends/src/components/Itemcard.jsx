import { formatFee } from "../lib/itemOptions";
import "./style/Itemcard.css";

// "Maria Santos" becomes "Maria S." so full names are not shown to everyone.
function shortName(fullName) {
  if (!fullName) return "a classmate";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

export default function ItemCard({ item }) {
  const free = item.fee_per_day === 0;

  return (
    <article className="itemcard">
      <div className="itemcard-photo">
        <img src={item.photo_url} alt={item.name} loading="lazy" />
      </div>

      <div className="itemcard-body">
        <h2>{item.name}</h2>
        <p className="itemcard-meta">
          {item.category} · {item.condition}
        </p>
        {item.description && (
          <p className="itemcard-description">{item.description}</p>
        )}

        <div className="itemcard-bottom">
          <span className={`itemcard-fee ${free ? "itemcard-fee--free" : ""}`}>
            {formatFee(item.fee_per_day)}
          </span>
          <span className="itemcard-days">
            Up to {item.max_days} {item.max_days === 1 ? "day" : "days"}
          </span>
        </div>

        <p className="itemcard-owner">
          {item.pickup_spot} · Lent by {shortName(item.owner?.full_name)}
        </p>
      </div>
    </article>
  );
}
