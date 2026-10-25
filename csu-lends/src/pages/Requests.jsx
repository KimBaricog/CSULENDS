import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import useSession from "../hooks/useSession";
import AppHeader from "../components/AppHeader";
import RequestCard from "../components/RequestCard";
import "./style/requests.css";

const TABS = [
  { key: "borrowing", label: "Borrowing" },
  { key: "lending", label: "Lending" },
];

const BASE_COLUMNS =
  "id, item_id, borrower_id, start_date, end_date, total_fee, status, message, created_at";

export default function Requests() {
  const { session } = useSession();
  const userId = session?.user?.id;

  const [tab, setTab] = useState("borrowing");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!userId) return undefined;
    let active = true;
    setLoading(true);
    setError("");

    const itemFields = "name, photo_url, pickup_spot, fee_per_day, owner_id, owner:profiles!owner_id(full_name)";

    // Borrowing: requests I made. Lending: requests on items I own.
    const query =
      tab === "borrowing"
        ? supabase
            .from("borrow_requests")
            .select(`${BASE_COLUMNS}, item:items(${itemFields})`)
            .eq("borrower_id", userId)
        : supabase
            .from("borrow_requests")
            .select(`${BASE_COLUMNS}, item:items!inner(${itemFields}), borrower:profiles!borrower_id(full_name, program)`)
            .eq("item.owner_id", userId);

    query
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error: fetchError }) => {
        if (!active) return;
        if (fetchError) {
          setError("Could not load your requests. Please refresh the page.");
          setRequests([]);
        } else {
          setRequests(data || []);
        }
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [tab, userId]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Returns null on success, or a message to show on the card.
  const changeStatus = async (request, newStatus) => {
    const { data, error: updateError } = await supabase
      .from("borrow_requests")
      .update({ status: newStatus })
      .eq("id", request.id)
      .select("id, status");

    if (updateError) {
      // 23P01 = the dates clash with another accepted loan of the same item.
      if (updateError.code === "23P01") return "These dates overlap with another accepted request for this item.";
      return updateError.message?.includes("not allowed")
        ? "This request has already changed. Refresh the page."
        : "Could not save. Please try again.";
    }
    if (!data || data.length === 0) return "Could not save. Please refresh the page.";

    setRequests((current) => current.map((r) => (r.id === request.id ? { ...r, status: newStatus } : r)));
    const messages = {
      accepted: "Request accepted. Meet at the pickup spot.",
      declined: "Request declined.",
      cancelled: "Request cancelled.",
      returned: "Marked as returned.",
    };
    setNotice(messages[newStatus] || "Saved.");
    return null;
  };

  // Open requests first, then finished ones.
  const sorted = useMemo(() => {
    const rank = { pending: 0, accepted: 1, returned: 2, declined: 3, cancelled: 3 };
    return [...requests].sort((a, b) => (rank[a.status] ?? 9) - (rank[b.status] ?? 9));
  }, [requests]);

  const waitingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="requests-page">
      <AppHeader showSearch={false} />

      <main className="requests-main">
        <h1>My requests</h1>
        <p className="requests-sub">Track what you are borrowing and what classmates ask to borrow from you.</p>

        <div className="requests-tabs" role="tablist" aria-label="Request type">
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
            </button>
          ))}
        </div>

        <p className="requests-notice" role="status" aria-live="polite">{notice}</p>

        {!loading && !error && waitingCount > 0 && (
          <p className="requests-summary">
            {tab === "lending"
              ? `${waitingCount} ${waitingCount === 1 ? "request needs" : "requests need"} your reply.`
              : `${waitingCount} ${waitingCount === 1 ? "request is" : "requests are"} waiting for a reply.`}
          </p>
        )}

        {loading && <p className="requests-state">Loading...</p>}
        {error && <p className="requests-state requests-state--error" role="alert">{error}</p>}

        {!loading && !error && requests.length === 0 && (
          <div className="requests-state">
            {tab === "borrowing" ? (
              <>
                <h2>You have not asked to borrow anything yet</h2>
                <p>Find something you need and send a request.</p>
                <Link to="/browse" className="requests-action">Browse items</Link>
              </>
            ) : (
              <>
                <h2>No one has asked to borrow your items yet</h2>
                <p>Requests on your approved items show up here.</p>
                <Link to="/lend" className="requests-action">+ Lend an item</Link>
              </>
            )}
          </div>
        )}

        <div className="requests-list">
          {sorted.map((request) => (
            <RequestCard key={request.id} request={request} mode={tab} onChangeStatus={changeStatus} />
          ))}
        </div>
      </main>
    </div>
  );
}
