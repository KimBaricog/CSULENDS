const QUESTIONS = [
  {
    q: "Is CSULends free to use?",
    a: "Yes. Creating an account and browsing cost nothing. Lenders can choose to lend for free or set a small daily fee for their own items.",
  },
  {
    q: "Who can join?",
    a: "Only Caraga State University students. You sign up with your school email, and you confirm it from your inbox before you can log in.",
  },
  {
    q: "How do I pay a fee?",
    a: "The total is shown before you send a request. You pay the lender in cash when you pick the item up. The site does not process payments.",
  },
  {
    q: "What if something gets damaged or lost?",
    a: "Look the item over together at pickup, and agree on what happens if something goes wrong before you borrow. Lenders choose who to lend to and can decline any request.",
  },
  {
    q: "Can I borrow without lending anything?",
    a: "Yes. You can borrow, lend, or do both. One account does everything.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="ls-section ls-section--band">
      <div className="ls-inner ls-inner--narrow">
        <div className="ls-heading">
          <span className="ls-eyebrow">Questions</span>
          <h2>Things students ask first.</h2>
        </div>

        <div className="ls-faq">
          {QUESTIONS.map((item) => (
            <details key={item.q} className="ls-faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
