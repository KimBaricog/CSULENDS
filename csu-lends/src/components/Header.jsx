import { Link } from "react-router-dom";
import "./style/header.css";

// Links in the middle of the header. To add another, add a line here
// and give the matching section on the landing page the same id.
const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "What you can borrow", href: "#what-you-can-borrow" },
  { label: "House rules", href: "#house-rules" },
  { label: "FAQ", href: "#faq" },
];

function Header() {
  return (
    <header className="header-nav">
      <Link to="/" className="header-brand">
        <span className="header-brand-dot" />
        CSULends
      </Link>

      <nav className="header-nav-links" aria-label="Page sections">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} className="header-link">
            {link.label}
          </a>
        ))}
      </nav>

      <div className="header-nav-right">
        <Link to="/login" className="header-link header-link--strong">
          Log in
        </Link>
        <Link to="/signup" className="header-btn-primary">
          Create account
        </Link>
      </div>
    </header>
  );
}

export default Header;
