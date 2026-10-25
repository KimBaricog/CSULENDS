import { useState } from "react";
import AppHeader from "../components/AppHeader";
import "./style/browse.css";

export default function Browse() {
  const [search, setSearch] = useState("");

  return (
    <div className="browse-page">
      <AppHeader searchValue={search} onSearchChange={setSearch} />

      <main className="browse-layout">
        {/* PIECE 2 goes here: the filter sidebar */}
        <aside className="browse-sidebar">
          <p className="browse-placeholder">Filters will go here.</p>
        </aside>

        <section className="browse-content">
          <div className="browse-heading">
            <div>
              <h1>What do you need?</h1>
              <p>Items shared by students at Caraga State University</p>
            </div>
            {/* PIECE 3 goes here: the sort dropdown */}
          </div>

          {/* PIECE 3 and 4 go here: the item grid */}
          <div className="browse-placeholder browse-placeholder--grid">
            Items will go here.
          </div>
        </section>
      </main>
    </div>
  );
}
