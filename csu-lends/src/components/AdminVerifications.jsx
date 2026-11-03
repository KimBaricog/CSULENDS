import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { timeAgo } from "../lib/timeAgo";
import "./style/adminverify.css";

const BUCKET = "verification-docs";

const TABS = [
  { key: "pending", label: "Waiting" },
  { key: "approved", label: "Verified" },
  { key: "rejected", label: "Not accepted" },
];

const EMPTY_TEXT = {
  pending: "No one is waiting to be verified.",
  approved: "No verified students yet.",
  rejected: "No rejected requests.",
};

const QUICK_REASONS = [
  "The photo is blurry or cut off",
  "The name does not match the account",
  "This is not a Caraga State University document",
  "The ID is expired or unreadable",
];

function VerifyCard({ row, onApprove, onReject }) {
  const [idUrl, setIdUrl] = useState("");
  const [scheduleUrl, setScheduleUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  // The photos are private. Each one gets a link that stops working after 10 minutes.
  useEffect(() => {
    let active = true;
    const load = async (path, setter) => {
      if (!path) return;
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, 600);
      if (active && data?.signedUrl) setter(data.signedUrl);
    };
    load(row.id_path, setIdUrl);
    load(row.schedule_path, setScheduleUrl);
    return () => {
      active = false;
    };
  }, [row.id_path, row.schedule_path]);

  const run = async (task) => {
    setBusy(true);
    setError("");
    const message = await task();
    if (message) {
      setError(message);
      setBusy(false);
    }
  };

  const hasPhotos = Boolean(row.id_path || row.schedule_path);

  return (
    <article className="adminverify-card">
      <div className="adminverify-top">
        <div>
          <h2>{row.full_name || "No name"}</h2>
          <p>
            {row.email}
            {row.program ? ` · ${row.program}` : ""}
          </p>
        </div>
        <span className="adminverify-time">Sent {timeAgo(row.created_at)}</span>
      </div>

      {hasPhotos ? (
        <>
          <div className="adminverify-photos">
            {row.id_path && (
              <figure>
                <a href={idUrl || undefined} target="_blank" rel="noopener noreferrer">
                  {idUrl ? <img src={idUrl} alt={`School ID of ${row.full_name}`} /> : <span>Loading...</span>}
                </a>
                <figcaption>School ID (tap to enlarge)</figcaption>
              </figure>
            )}
            {row.schedule_path && (
              <figure>
                <a href={scheduleUrl || undefined} target="_blank" rel="noopener noreferrer">
                  {scheduleUrl ? <img src={scheduleUrl} alt={`Class schedule of ${row.full_name}`} /> : <span>Loading...</span>}
                </a>
                <figcaption>Class schedule (tap to enlarge)</figcaption>
              </figure>
            )}
          </div>

          <ul className="adminverify-checks">
            <li>The name matches <strong>{row.full_name}</strong></li>
            <li>It shows Caraga State University</li>
            <li>The photo is clear, and the ID is not expired</li>
          </ul>
        </>
      ) : (
        <p className="adminverify-deleted">The photos were deleted after the review.</p>
      )}

      {row.status === "rejected" && row.rejection_reason && (
        <p className="adminverify-reason">Reason: {row.rejection_reason}</p>
      )}

      {error && <p className="adminverify-error" role="alert">{error}</p>}

      {rejecting ? (
        <div className="adminverify-reject">
          <label htmlFor={`vr-${row.id}`}>Reason (the student will see this)</label>
          <textarea
            id={`vr-${row.id}`}
            rows={2}
            maxLength={200}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Tell the student what to fix"
          />
          <div className="adminverify-quick">
            {QUICK_REASONS.map((text) => (
              <button key={text} type="button" onClick={() => setReason(text)}>{text}</button>
            ))}
          </div>
          <div className="adminverify-actions">
            <button
              type="button"
              className="adminverify-btn adminverify-btn--reject"
              disabled={busy}
              onClick={() => {
                if (reason.trim().length < 3) return setError("Write a short reason first.");
                run(() => onReject(row, reason.trim()));
              }}
            >
              {busy ? "Saving..." : "Confirm"}
            </button>
            <button
              type="button"
              className="adminverify-btn adminverify-btn--plain"
              disabled={busy}
              onClick={() => { setRejecting(false); setError(""); }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="adminverify-actions">
          {row.status !== "approved" && (
            <button type="button" className="adminverify-btn adminverify-btn--approve" disabled={busy} onClick={() => run(() => onApprove(row))}>
              {busy ? "Saving..." : "Approve and give badge"}
            </button>
          )}
          {row.status !== "rejected" && (
            <button type="button" className="adminverify-btn adminverify-btn--reject" disabled={busy} onClick={() => setRejecting(true)}>
              {row.status === "approved" ? "Remove badge" : "Reject"}
            </button>
          )}
        </div>
      )}
    </article>
  );
}

// Review the school ID / schedule photos students send, and give or take away the badge.
export default function AdminVerifications({ onChanged }) {
  const [tab, setTab] = useState("pending");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_verifications", { p_status: tab });
    if (error) {
      console.error("Could not load verifications:", error);
      setLoadError(
        error.code === "PGRST202"
          ? "Verification is not set up yet. Run csulends_verification.sql in the Supabase SQL Editor."
          : "Could not load the requests. Check that you are an admin."
      );
      setRows([]);
    } else {
      setLoadError("");
      setRows(data || []);
    }
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Saves the decision, then deletes the private photos. Returns null, or a message for the card.
  const decide = async (row, decision, reason) => {
    const { error } = await supabase.rpc("review_verification", {
      p_id: row.id,
      p_decision: decision,
      p_reason: reason || null,
    });
    if (error) return error.code === "P0001" ? error.message : "Could not save. Please try again.";

    let photosDeleted = true;
    const paths = [row.id_path, row.schedule_path].filter(Boolean);
    if (paths.length) {
      const { error: removeError } = await supabase.storage.from(BUCKET).remove(paths);
      if (removeError) photosDeleted = false;
      else await supabase.rpc("clear_verification_files", { p_id: row.id });
    }

    setRows((current) => current.filter((entry) => entry.id !== row.id));
    const name = row.full_name || "The student";
    const base =
      decision === "approved"
        ? `${name} is now verified.`
        : row.status === "approved"
        ? `${name}'s badge was removed.`
        : `${name}'s request was not accepted.`;
    setNotice(photosDeleted ? `${base} Photos deleted.` : `${base} The photos could not be deleted. Remove them in Supabase under Storage > verification-docs.`);
    onChanged();
    return null;
  };

  return (
    <section>
      <p className="adminverify-intro">
        Students send a photo of their school ID or class schedule. Check it, then approve or reject. The photos are
        deleted as soon as you decide.
      </p>

      <div className="admin-tabs" role="tablist" aria-label="Verification status">
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

      <p className="admin-notice" role="status" aria-live="polite">{notice}</p>

      {loading && <p className="admin-state">Loading...</p>}
      {loadError && <p className="admin-state admin-state--error" role="alert">{loadError}</p>}
      {!loading && !loadError && rows.length === 0 && <p className="admin-state">{EMPTY_TEXT[tab]}</p>}

      <div className="admin-list">
        {rows.map((row) => (
          <VerifyCard
            key={row.id}
            row={row}
            onApprove={(r) => decide(r, "approved")}
            onReject={(r, reason) => decide(r, "rejected", reason)}
          />
        ))}
      </div>
    </section>
  );
}
