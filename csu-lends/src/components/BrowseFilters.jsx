import { CATEGORIES, PICKUP_SPOTS, MAX_FEE } from "../lib/itemOptions";
import "./style/browsefilters.css";

// The filter sidebar. The Browse page owns the values; this only shows them.
// filters: { category, freeOnly, maxFee, pickups }
export default function BrowseFilters({
  filters,
  onChange,
  categoryCounts,
  hasActiveFilters,
  onClear,
}) {
  const togglePickup = (spot) => {
    const next = filters.pickups.includes(spot)
      ? filters.pickups.filter((p) => p !== spot)
      : [...filters.pickups, spot];
    onChange({ pickups: next });
  };

  return (
    <div className="filters">
      <section className="filters-section">
        <h2>Category</h2>
        {["All", ...CATEGORIES].map((name) => (
          <button
            key={name}
            type="button"
            className={`filters-category ${filters.category === name ? "is-on" : ""}`}
            aria-pressed={filters.category === name}
            onClick={() => onChange({ category: name })}
          >
            {name}
            <span>{categoryCounts[name] ?? 0}</span>
          </button>
        ))}
      </section>

      <section className="filters-section">
        <h2>Fee per day</h2>
        <label className="filters-switch">
          <span>Free items only</span>
          <input
            type="checkbox"
            checked={filters.freeOnly}
            onChange={(e) => onChange({ freeOnly: e.target.checked })}
          />
        </label>

        <label className="filters-range">
          <span>
            {filters.maxFee >= MAX_FEE ? "Any fee" : `Up to ₱${filters.maxFee}`}
          </span>
          <input
            type="range"
            min="0"
            max={MAX_FEE}
            step="5"
            value={filters.maxFee}
            disabled={filters.freeOnly}
            onChange={(e) => onChange({ maxFee: Number(e.target.value) })}
            aria-label="Maximum fee per day"
          />
        </label>
      </section>

      <section className="filters-section">
        <h2>Pickup spot</h2>
        {PICKUP_SPOTS.map((spot) => (
          <label key={spot} className="filters-check">
            <input
              type="checkbox"
              checked={filters.pickups.includes(spot)}
              onChange={() => togglePickup(spot)}
            />
            {spot}
          </label>
        ))}
      </section>

      {hasActiveFilters && (
        <button type="button" className="filters-clear" onClick={onClear}>
          Clear all filters
        </button>
      )}
    </div>
  );
}
