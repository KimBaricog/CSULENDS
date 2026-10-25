import { Link } from "react-router-dom";

export default function CallToAction() {
  return (
    <section className="ls-cta">
      <h2>Ready to borrow or lend?</h2>
      <p>
        Join your classmates on CSULends. It takes about a minute to sign up.
      </p>
      <div className="ls-cta-actions">
        <Link to="/signup" className="ls-cta-primary">
          Create account
        </Link>
        <Link to="/login" className="ls-cta-secondary">
          Log in
        </Link>
      </div>
    </section>
  );
}
