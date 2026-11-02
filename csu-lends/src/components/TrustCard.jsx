import { Link } from "react-router-dom";
import { initialOf, memberSince } from "../lib/people";
import "./style/trustcard.css";

const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Shows who someone is and what they have actually done on CSULends.
// role: "lender" or "borrower". studentId: makes the name a link to their profile.
// compact: only the small facts, no name (the page already shows the name).
export default function TrustCard({
  name,
  program,
  summary,
  role = "lender",
  compact = false,
  studentId,
}) {
  const shownName = summary?.full_name || name || "A classmate";
  const shownProgram = summary?.program || program;
  const chips = [];

  if (summary) {
    chips.push(
      summary.rating_count > 0
        ? {
            text: `★ ${Number(summary.rating_avg).toFixed(1)} (${summary.rating_count})`,
            rating: true,
          }
        : { text: "No ratings yet" },
    );
    if (summary.email_verified)
      chips.push({ text: "Email verified", good: true });
    chips.push({ text: `Member since ${memberSince(summary.member_since)}` });

    if (role === "lender") {
      chips.push({
        text: `${count(summary.items_shared, "item", "items")} shared`,
      });
      chips.push(
        summary.loans_as_lender > 0
          ? {
              text: `${count(summary.loans_as_lender, "loan", "loans")} completed`,
              good: true,
            }
          : { text: "No completed loans yet" },
      );
    } else {
      chips.push(
        summary.loans_as_borrower > 0
          ? {
              text: `Returned ${count(summary.loans_as_borrower, "borrowed item", "borrowed items")}`,
              good: true,
            }
          : { text: "First-time borrower" },
      );
    }
  }

  const chipList = chips.length > 0 && (
    <ul className="trust-chips">
      {chips.map((chip) => (
        <li
          key={chip.text}
          className={`trust-chip ${chip.good ? "trust-chip--good" : ""} ${chip.rating ? "trust-chip--rating" : ""}`}
        >
          {chip.text}
        </li>
      ))}
    </ul>
  );

  if (compact) return chipList || null;

  return (
    <div className="trust">
      <span className="trust-avatar" aria-hidden="true">
        {initialOf(shownName)}
      </span>
      <div className="trust-body">
        <span className="trust-role">
          {role === "lender" ? "Lender" : "Borrower"}
        </span>
        {studentId ? (
          <Link
            to={`/students/${studentId}`}
            className="trust-name trust-name--link"
          >
            {shownName}
          </Link>
        ) : (
          <strong className="trust-name">{shownName}</strong>
        )}
        {shownProgram && <span className="trust-program">{shownProgram}</span>}
        {chipList}
        {studentId && (
          <Link to={`/students/${studentId}`} className="trust-more">
            See profile, items and ratings
          </Link>
        )}
      </div>
    </div>
  );
}
