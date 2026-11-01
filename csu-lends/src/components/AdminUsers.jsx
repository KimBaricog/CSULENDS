import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { isOnline, timeAgo } from "../lib/timeAgo";

// Everyone who signed up. Only admins can load this (the database checks it).
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    supabase.rpc("admin_users").then(({ data, error: fetchError }) => {
      if (!active) return;
      if (fetchError) {
        console.error("Could not load users:", fetchError);
        setError("Could not load the user list. Make sure csulends_admin_dashboard.sql has been run.");
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const words = search.trim().toLowerCase();
    if (!words) return users;
    return users.filter((u) => `${u.full_name || ""} ${u.email || ""} ${u.program || ""}`.toLowerCase().includes(words));
  }, [users, search]);

  const statusOf = (u) => {
    if (!u.email_confirmed) return { text: "Not confirmed", className: "adminusers-pill--warn" };
    if (isOnline(u.last_seen_at)) return { text: "Online", className: "adminusers-pill--live" };
    return { text: "Offline", className: "adminusers-pill--off" };
  };

  return (
    <section className="adminusers">
      <div className="adminusers-bar">
        <input
          type="search"
          placeholder="Search by name, email, or program"
          aria-label="Search students"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span>{loading ? "Loading..." : `${filtered.length} of ${users.length} students`}</span>
      </div>

      {error && <p className="admin-state admin-state--error" role="alert">{error}</p>}

      {!loading && !error && (
        <div className="adminusers-wrap">
          <table className="adminusers-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const status = statusOf(u);
                return (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.full_name || "No profile"}</strong>
                      {u.is_admin && <span className="adminusers-badge">Admin</span>}
                      <small>{u.email}</small>
                      {u.program && <small>{u.program}</small>}
                    </td>
                    <td><span className={`adminusers-pill ${status.className}`}>{status.text}</span></td>
                    <td>{timeAgo(u.created_at)}</td>
                    <td>{timeAgo(u.last_seen_at || u.last_sign_in_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="admin-state">No students match your search.</p>}
        </div>
      )}
    </section>
  );
}
