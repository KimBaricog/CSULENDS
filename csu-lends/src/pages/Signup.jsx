import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Visual from "../components/Visual";
import "./style/login.css"; // shared page, form and picture panel styles
import "./style/signup.css";

// Put your school's email ending here once you have confirmed it,
// for example "@yourschool.edu.ph". Leave it empty to skip the check.
const SCHOOL_EMAIL_DOMAIN = "";
const MIN_PASSWORD_LENGTH = 8;

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [program, setProgram] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [resendMessage, setResendMessage] = useState("");

  const validate = () => {
    const next = {};
    const cleanEmail = email.trim().toLowerCase();

    if (!fullName.trim()) next.fullName = "Enter your full name.";

    if (!cleanEmail) next.email = "Enter a valid email address.";
    else if (!cleanEmail.endsWith(SCHOOL_EMAIL_DOMAIN)) {
      next.email = "Don't use your school email address";
    }

    if (password.length < MIN_PASSWORD_LENGTH)
      next.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;

    if (!agreed) next.agreed = "Please agree to the house rules to continue.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    const cleanEmail = email.trim().toLowerCase();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: fullName.trim(), program: program.trim() },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    setLoading(false);

    if (error) {
      setFormError(
        error.message || "We could not create your account. Please try again.",
      );
      return;
    }

    // Supabase returns an empty identities list when the email is already registered.
    if (
      data.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      setFormError(
        "This email already has an account. Try logging in instead.",
      );
      return;
    }

    // If email confirmation is turned off in Supabase, the user is already signed in.
    if (data.session) {
      navigate("/browse");
      return;
    }

    setSentTo(cleanEmail);
  };

  const handleResend = async () => {
    setResendMessage("");
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: sentTo,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    setResendMessage(
      error
        ? "Could not resend. Wait a minute and try again."
        : "Confirmation email sent again.",
    );
  };

  return (
    <div className="login-page">
      <header className="login-nav">
        <Link to="/" className="login-brand">
          <span className="login-brand-dot">
            <img src="/csu-icon.svg" alt="CSU icon" />
          </span>
          CSULends
        </Link>
        <div className="login-nav-right">
          <span className="login-nav-text">Already have an account?</span>
          <Link to="/login" className="login-btn-outline">
            Log in
          </Link>
        </div>
      </header>

      <main className="login-split">
        <section className="login-form-side">
          {sentTo ? (
            <div className="login-form signup-inbox">
              <div className="signup-mail" aria-hidden="true">
                <svg viewBox="0 0 64 64">
                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="8" y="14" width="48" height="36" rx="6" />
                    <path d="M10 18l22 18 22-18" />
                  </g>
                </svg>
              </div>
              <h1 className="login-title">Check your inbox</h1>
              <p className="login-subtitle">
                We sent a confirmation link to <strong>{sentTo}</strong>. Open
                it to activate your account, then log in.
              </p>

              <div className="signup-inbox-actions">
                <Link to="/login" className="login-submit signup-link-button">
                  Go to log in
                </Link>
                <button
                  type="button"
                  className="signup-btn-soft"
                  onClick={handleResend}
                >
                  Resend email
                </button>
                {resendMessage && (
                  <p className="signup-resend" role="status">
                    {resendMessage}
                  </p>
                )}
              </div>

              <p className="login-foot">
                Wrong email?{" "}
                <button
                  type="button"
                  className="signup-text-button"
                  onClick={() => setSentTo("")}
                >
                  Go back
                </button>
              </p>
            </div>
          ) : (
            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <h1 className="login-title">Create your account</h1>
              <p className="login-subtitle">
                Join classmates who share. It takes a minute.
              </p>

              {formError && (
                <div className="login-banner" role="alert">
                  <span className="login-banner-icon">!</span>
                  {formError}
                </div>
              )}

              <div className="login-field">
                <label htmlFor="fullName" className="login-label">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  className={`login-input ${errors.fullName ? "login-input--error" : ""}`}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  aria-invalid={Boolean(errors.fullName)}
                />
                {errors.fullName && (
                  <p className="login-error-text">{errors.fullName}</p>
                )}
              </div>

              <div className="login-field">
                <label htmlFor="program" className="login-label">
                  Program <span className="signup-optional">(optional)</span>
                </label>
                <input
                  id="program"
                  type="text"
                  placeholder="e.g. BS Information Technology"
                  className="login-input"
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                />
              </div>

              <div className="login-field">
                <label htmlFor="email" className="login-label">
                  email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`login-input ${errors.email ? "login-input--error" : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email ? (
                  <p className="login-error-text">{errors.email}</p>
                ) : (
                  <p className="signup-hint">
                    Email will be process for verification.
                  </p>
                )}
              </div>

              <div className="login-field">
                <label htmlFor="password" className="login-label">
                  Password
                </label>
                <div className="login-input-wrap">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={`login-input ${errors.password ? "login-input--error" : ""}`}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={Boolean(errors.password)}
                  />
                  <button
                    type="button"
                    className="login-toggle"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password ? (
                  <p className="login-error-text">{errors.password}</p>
                ) : (
                  <p className="signup-hint">
                    At least {MIN_PASSWORD_LENGTH} characters.
                  </p>
                )}
              </div>

              <label className="signup-check">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>
                  I agree to the house rules: meet on campus, return on time,
                  and pay fees in cash at pickup.
                </span>
              </label>
              {errors.agreed && (
                <p className="login-error-text signup-check-error">
                  {errors.agreed}
                </p>
              )}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </button>

              <p className="login-foot">
                Already have an account?{" "}
                <Link to="/login" className="login-link">
                  Log in
                </Link>
              </p>
              <p className="login-lock">Only for verified CSU students</p>
            </form>
          )}
        </section>

        <Visual />
      </main>
    </div>
  );
}
