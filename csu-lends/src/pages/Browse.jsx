import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import useSession from "../hooks/useSession";
import AppHeader from "../components/AppHeader";
import AccountSheet from "../components/AccountSheet";
import BrowseFilters from "../components/BrowseFilters";
import ItemCard from "../components/Itemcard";
import ItemDetailModal from "../components/ItemDetailModal";
import { CATEGORIES, ITEM_STATUS, MAX_FEE } from "../lib/itemOptions";
import "./style/browse.css";

const LOAD_LIMIT = 200;

const SORTS = {
  newest: "Newest first",
  feeLow: "Fee: low to high",
  feeHigh: "Fee: high to low",
  name: "Name: A to Z",
};

const DEFAULT_FILTERS = {
  category: "All",
  freeOnly: false,
  maxFee: MAX_FEE,
  pickups: [],
};

const ITEM_COLUMNS =
  "id, owner_id, name, description, category, condition, pickup_spot, max_days, fee_per_day, " +
  "photo_url, created_at, owner:profiles!owner_id(full_name)";

export default function Browse() {
  const { session } = useSession();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const displayName =
    session?.user?.user_metadata?.full_name || session?.user?.email || "";
  const initial = displayName ? displayName.trim()[0].toUpperCase() : "?";

  // Load approved items. The status filter matters: the database lets students
  // see their own pending items too, so we ask for approved ones only.
  useEffect(() => {
    let active = true;

    supabase
      .from("items")
      .select(ITEM_COLUMNS)
      .eq("status", ITEM_STATUS.APPROVED)
      .order("created_at", { ascending: false })
      .limit(LOAD_LIMIT)
      .then(({ data, error: fetchError }) => {
        if (!active) return;
        if (fetchError)
          setError("Could not load items. Please refresh the page.");
        else setItems(data || []);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const updateFilters = (changes) =>
    setFilters((current) => ({ ...current, ...changes }));
  const clearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
  };

  // Items that match the search words (before the sidebar filters), used for counts.
  const searched = useMemo(() => {
    const words = search.trim().toLowerCase();
    if (!words) return items;
    return items.filter((item) =>
      `${item.name} ${item.description || ""} ${item.category}`
        .toLowerCase()
        .includes(words),
    );
  }, [items, search]);

  const categoryCounts = useMemo(() => {
    const counts = { All: searched.length };
    CATEGORIES.forEach((name) => {
      counts[name] = searched.filter((item) => item.category === name).length;
    });
    return counts;
  }, [searched]);

  const visibleItems = useMemo(() => {
    const result = searched.filter((item) => {
      if (filters.category !== "All" && item.category !== filters.category)
        return false;
      if (filters.freeOnly && item.fee_per_day !== 0) return false;
      if (item.fee_per_day > filters.maxFee) return false;
      if (
        filters.pickups.length > 0 &&
        !filters.pickups.includes(item.pickup_spot)
      )
        return false;
      return true;
    });

    const sorted = [...result];
    if (sort === "feeLow") sorted.sort((a, b) => a.fee_per_day - b.fee_per_day);
    if (sort === "feeHigh")
      sorted.sort((a, b) => b.fee_per_day - a.fee_per_day);
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }, [searched, filters, sort]);

  const hasActiveFilters =
    search.trim() !== "" ||
    filters.category !== "All" ||
    filters.freeOnly ||
    filters.maxFee < MAX_FEE ||
    filters.pickups.length > 0;

  // The Filters button counts only the filters that live inside the panel
  // (the category chips are always visible on phones).
  const panelFilterCount =
    (filters.freeOnly ? 1 : 0) +
    (filters.maxFee < MAX_FEE ? 1 : 0) +
    (filters.pickups.length > 0 ? 1 : 0);

  return (
    <div className="browse-page">
      <AppHeader searchValue={search} onSearchChange={setSearch} />

      <main className="browse-layout">
        {filtersOpen && (
          <div
            className="browse-backdrop"
            onClick={() => setFiltersOpen(false)}
          />
        )}

        <aside className={`browse-sidebar ${filtersOpen ? "is-open" : ""}`}>
          <div className="browse-sheet-head">
            <h2>Filters</h2>
            <button type="button" onClick={() => setFiltersOpen(false)}>
              Done
            </button>
          </div>
          <BrowseFilters
            filters={filters}
            onChange={updateFilters}
            categoryCounts={categoryCounts}
            hasActiveFilters={hasActiveFilters}
            onClear={clearFilters}
          />
        </aside>

        <section className="browse-content">
          <div className="browse-heading">
            <div>
              <span className="browse-eyebrow">Caraga State University</span>
              <h1>What do you need?</h1>
              <p>
                {loading
                  ? "Loading items..."
                  : `${visibleItems.length} ${visibleItems.length === 1 ? "item" : "items"} shared by students at Caraga State University`}
              </p>
            </div>

            <button
              type="button"
              className="browse-avatar"
              onClick={() => setAccountOpen(true)}
              aria-label="Open account menu"
            >
              {initial}
            </button>
          </div>

          <div className="browse-controls">
            <button
              type="button"
              className="browse-filter-toggle"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              Filters{panelFilterCount > 0 ? ` (${panelFilterCount})` : ""}
            </button>

            <label className="browse-sort">
              <span className="browse-sr-only">Sort items</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {Object.entries(SORTS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Phones only: search and category chips, as in the app design. */}
          <div className="browse-mobile-search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </g>
            </svg>
            <input
              type="search"
              placeholder="Search rackets, calculators..."
              aria-label="Search items"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="browse-chips" role="group" aria-label="Category">
            {["All", ...CATEGORIES].map((name) => (
              <button
                key={name}
                type="button"
                className={filters.category === name ? "is-on" : ""}
                aria-pressed={filters.category === name}
                onClick={() => updateFilters({ category: name })}
              >
                {name}
              </button>
            ))}
          </div>

          {error && (
            <p className="browse-state browse-state--error" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="browse-state">
              <h2>No items yet</h2>
              <p>Be the first to share something with your classmates.</p>
              <Link to="/lend" className="browse-action">
                + Lend an item
              </Link>
            </div>
          )}

          {!loading &&
            !error &&
            items.length > 0 &&
            visibleItems.length === 0 && (
              <div className="browse-state">
                <h2>Nothing matches your filters</h2>
                <p>Try a different search, or clear the filters.</p>
                <button
                  type="button"
                  className="browse-action"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              </div>
            )}

          <div className="browse-grid">
            {visibleItems.map((item) => (
              <ItemCard key={item.id} item={item} onSelect={setSelectedItem} />
            ))}
          </div>
        </section>
      </main>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      <AccountSheet open={accountOpen} onClose={() => setAccountOpen(false)} />
    </div>
  );
}
