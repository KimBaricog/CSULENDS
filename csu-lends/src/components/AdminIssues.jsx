import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { timeAgo } from "../lib/timeAgo";

const LEVEL_TEXT = { ok: "OK", warning: "Check", problem: "Fix" };

// Health checks (worked out from the dashboard numbers) and the log of app errors.
export default function AdminIssues({ checks, onErrorsChanged }) {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [openId, setOpenId] = useState(null);

  const loadErrors = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("error_logs")
      .select("id, message, source, details, user_agent, created_at, user:profiles!user_id(full_name)")
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) {
      console.error("Could not load errors:", error);
      setLoadError("Could not load the error log. Make sure csulends_admin_dashboard.sql has been run.");
    } else {
      setLoadError("");
      setErrors(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadErrors();
  }, [loadErrors]);

  const clearAll = async () => {
    if (!window.confirm("Delete every entry in the error log?")) return;
    const { error } = await supabase.from("error_logs").delete().gt("id", 0);
    if (error) {
      setLoadError("Could not clear the log.");
      return;
    }
    setErrors([]);
    onErrorsChanged();
  };

  return (
    <div className="adminissues">
      <h2 className="adminsection-title">Health checks</h2>
      <ul className="adminchecks">
        {checks.map((check) => (
          <li key={check.id} className={`admincheck admincheck--${check.level}`}>
            <span className="admincheck-pill">{LEVEL_TEXT[check.level]}</span>
            <div>
              <strong>{check.title}</strong>
              <p>{check.detail}</p>
              {check.fix && check.level !== "ok" && <p className="admincheck-fix">What to do: {check.fix}</p>}
            </div>
          </li>
        ))}
      </ul>

      <div className="adminerrors-head">
        <h2 className="adminsection-title">Error log</h2>
        <div>
          <button type="button" onClick={loadErrors}>Refresh</button>
          {errors.length > 0 && <button type="button" className="adminerrors-clear" onClick={clearAll}>Clear all</button>}
        </div>
      </div>
      <p className="adminerrors-note">
        Errors that happen in students' browsers are reported here automatically. Entries older than 30 days are deleted.
      </p>

      {loading && <p className="admin-state">Loading...</p>}
      {loadError && <p className="admin-state admin-state--error" role="alert">{loadError}</p>}
      {!loading && !loadError && errors.length === 0 && <p className="admin-state">No errors reported. 🎉</p>}

      <ul className="adminerrors">
        {errors.map((entry) => (
          <li key={entry.id} className="adminerror">
            <button
              type="button"
              className="adminerror-head"
              aria-expanded={openId === entry.id}
              onClick={() => setOpenId(openId === entry.id ? null : entry.id)}
            >
              <span className="adminerror-message">{entry.message}</span>
              <span className="adminerror-meta">
                {entry.source} · {entry.user?.full_name || "Unknown student"} · {timeAgo(entry.created_at)}
              </span>
            </button>
            {openId === entry.id && (
              <div className="adminerror-body">
                {entry.details && <pre>{entry.details}</pre>}
                {entry.user_agent && <p>{entry.user_agent}</p>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
