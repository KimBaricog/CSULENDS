import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import AccountSheet from "./AccountSheet";
import "./style/bottomnav.css";

const ICONS = {
  browse: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 11l8-7 8 7v9H4z" />
      </g>
    </svg>
  ),
  requests: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M5 7h14M5 12h14M5 17h9" />
      </g>
    </svg>
  ),
  message: (
    <svg viewBox="0 0 1024 1024" aria-hidden="true">
      <g
        fill="#000000"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M962.56 839.68c11.309 0 20.48-9.171 20.48-20.48V204.8c0-11.309-9.171-20.48-20.48-20.48H61.44c-11.309 0-20.48 9.171-20.48 20.48v614.4c0 11.309 9.171 20.48 20.48 20.48h901.12zm0 40.96H61.44C27.509 880.64 0 853.131 0 819.2V204.8c0-33.931 27.509-61.44 61.44-61.44h901.12c33.931 0 61.44 27.509 61.44 61.44v614.4c0 33.931-27.509 61.44-61.44 61.44z" />
        <path d="M971.909 165.158L519.608 538.099c-5.467 4.505-15.877 4.505-21.348-.004L43.752 163.325c-8.727-7.196-21.634-5.955-28.83 2.772s-5.955 21.634 2.772 28.83l454.513 374.774c20.605 16.979 52.854 16.979 73.454.004L997.967 196.76c8.727-7.196 9.968-20.103 2.772-28.83s-20.103-9.968-28.83-2.772z" />
        <path d="M415.464 496.633L22.176 819.07c-8.747 7.171-10.024 20.075-2.853 28.822s20.075 10.024 28.822 2.853l393.288-322.437c8.747-7.171 10.024-20.075 2.853-28.822s-20.075-10.024-28.822-2.853zm596.665 327.461L614.735 498.298c-8.747-7.171-21.651-5.894-28.822 2.853s-5.894 21.651 2.853 28.822L986.16 855.769c8.747 7.171 21.651 5.894 28.822-2.853s5.894-21.651-2.853-28.822z" />
      </g>
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1-5 15-5 16 0" />
      </g>
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  ),
};

const itemClass = ({ isActive }) =>
  `bottomnav-item ${isActive ? "is-active" : ""}`;

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
          className={({ isActive }) =>
            `bottomnav-plus ${isActive ? "is-active" : ""}`
          }
        >
          {ICONS.plus}
        </NavLink>

        <NavLink to="/message" className={itemClass}>
          {ICONS.message}
          Message
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
