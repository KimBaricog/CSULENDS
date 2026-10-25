import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import AccountSheet from "./AccountSheet";
import "./style/bottomnav.css";

const ICONS = {
  browse: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11l8-7 8 7v9H4z" />
      </g>
    </svg>
  ),
  requests: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M5 7h14M5 12h14M5 17h9" />
      </g>
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1-5 15-5 16 0" />
      </g>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  ),
};

const itemClass = ({ isActive }) => `bottomnav-item ${isActive ? "is-active" : ""}`;

// Bottom navigation bar. It only appears on phones and small tablets (see bottomnav.css).
export default function BottomNav() {
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <>
      <nav className="bottomnav" aria-label="Main">
        <NavLink to="/browse" className={itemClass}>
          {ICONS.browse}
          Browse
        </NavLink>

        <NavLink to="/requests" className={itemClass}>
          {ICONS.requests}
          Requests
        </NavLink>

        <NavLink
          to="/lend"
          aria-label="Lend an item"
          className={({ isActive }) => `bottomnav-plus ${isActive ? "is-active" : ""}`}
        >
          {ICONS.plus}
        </NavLink>

        <button
          type="button"
          className={`bottomnav-item ${accountOpen ? "is-active" : ""}`}
          onClick={() => setAccountOpen(true)}
          aria-haspopup="dialog"
        >
          {ICONS.profile}
          Profile
        </button>
      </nav>

      <AccountSheet open={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  );
}
