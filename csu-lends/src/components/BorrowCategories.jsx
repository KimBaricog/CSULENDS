import { ICONS } from "./ItemIcons";

const CATEGORIES = [
  {
    id: "sports",
    icon: "racket",
    title: "Sports",
    text: "Badminton rackets, volleyballs, basketballs, nets, and jerseys.",
    tint: "var(--tint-lime, #eef8c4)",
  },
  {
    id: "tech",
    icon: "calculator",
    title: "Tech",
    text: "Scientific calculators, cameras, chargers, and other gadgets.",
    tint: "var(--tint-peach, #ffe6d6)",
  },
  {
    id: "books",
    icon: "book",
    title: "Books",
    text: "Textbooks, reference books, and reviewers for the semester.",
    tint: "var(--tint-blue, #dce6ff)",
  },
  {
    id: "other",
    icon: "gown",
    title: "Everything else",
    text: "Lab gowns, uniforms, tools, and art supplies.",
    tint: "var(--tint-purple, #e4ddfb)",
  },
];

export default function Borrowcategories() {
  return (
    <section id="what-you-can-borrow" className="ls-section">
      <div className="ls-inner">
        <div className="ls-heading">
          <span className="ls-eyebrow">What you can borrow</span>
          <h2>If a classmate has it, you can ask for it.</h2>
          <p>
            Most things you need for a day or two are already sitting in
            someone's bag or closet. Here are the kinds of items students share.
          </p>
        </div>

        <div className="ls-grid-4">
          {CATEGORIES.map((c) => (
            <article key={c.id} className="ls-cat">
              <div className="ls-cat-thumb" style={{ background: c.tint }}>
                {ICONS[c.icon]}
              </div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
