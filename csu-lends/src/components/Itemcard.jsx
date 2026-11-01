import { formatFee } from "../lib/itemOptions";
import { initialOf } from "../lib/people";
import "./style/Itemcard.css";

export default function ItemCard({ item, onSelect }) {
  const free = item.fee_per_day === 0;
  const lenderName = item.owner?.full_name || "A classmate";

  return (
    <article className="itemcard">
      <button
        type="button"
        className="itemcard-hit"
        aria-label={`View ${item.name}`}
        onClick={() => onSelect && onSelect(item)}
      />
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
          <span className="itemcard-avatar" aria-hidden="true">
            {initialOf(lenderName)}
          </span>
          <span className="itemcard-ownername">{lenderName}</span>
        </p>
        <p className="itemcard-pickup">{item.pickup_spot}</p>
      </div>
    </article>
  );
}
