import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase.js";
import Visual from "../components/Visual.jsx";
import "./style/login.css";

// Put your school's email ending here once you have confirmed it,
// for example "@yourschool.edu.ph". Leave it empty to skip the check.
const SCHOOL_EMAIL_DOMAIN = "@gmail.com";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let ok = true;
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setEmailError("Enter your CSU email.");
      ok = false;
    } else if (
      SCHOOL_EMAIL_DOMAIN &&
      !cleanEmail.endsWith(SCHOOL_EMAIL_DOMAIN)
    ) {
      setEmailError("Use a valid email address.");
      ok = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Enter your password.");
      ok = false;
    } else {
      setPasswordError("");
    }

    return ok;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);

    if (error) {
      // One message for every failure, so strangers can't tell which emails have accounts.
      setFormError("Incorrect email or password. Please try again.");
      return;
    }

    navigate("/browse");
  };

  const emailHasError = Boolean(emailError || formError);
  const passwordHasError = Boolean(passwordError || formError);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://csulends.vercel.app/browse",
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
      setFormError("Unable to sign in with Google. Please try again.");
    }
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
          <span className="login-nav-text">New here?</span>
          <Link to="/signup" className="login-btn-outline">
            Create account
          </Link>
        </div>
      </header>

      <main className="login-split">
        <section className="login-form-side">
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <h1 className="login-title">Welcome back</h1>
            <p className="login-subtitle">
              Log in to see what your classmates are sharing.
            </p>
            {formError && (
              <div className="login-banner" role="alert">
                <span className="login-banner-icon">!</span>
                {formError}
              </div>
            )}
            <div className="login-field">
              <label htmlFor="email" className="login-label">
                CSU email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`login-input ${emailHasError ? "login-input--error" : ""}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={emailHasError}
                aria-describedby={emailError ? "email-error" : undefined}
              />
              {emailError && (
                <p id="email-error" className="login-error-text">
                  {emailError}
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
                  autoComplete="current-password"
                  className={`login-input ${passwordHasError ? "login-input--error" : ""}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={passwordHasError}
                  aria-describedby={
                    passwordError ? "password-error" : undefined
                  }
                />
                <button
                  type="button"
                  className="login-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {passwordError && (
                <p id="password-error" className="login-error-text">
                  {passwordError}
                </p>
              )}
            </div>
            <div className="login-row">
              <Link to="/forgot-password" className="login-link">
                Forgot password?
              </Link>
            </div>
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
            <p className="login-lock">Continue with Google</p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="google-login-button"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt=""
                width="20"
                height="20"
              />
              Continue with Google
            </button>

            <p className="login-foot">
              New to CSULends?{" "}
              <Link to="/signup" className="login-link">
                Create an account
              </Link>
            </p>
            <p className="login-lock">Only for verified CSU students</p>
          </form>
        </section>

        <aside className="login-visual" aria-hidden="true">
          <Visual />
        </aside>
      </main>
    </div>
  );
}
