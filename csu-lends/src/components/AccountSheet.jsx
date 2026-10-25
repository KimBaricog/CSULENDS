import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import useSession from "../hooks/useSession";
import useProfile from "../hooks/useProfile";
import "./style/accountsheet.css";

// Account menu that slides up from the bottom on phones.
export default function AccountSheet({ open, onClose }) {
  const navigate = useNavigate();
  const { session } = useSession();
  const { profile } = useProfile();

  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const user = session?.user;
  const name =
    profile?.full_name || user?.user_metadata?.full_name || "Student";
  const initial = name.trim()[0]?.toUpperCase() || "?";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    navigate("/");
  };

  return (
    <div
      className="account-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="account-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Account"
      >
        <div className="account-user">
          <span className="account-avatar" aria-hidden="true">
            {initial}
          </span>
          <div>
            <strong>{name}</strong>
            <span>{user?.email}</span>
            {profile?.program && <small>{profile.program}</small>}
          </div>
        </div>

        {profile?.is_admin && (
          <Link to="/admin" className="account-item" onClick={onClose}>
            Admin review
          </Link>
        )}
        <Link to="/lend" className="account-item" onClick={onClose}>
          Your listings
        </Link>
        <button
          type="button"
          className="account-item account-item--danger"
          onClick={handleLogout}
        >
          Log out
        </button>
        <button type="button" className="account-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
