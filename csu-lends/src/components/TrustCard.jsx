import { initialOf, memberSince } from "../lib/people";
import "./style/trustcard.css";

const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Shows who someone is and what they have actually done on CSULends.
// role: "lender" or "borrower". compact: only the small facts, no name (the page shows the name).
export default function TrustCard({
  name,
  program,
  summary,
  role = "lender",
  compact = false,
}) {
  const shownName = summary?.full_name || name || "A classmate";
  const shownProgram = summary?.program || program;
  const chips = [];

  if (summary) {
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
          className={chip.good ? "trust-chip trust-chip--good" : "trust-chip"}
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
        <strong className="trust-name">{shownName}</strong>
        {shownProgram && <span className="trust-program">{shownProgram}</span>}
        {chipList}
      </div>
    </div>
  );
}
