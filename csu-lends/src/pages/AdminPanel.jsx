import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useSession from "../hooks/useSession";
import AppHeader from "../components/AppHeader";
import AdminItemCard from "../components/AdminItemCard";
import { ITEM_STATUS } from "../lib/itemOptions";
import "./style/adminpanel.css";

const PAGE_SIZE = 50;

const TABS = [
  { key: ITEM_STATUS.PENDING, label: "Pending" },
  { key: ITEM_STATUS.APPROVED, label: "Approved" },
  { key: ITEM_STATUS.REJECTED, label: "Rejected" },
];

const EMPTY_TEXT = {
  [ITEM_STATUS.PENDING]: "Nothing is waiting for review. Nice work!",
  [ITEM_STATUS.APPROVED]: "No approved items yet.",
  [ITEM_STATUS.REJECTED]: "No rejected items.",
};

const ITEM_COLUMNS =
  "id, name, description, category, condition, pickup_spot, max_days, fee_per_day, " +
  "photo_url, status, rejection_reason, created_at, owner:profiles!owner_id(full_name, program)";

export default function AdminPanel() {
  const { session } = useSession();
  const adminId = session?.user?.id;

  const [tab, setTab] = useState(ITEM_STATUS.PENDING);
  const [items, setItems] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCounts = useCallback(async () => {
    const results = await Promise.all(
      TABS.map((t) =>
        supabase
          .from("items")
          .select("id", { count: "exact", head: true })
          .eq("status", t.key),
      ),
    );
    const next = {};
    TABS.forEach((t, index) => {
      next[t.key] = results[index].count ?? 0;
    });
    setCounts(next);
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");

    supabase
      .from("items")
      .select(ITEM_COLUMNS)
      .eq("status", tab)
      // Pending: oldest first, so nobody waits forever. The other tabs: newest first.
      .order("created_at", { ascending: tab === ITEM_STATUS.PENDING })
      .limit(PAGE_SIZE)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setLoadError(
            "Could not load items. Check that you are an admin and try again.",
          );
          setItems([]);
        } else {
          setItems(data || []);
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tab]);

  // Clear the confirmation message after a few seconds.
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Saves a review. Returns null on success, or a message to show on the card.
  const saveReview = async (item, changes, doneMessage) => {
    const { data, error } = await supabase
      .from("items")
      .update({
        ...changes,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", item.id)
      .select("id");

    if (error) return "Could not save. Please try again.";
    // The database rules silently skip rows a non-admin may not change.
    if (!data || data.length === 0)
      return "You do not have permission to review items.";

    setItems((current) => current.filter((entry) => entry.id !== item.id));
    setNotice(doneMessage);
    loadCounts();
    return null;
  };

  const handleApprove = (item) =>
    saveReview(
      item,
      { status: ITEM_STATUS.APPROVED, rejection_reason: null },
      `"${item.name}" is now live on Browse.`,
    );

  const handleReject = (item, reason) =>
    saveReview(
      item,
      { status: ITEM_STATUS.REJECTED, rejection_reason: reason },
      `"${item.name}" was not approved.`,
    );

  return (
    <div className="admin-page">
      <AppHeader showSearch={false} />

      <main className="admin-main">
        <header className="admin-heading">
          <h1>Review items</h1>
          <p>Check each item before it appears on Browse.</p>
        </header>

        <div className="admin-tabs" role="tablist" aria-label="Item status">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={tab === t.key ? "is-on" : ""}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {counts[t.key] !== undefined && (
                <span className="admin-count">{counts[t.key]}</span>
              )}
            </button>
          ))}
        </div>

        <p className="admin-notice" role="status" aria-live="polite">
          {notice}
        </p>

        {loading && <p className="admin-state">Loading...</p>}
        {loadError && (
          <p className="admin-state admin-state--error" role="alert">
            {loadError}
          </p>
        )}
        {!loading && !loadError && items.length === 0 && (
          <p className="admin-state">{EMPTY_TEXT[tab]}</p>
        )}

        <div className="admin-list">
          {items.map((item) => (
            <AdminItemCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>

        {!loading && counts[tab] > PAGE_SIZE && (
          <p className="admin-state">
            Showing the first {PAGE_SIZE} items. Review these to see more.
          </p>
        )}
      </main>
    </div>
  );
}
