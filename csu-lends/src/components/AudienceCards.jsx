const BORROWERS = [
  "Search items shared by students on campus",
  "Pick your dates and see the total fee before you ask",
  "Meet the owner at a campus pickup spot",
  "Return it on time and leave a rating",
];

const LENDERS = [
  "Post an item with a photo in under a minute",
  "Lend it for free, or set a small daily fee",
  "Accept or decline every request yourself",
  "Mark it returned and rate the borrower",
];

function Checklist({ items }) {
  return (
    <ul className="ls-checklist">
      {items.map((text) => (
        <li key={text}>
          <span className="ls-tick" aria-hidden="true">
            ✓
          </span>
          {text}
        </li>
      ))}
    </ul>
  );
}

export default function AudienceCards() {
  return (
    <section id="for-everyone" className="ls-section ls-section--band">
      <div className="ls-inner">
        <div className="ls-heading">
          <span className="ls-eyebrow">Two ways to use it</span>
          <h2>Borrow what you need. Lend what you don't.</h2>
          <p>You can do both with the same account.</p>
        </div>

        <div className="ls-two">
          <article
            className="ls-audience"
            style={{ background: "var(--tint-blue, #dce6ff)" }}
          >
            <h3>If you need something</h3>
            <p>Skip buying things you will only use once.</p>
            <Checklist items={BORROWERS} />
          </article>

          <article
            className="ls-audience"
            style={{ background: "var(--tint-lime, #eef8c4)" }}
          >
            <h3>If you have something</h3>
            <p>Give your unused things a purpose, and earn a little too.</p>
            <Checklist items={LENDERS} />
          </article>
        </div>
      </div>
    </section>
  );
}
