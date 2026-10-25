import { useState } from "react";
import { formatFee, ITEM_STATUS } from "../lib/itemOptions";
import "./style/adminitemcard.css";

const QUICK_REASONS = [
  "The photo is unclear",
  "This is not an appropriate item",
  "Please add more details",
  "The fee is too high",
];

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// One item waiting for (or already through) review.
// onApprove(item) and onReject(item, reason) return null on success, or an error message.
export default function AdminItemCard({ item, onApprove, onReject }) {
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const owner = item.owner?.full_name || "Unknown student";
  const program = item.owner?.program;

  const handleApprove = async () => {
    setBusy(true);
    setError("");
    const message = await onApprove(item);
    if (message) {
      setError(message);
      setBusy(false);
    }
  };

  const handleReject = async () => {
    const cleanReason = reason.trim();
    if (cleanReason.length < 3) {
      setError("Write a short reason so the student knows what to fix.");
      return;
    }
    setBusy(true);
    setError("");
    const message = await onReject(item, cleanReason);
    if (message) {
      setError(message);
      setBusy(false);
    }
  };

  return (
    <article className="admincard">
      <a
        href={item.photo_url}
        target="_blank"
        rel="noopener noreferrer"
        className="admincard-photo"
      >
        <img src={item.photo_url} alt={`Photo of ${item.name}`} />
        <span>View full photo</span>
      </a>

      <div className="admincard-body">
        <div className="admincard-top">
          <h2>{item.name}</h2>
          <span className="admincard-fee">{formatFee(item.fee_per_day)}</span>
        </div>

        <p className="admincard-owner">
          {owner}
          {program ? ` · ${program}` : ""} · Submitted{" "}
          {formatDate(item.created_at)}
        </p>

        <ul className="admincard-facts">
          <li>{item.category}</li>
          <li>Condition: {item.condition}</li>
          <li>Pickup: {item.pickup_spot}</li>
          <li>
            Up to {item.max_days} {item.max_days === 1 ? "day" : "days"}
          </li>
        </ul>

        {item.description && (
          <p className="admincard-description">{item.description}</p>
        )}

        {item.status === ITEM_STATUS.REJECTED && item.rejection_reason && (
          <p className="admincard-reason">Rejected: {item.rejection_reason}</p>
        )}

        {error && (
          <p className="admincard-error" role="alert">
            {error}
          </p>
        )}

        {rejecting ? (
          <div className="admincard-reject">
            <label htmlFor={`reason-${item.id}`}>
              Reason (the student will see this)
            </label>
            <textarea
              id={`reason-${item.id}`}
              rows={2}
              maxLength={200}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tell the student what to fix"
            />
            <div className="admincard-quick">
              {QUICK_REASONS.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => setReason(text)}
                >
                  {text}
                </button>
              ))}
            </div>
            <div className="admincard-actions">
              <button
                type="button"
                className="admincard-btn admincard-btn--reject"
                onClick={handleReject}
                disabled={busy}
              >
                {busy ? "Saving..." : "Confirm"}
              </button>
              <button
                type="button"
                className="admincard-btn admincard-btn--plain"
                onClick={() => {
                  setRejecting(false);
                  setError("");
                }}
                disabled={busy}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="admincard-actions">
            {item.status !== ITEM_STATUS.APPROVED && (
              <button
                type="button"
                className="admincard-btn admincard-btn--approve"
                onClick={handleApprove}
                disabled={busy}
              >
                {busy ? "Saving..." : "Approve"}
              </button>
            )}
            {item.status !== ITEM_STATUS.REJECTED && (
              <button
                type="button"
                className="admincard-btn admincard-btn--reject"
                onClick={() => setRejecting(true)}
                disabled={busy}
              >
                {item.status === ITEM_STATUS.APPROVED ? "Take down" : "Reject"}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
