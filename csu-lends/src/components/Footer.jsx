import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="ls-footer">
      <div>
        <Link to="/" className="ls-footer-brand">
          <span className="ls-footer-dot" />
          CSULends
        </Link>
        <p>Students lending to students at Caraga State University.</p>
      </div>

      <nav className="ls-footer-links" aria-label="Footer">
        <a href="#how-it-works">How it works</a>
        <a href="#house-rules">House rules</a>
        <a href="#faq">FAQ</a>
        <Link to="/login">Log in</Link>
      </nav>

      <small>© {new Date().getFullYear()} CSULends</small>
    </footer>
  );
}
