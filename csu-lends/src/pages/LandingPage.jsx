import { Link } from "react-router-dom";
import Visual from "../components/Visual";
import Header from "../components/Header";
import Borrowcategories from "../components/Borrowcategories";
import AudienceCards from "../components/AudienceCards";
import HouseRules from "../components/HouseRules";
import Faq from "../components/Faq";
import CallToAction from "../components/CallToAction";
import Footer from "../components/Footer";
import "../components/style/landingsections.css";
import "./style/landingpage.css";

const TRUST_POINTS = [
  "Meet on campus",
  "Pay in cash at pickup",
  "Ratings after every loan",
];

const STEPS = [
  { number: 1, title: "Find", text: "Browse items shared on campus" },
  { number: 2, title: "Ask", text: "Pick your dates and send a request" },
  {
    number: 3,
    title: "Return and rate",
    text: "Give it back on time and leave a rating",
  },
];

function LandingPage() {
  return (
    <div className="Landing-page">
      <Header />

      <main className="Landing-split">
        <section className="Landing-form-side">
          <div className="text-area">
            <h1 className="Landing-title">Borrow it from a classmate.</h1>

            <p className="Landing-lead">
              Need a badminton racket or a calculator for just one day? Someone
              on campus already has one. Find it, ask the owner, and give it
              back. Lend your own things for free or a small daily fee.
            </p>

            <div className="Landing-actions">
              <Link to="/signup" className="Landing-btn Landing-btn--primary">
                Create account
              </Link>
              <Link to="/login" className="Landing-btn Landing-btn--outline">
                Log in
              </Link>
            </div>

            <ul className="Landing-trust">
              {TRUST_POINTS.map((point) => (
                <li key={point}>
                  <span className="Landing-check" aria-hidden="true">
                    ✓
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Visual />
      </main>

      <section
        id="how-it-works"
        className="Landing-steps"
        aria-label="How it works"
      >
        {STEPS.map((step) => (
          <div key={step.number} className="Landing-step">
            <span className="Landing-step-number">{step.number}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </div>
          </div>
        ))}
      </section>

      <Borrowcategories />
      <AudienceCards />
      <HouseRules />
      <Faq />
      <CallToAction />
      <Footer />
    </div>
  );
}

export default LandingPage;
