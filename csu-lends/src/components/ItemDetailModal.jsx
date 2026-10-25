import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import useSession from "../hooks/useSession";
import { formatFee } from "../lib/itemOptions";
import "./style/itemdetailmodal.css";

// Dates are plain "YYYY-MM-DD" text, in the student's own time zone.
const toInputDate = (date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const daysBetween = (start, end) =>
  Math.round((new Date(end) - new Date(start)) / 86400000);

const formatDay = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

function shortName(fullName) {
  if (!fullName) return "a classmate";
  const parts = fullName.trim().split(/\s+/);
  return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

// Popup with the item's details and the "Request to borrow" form.
export default function ItemDetailModal({ item, onClose }) {
  const { session } = useSession();
  const userId = session?.user?.id;
  const closeRef = useRef(null);

  const todayText = toInputDate(new Date());
  const [start, setStart] = useState(todayText);
  const [end, setEnd] = useState(toInputDate(addDays(new Date(), 1)));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const isOwner = item.owner_id === userId;
  const loanDays = Math.max(1, daysBetween(start, end));
  const total = item.fee_per_day * loanDays;

  // Escape closes the popup, the page behind it stops scrolling, and focus moves inside.
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleStartChange = (value) => {
    setStart(value);
    if (value && end < value) setEnd(value);
  };

  const handleRequest = async (event) => {
    event.preventDefault();
    setError("");

    if (!start || !end) return setError("Choose a pickup date and a return date.");
    if (end < start) return setError("The return date must be after the pickup date.");
    if (loanDays > item.max_days)
      return setError(`This item can only be borrowed for up to ${item.max_days} days.`);

    setBusy(true);
    const { error: insertError } = await supabase.from("borrow_requests").insert({
      item_id: item.id,
      borrower_id: userId,
      start_date: start,
      end_date: end,
      message: message.trim() || null,
    });
    setBusy(false);

    if (insertError) {
      if (insertError.code === "23505") {
        setError("You already have a request waiting for this item.");
      } else if (insertError.code === "P0001") {
        setError(insertError.message); // our own rules, written in plain words
      } else {
        setError("We could not send your request. Please try again.");
      }
      return;
    }

    setSent(true);
  };

  return (
    <div className="detail-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="detail-dialog" role="dialog" aria-modal="true" aria-labelledby="detail-title">
        <button ref={closeRef} type="button" className="detail-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div className="detail-photo">
          <img src={item.photo_url} alt={item.name} />
        </div>

        <div className="detail-body">
          <div className="detail-top">
            <h2 id="detail-title">{item.name}</h2>
            <span className={`detail-fee ${item.fee_per_day === 0 ? "detail-fee--free" : ""}`}>
              {formatFee(item.fee_per_day)}
            </span>
          </div>

          <p className="detail-owner">Lent by {shortName(item.owner?.full_name)}</p>
          {item.description && <p className="detail-description">{item.description}</p>}

          <ul className="detail-facts">
            <li><span>Category</span><strong>{item.category}</strong></li>
            <li><span>Condition</span><strong>{item.condition}</strong></li>
            <li><span>Pickup</span><strong>{item.pickup_spot}</strong></li>
            <li><span>Longest loan</span><strong>{item.max_days} {item.max_days === 1 ? "day" : "days"}</strong></li>
          </ul>

          {sent ? (
            <div className="detail-sent" role="status">
              <strong>Request sent!</strong>
              <p>
                {shortName(item.owner?.full_name)} will accept or decline it. Follow it on
                your Requests page.
              </p>
              <div className="detail-actions">
                <Link to="/requests" className="detail-btn detail-btn--primary">View my requests</Link>
                <button type="button" className="detail-btn detail-btn--plain" onClick={onClose}>
                  Keep browsing
                </button>
              </div>
            </div>
          ) : isOwner ? (
            <p className="detail-note">This is your item, so you cannot request it.</p>
          ) : (
            <form onSubmit={handleRequest} noValidate>
              <div className="detail-dates">
                <label>
                  <span>Pick up</span>
                  <input type="date" min={todayText} value={start} onChange={(e) => handleStartChange(e.target.value)} />
                </label>
                <label>
                  <span>Return by</span>
                  <input type="date" min={start || todayText} value={end} onChange={(e) => setEnd(e.target.value)} />
                </label>
              </div>

              <label className="detail-message">
                <span>Message to the owner <em>(optional)</em></span>
                <textarea
                  rows={2}
                  maxLength={200}
                  placeholder="e.g. I can pick it up around 3 PM"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </label>

              <div className="detail-total">
                <span>
                  {item.fee_per_day > 0
                    ? `₱${item.fee_per_day}/day × ${loanDays} ${loanDays === 1 ? "day" : "days"}`
                    : "No fee"}
                  <small>
                    {start && end ? `${formatDay(start)} to ${formatDay(end)}` : ""}
                  </small>
                </span>
                <strong>{item.fee_per_day > 0 ? `₱${total}` : "Free"}</strong>
              </div>

              {error && <p className="detail-error" role="alert">{error}</p>}

              <button type="submit" className="detail-btn detail-btn--primary detail-btn--full" disabled={busy}>
                {busy ? "Sending..." : "Request to borrow"}
              </button>
              <p className="detail-hint">
                {item.fee_per_day > 0
                  ? "The owner confirms first. You pay the fee in cash at pickup."
                  : "The owner confirms first."}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
