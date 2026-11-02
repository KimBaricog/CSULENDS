import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { StarInput } from "./StarRating";
import "./style/ratingmodal.css";

const HINTS = { 1: "Poor", 2: "Not great", 3: "Okay", 4: "Good", 5: "Excellent" };

// Popup for rating the other person in a finished loan.
// existing: the rating already given (so it can be changed), or null.
export default function RatingModal({ request, otherName, role, existing, onClose, onSaved }) {
  const [rating, setRating] = useState(existing?.rating || 0);
  const [comment, setComment] = useState(existing?.comment || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const firstRef = useRef(null);

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstRef.current?.querySelector("button")?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!rating) return setError("Choose a rating from 1 to 5 stars.");
    setBusy(true);
    setError("");

    const cleanComment = comment.trim() || null;
    const query = existing
      ? supabase.from("reviews").update({ rating, comment: cleanComment }).eq("id", existing.id)
      : supabase.from("reviews").insert({ request_id: request.id, rating, comment: cleanComment });

    const { data, error: saveError } = await query.select("id, request_id, rating, comment").maybeSingle();
    setBusy(false);

    if (saveError) {
      if (saveError.code === "23505") setError("You already rated this loan.");
      else if (saveError.code === "P0001") setError(saveError.message);
      else setError("We could not save your rating. Please try again.");
      return;
    }
    if (!data) return setError("We could not save your rating. Please try again.");

    onSaved(data);
  };

  return (
    <div className="rate-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="rate-dialog" role="dialog" aria-modal="true" aria-labelledby="rate-title" onSubmit={handleSubmit}>
        <h2 id="rate-title">{existing ? "Change your rating" : `Rate ${otherName}`}</h2>
        <p className="rate-sub">
          {role === "lender"
            ? `How was borrowing "${request.item?.name || "the item"}" from ${otherName}?`
            : `How was lending "${request.item?.name || "the item"}" to ${otherName}?`}
        </p>

        <div ref={firstRef}>
          <StarInput value={rating} onChange={setRating} />
        </div>
        <p className="rate-hint" aria-live="polite">{rating ? HINTS[rating] : "Tap a star"}</p>

        <label className="rate-comment">
          <span>Comment <em>(optional)</em></span>
          <textarea
            rows={3}
            maxLength={300}
            placeholder={role === "lender" ? "Was the item as described? Easy to meet?" : "Did they return it on time and in good condition?"}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </label>
        <p className="rate-note">Your name is shown with your rating. Be honest and kind.</p>

        {error && <p className="rate-error" role="alert">{error}</p>}

        <div className="rate-actions">
          <button type="submit" className="rate-btn rate-btn--primary" disabled={busy}>
            {busy ? "Saving..." : existing ? "Save changes" : "Submit rating"}
          </button>
          <button type="button" className="rate-btn rate-btn--plain" onClick={onClose} disabled={busy}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
