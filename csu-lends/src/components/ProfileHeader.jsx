import { initialOf, memberSince } from "../lib/people";
import StarRating from "./StarRating";
import "./style/trustcard.css";
import "./style/profileparts.css";

const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Big card at the top of a profile: name, program, bio, rating and track record.
// actions: optional buttons (for example "Edit profile").
export default function ProfileHeader({ summary, fallbackName, actions }) {
  const name = summary?.full_name || fallbackName || "Student";
  const hasRatings = summary && summary.rating_count > 0;

  return (
    <section className="pheader">
      <span className="pheader-avatar" aria-hidden="true">{initialOf(name)}</span>

      <div className="pheader-body">
        <h1>{name}</h1>
        {summary?.program && <p className="pheader-program">{summary.program}</p>}
        {summary?.bio && <p className="pheader-bio">{summary.bio}</p>}

        <div className="pheader-rating">
          {summary &&
            (hasRatings ? (
              <StarRating value={summary.rating_avg} count={summary.rating_count} size="lg" />
            ) : (
              <span className="stars-none">No ratings yet</span>
            ))}
        </div>

        {summary && (
          <ul className="trust-chips">
            {summary.email_verified && <li className="trust-chip trust-chip--good">Email verified</li>}
            <li className="trust-chip">Member since {memberSince(summary.member_since)}</li>
            <li className="trust-chip">{count(summary.items_shared, "item", "items")} shared</li>
            <li className="trust-chip">{count(summary.loans_as_lender, "loan", "loans")} lent</li>
            <li className="trust-chip">{count(summary.loans_as_borrower, "item", "items")} borrowed and returned</li>
          </ul>
        )}

        {actions && <div className="pheader-actions">{actions}</div>}
      </div>
    </section>
  );
}
