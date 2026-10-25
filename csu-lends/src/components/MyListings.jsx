import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useSession from "../hooks/useSession";
import { formatFee, ITEM_STATUS } from "../lib/itemOptions";
import "./style/mylistings.css";

const STATUS_LABELS = {
  [ITEM_STATUS.PENDING]: {
    text: "Waiting for review",
    className: "listings-pill--pending",
  },
  [ITEM_STATUS.APPROVED]: {
    text: "Live on Browse",
    className: "listings-pill--approved",
  },
  [ITEM_STATUS.REJECTED]: {
    text: "Not approved",
    className: "listings-pill--rejected",
  },
};

// The student's own items and where each one is in the review.
// Change refreshKey to make it reload (the Lend page does this after a submit).
export default function MyListings({ refreshKey = 0 }) {
  const { session } = useSession();
  const userId = session?.user?.id;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return undefined;
    let active = true;
    setLoading(true);

    supabase
      .from("items")
      .select(
        "id, name, fee_per_day, photo_url, status, rejection_reason, created_at",
      )
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (!active) return;
        if (fetchError) setError("Could not load your listings.");
        else {
          setError("");
          setItems(data || []);
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId, refreshKey]);

  return (
    <section className="listings" aria-label="Your listings">
      <h2>Your listings</h2>

      {loading && <p className="listings-note">Loading...</p>}
      {error && <p className="listings-note listings-note--error">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="listings-note">You have not listed anything yet.</p>
      )}

      <ul className="listings-list">
        {items.map((item) => {
          const label =
            STATUS_LABELS[item.status] || STATUS_LABELS[ITEM_STATUS.PENDING];
          return (
            <li key={item.id} className="listings-item">
              <img src={item.photo_url} alt="" className="listings-thumb" />
              <div className="listings-info">
                <strong>{item.name}</strong>
                <span className="listings-fee">
                  {formatFee(item.fee_per_day)}
                </span>
                <span className={`listings-pill ${label.className}`}>
                  {label.text}
                </span>
                {item.status === ITEM_STATUS.REJECTED &&
                  item.rejection_reason && (
                    <p className="listings-reason">
                      Reason: {item.rejection_reason}
                    </p>
                  )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
