import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import useSession from "../hooks/useSession";
import "./style/appheader.css";
import useProfile from "../hooks/Useprofile";

// Top bar for pages students see after logging in.
// Props: searchValue and onSearchChange (the Browse page owns the search text).
export default function AppHeader({ searchValue = "", onSearchChange }) {
  const navigate = useNavigate();
  const { session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { profile, loading } = useProfile();

  const user = session?.user;
  const name = user?.user_metadata?.full_name || user?.email || "";
  const initial = name ? name.trim()[0].toUpperCase() : "?";

  // Close the menu when clicking outside it or pressing Escape.
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="app-header">
      <Link to="/browse" className="app-header-brand">
        <span className="app-header-dot">
          <img src="/csu-icon.svg" alt="CSU icon" />
        </span>
        CSULends
      </Link>

      <div className="app-header-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <g
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </g>
        </svg>
        <input
          type="search"
          placeholder="Search rackets, calculators, books..."
          aria-label="Search items"
          value={searchValue}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
        />
      </div>

      <nav className="app-header-right" aria-label="Main">
        <Link to="/requests" className="app-header-link">
          Requests
        </Link>
        <Link to="/lend" className="app-header-lend">
          + Lend an item
        </Link>

        <div className="app-header-menu" ref={menuRef}>
          <button
            type="button"
            className="app-header-avatar"
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="Account menu"
          >
            {initial}
          </button>

          {menuOpen && (
            <div className="app-header-dropdown" role="menu">
              <div className="app-header-user">
                <strong>{user?.user_metadata?.full_name || "Student"}</strong>
                <span>{user?.email}</span>
              </div>
              {profile?.is_admin && (
                <button onClick={() => (window.location.href = "/adminpanel")}>
                  Admin Panel
                </button>
              )}
              <Link to="/requests" className="app-header-item" role="menuitem">
                My requests
              </Link>
              <button
                type="button"
                className="app-header-item"
                role="menuitem"
                onClick={handleLogout}
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
