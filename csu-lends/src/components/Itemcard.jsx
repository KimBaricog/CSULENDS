import { Link } from "react-router-dom";
import { formatFee } from "../lib/itemOptions";
import { initialOf } from "../lib/people";
import VerifiedBadge from "./VerifiedBadge";
import { useState } from "react";
import BrowseSkeletal from "./skeletal-loading/BrowseSkeletal";
import "./style/Itemcard.css";

// lenderSummary (optional) adds the lender's average rating next to their name.
export default function ItemCard({ item, onSelect, lenderSummary }) {
  const free = item.fee_per_day === 0;
  const lenderName = item.owner?.full_name || "A classmate";
  const hasRating = lenderSummary && lenderSummary.rating_count > 0;

  const isLoading = lenderSummary === undefined;
  return (
    <article className="itemcard">
      {isLoading ? (
        <BrowseSkeletal BrowserItem={true} />
      ) : (
        <>
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
              <span
                className={`itemcard-fee ${free ? "itemcard-fee--free" : ""}`}
              >
                {formatFee(item.fee_per_day)}
              </span>
              <span className="itemcard-days">
                Up to {item.max_days} {item.max_days === 1 ? "day" : "days"}
              </span>
            </div>

            <Link
              to={`/students/${item.owner_id}`}
              className="itemcard-owner"
              aria-label={`View ${lenderName}'s profile`}
            >
              <span className="itemcard-avatar" aria-hidden="true">
                {initialOf(lenderName)}
              </span>
              <span className="itemcard-ownername">{lenderName}</span>
              {lenderSummary?.is_verified && <VerifiedBadge size="sm" />}
              {hasRating && (
                <span className="itemcard-rating">
                  ★ {Number(lenderSummary.rating_avg).toFixed(1)}
                </span>
              )}
            </Link>
            <p className="itemcard-pickup">{item.pickup_spot}</p>
          </div>
        </>
      )}
    </article>
  );
}
