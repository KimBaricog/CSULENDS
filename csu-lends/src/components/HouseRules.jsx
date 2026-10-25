const RULES = [
  {
    title: "Verified students only",
    text: "Sign up needs a CSU student email, so you are always lending to a classmate.",
  },
  {
    title: "Meet on campus",
    text: "Hand items over at public spots like the library lobby or the student center.",
  },
  {
    title: "Return on time",
    text: "Give the item back by the agreed date, in the condition you got it.",
  },
  {
    title: "Pay in cash at pickup",
    text: "Fees are shown upfront and paid directly to the lender. CSULends does not handle payments.",
  },
  {
    title: "Be honest about condition",
    text: "Lenders describe the item truthfully. Look it over together at pickup.",
  },
];

export default function HouseRules() {
  return (
    <section id="house-rules" className="ls-section">
      <div className="ls-inner">
        <div className="ls-heading">
          <span className="ls-eyebrow">House rules</span>
          <h2>Simple rules that keep sharing fair.</h2>
          <p>Everyone agrees to these when they create an account.</p>
        </div>

        <div className="ls-rules">
          {RULES.map((rule, index) => (
            <article key={rule.title} className="ls-rule">
              <span className="ls-rule-number">{index + 1}</span>
              <h3>{rule.title}</h3>
              <p>{rule.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
