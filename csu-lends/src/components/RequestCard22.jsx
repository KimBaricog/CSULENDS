import { useState } from "react";
import { formatFee } from "../lib/itemOptions";
import "./style/requestcard.css";

const STATUS = {
  pending: { text: "Waiting for reply", className: "reqcard-pill--pending" },
  accepted: { text: "Accepted", className: "reqcard-pill--accepted" },
  declined: { text: "Declined", className: "reqcard-pill--ended" },
  cancelled: { text: "Cancelled", className: "reqcard-pill--ended" },
  returned: { text: "Returned", className: "reqcard-pill--ended" },
};

const formatDay = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

// One request. mode is "borrowing" (I asked for someone's item) or "lending" (someone asked for mine).
// onChangeStatus(request, newStatus) returns null on success, or an error message.
export default function RequestCard({ request, mode, onChangeStatus }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const item = request.item;
  const status = STATUS[request.status] || STATUS.pending;
  const lending = mode === "lending";

  const otherPerson = lending ? request.borrower : item?.owner;
  const otherName = otherPerson?.full_name || "A classmate";

  const change = async (newStatus, question) => {
    if (question && !window.confirm(question)) return;
    setBusy(true);
    setError("");
    const message = await onChangeStatus(request, newStatus);
    if (message) setError(message);
    setBusy(false);
  };

  return (
    <article className="reqcard">
      {item?.photo_url ? (
        <img src={item.photo_url} alt="" className="reqcard-photo" />
      ) : (
        <div
          className="reqcard-photo reqcard-photo--empty"
          aria-hidden="true"
        />
      )}

      <div className="reqcard-body">
        <div className="reqcard-top">
          <h2>{item?.name || "Item no longer available"}</h2>
          <span className={`reqcard-pill ${status.className}`}>
            {lending && request.status === "pending"
              ? "New request"
              : status.text}
          </span>
        </div>

        <p className="reqcard-person">
          {lending ? "Requested by" : "Owner:"} <strong>{otherName}</strong>
          {lending && otherPerson?.program ? ` · ${otherPerson.program}` : ""}
        </p>

        <p className="reqcard-dates">
          {formatDay(request.start_date)} to {formatDay(request.end_date)}
          <span>
            {request.total_fee > 0 ? `₱${request.total_fee} total` : "Free"}
            {item &&
              request.total_fee > 0 &&
              ` (${formatFee(item.fee_per_day)})`}
          </span>
        </p>

        {request.message && (
          <p className="reqcard-message">“{request.message}”</p>
        )}

        {request.status === "accepted" && item && (
          <p className="reqcard-info">
            {lending
              ? `Meet at ${item.pickup_spot}. ${request.total_fee > 0 ? `Collect ₱${request.total_fee} in cash.` : ""}`
              : `Meet ${otherName} at ${item.pickup_spot}. ${request.total_fee > 0 ? `Pay ₱${request.total_fee} in cash.` : ""}`}
          </p>
        )}

        {error && (
          <p className="reqcard-error" role="alert">
            {error}
          </p>
        )}

        <div className="reqcard-actions">
          {!lending && request.status === "pending" && (
            <button
              type="button"
              className="reqcard-btn reqcard-btn--plain"
              disabled={busy}
              onClick={() => change("cancelled", "Cancel this request?")}
            >
              Cancel request
            </button>
          )}

          {lending && request.status === "pending" && (
            <>
              <button
                type="button"
                className="reqcard-btn reqcard-btn--primary"
                disabled={busy}
                onClick={() => change("accepted")}
              >
                {busy ? "Saving..." : "Accept"}
              </button>
              <button
                type="button"
                className="reqcard-btn reqcard-btn--danger"
                disabled={busy}
                onClick={() => change("declined", "Decline this request?")}
              >
                Decline
              </button>
            </>
          )}

          {lending && request.status === "accepted" && (
            <button
              type="button"
              className="reqcard-btn reqcard-btn--primary"
              disabled={busy}
              onClick={() => change("returned", "Mark this item as returned?")}
            >
              {busy ? "Saving..." : "Mark as returned"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
