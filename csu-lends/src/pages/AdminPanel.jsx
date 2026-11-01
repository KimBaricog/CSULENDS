import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import AppHeader from "../components/AppHeader";
import AdminOverview from "../components/AdminOverview";
import AdminReview from "../components/AdminReview";
import AdminUsers from "../components/AdminUsers";
import AdminIssues from "../components/AdminIssues";
import { buildChecks, countIssues } from "../lib/adminChecks";
import "./style/adminpanel.css";
import "../components/style/admindashboard.css";

const REFRESH_MS = 30000;

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "review", label: "Review" },
  { key: "users", label: "Users" },
  { key: "issues", label: "Issues" },
];

export default function AdminPanel() {
  const [section, setSection] = useState("overview");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const loadStats = useCallback(async () => {
    const { data, error: rpcError } = await supabase.rpc("admin_dashboard");
    if (rpcError) {
      console.error("Could not load the dashboard:", rpcError);
      setError(
        rpcError.code === "PGRST202"
          ? "The dashboard is not set up yet. Run csulends_admin_dashboard.sql in the Supabase SQL Editor."
          : "Could not load the dashboard numbers. Check that you are an admin.",
      );
    } else {
      setStats(data);
      setError("");
      setUpdatedAt(new Date());
    }
    setLoading(false);
  }, []);

  // Load once, then refresh every 30 seconds while the page is open and visible.
  useEffect(() => {
    loadStats();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") loadStats();
    }, REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadStats]);

  const checks = useMemo(() => buildChecks(stats), [stats]);
  const issueCount = countIssues(checks);
  const hasProblem = checks.some((check) => check.level === "problem");

  const badgeFor = (key) => {
    if (!stats) return null;
    if (key === "review" && stats.items.pending > 0)
      return { value: stats.items.pending, tone: "" };
    if (key === "issues" && issueCount > 0)
      return { value: issueCount, tone: hasProblem ? "problem" : "warn" };
    return null;
  };

  return (
    <div className="admin-page">
      <AppHeader showSearch={false} />

      <main className="admin-main admin-main--wide">
        <header className="admin-heading admin-heading--row">
          <div>
            <h1>Admin</h1>
            <p>Watch how CSULends is doing and review new items.</p>
          </div>
          <div className="admin-refresh">
            {updatedAt && (
              <span>
                Updated{" "}
                {updatedAt.toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </span>
            )}
            <button type="button" onClick={loadStats}>
              Refresh
            </button>
          </div>
        </header>

        <nav className="admin-nav" role="tablist" aria-label="Admin sections">
          {SECTIONS.map((s) => {
            const badge = badgeFor(s.key);
            return (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={section === s.key}
                className={section === s.key ? "is-on" : ""}
                onClick={() => setSection(s.key)}
              >
                {s.label}
                {badge && (
                  <span
                    className={`admin-badge ${badge.tone ? `admin-badge--${badge.tone}` : ""}`}
                  >
                    {badge.value}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {error && (
          <p className="admin-state admin-state--error" role="alert">
            {error}
          </p>
        )}

        {section === "overview" && (
          <>
            {loading && <p className="admin-state">Loading...</p>}
            {stats && (
              <AdminOverview
                stats={stats}
                issueCount={issueCount}
                onGoReview={() => setSection("review")}
                onGoIssues={() => setSection("issues")}
              />
            )}
          </>
        )}

        {section === "review" && <AdminReview onChanged={loadStats} />}
        {section === "users" && <AdminUsers />}
        {section === "issues" &&
          (stats ? (
            <AdminIssues checks={checks} onErrorsChanged={loadStats} />
          ) : (
            !error && <p className="admin-state">Loading...</p>
          ))}
      </main>
    </div>
  );
}
