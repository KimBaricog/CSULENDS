import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import useSession from "../hooks/useSession";
import AppHeader from "../components/AppHeader";
import ProfileHeader from "../components/ProfileHeader";
import ReviewList from "../components/ReviewList";
import ItemCard from "../components/Itemcard";
import ItemDetailModal from "../components/ItemDetailModal";
import { ITEM_STATUS } from "../lib/itemOptions";
import "./style/profile.css";

const ITEM_COLUMNS =
  "id, owner_id, name, description, category, condition, pickup_spot, max_days, fee_per_day, " +
  "photo_url, created_at, owner:profiles!owner_id(full_name)";

const REVIEW_COLUMNS =
  "id, rating, comment, reviewee_role, item_name, created_at, reviewer:profiles!reviewer_id(id, full_name)";

// Another student's public profile: who they are, what they lend, and what people say.
export default function StudentProfile() {
  const { id } = useParams();
  const { session } = useSession();
  const userId = session?.user?.id;
  const isSelf = Boolean(id) && id === userId;

  const [summary, setSummary] = useState(null);
  const [items, setItems] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!id || isSelf) return undefined;
    let active = true;
    setLoading(true);

    Promise.all([
      supabase.rpc("student_summaries", { uids: [id] }),
      supabase
        .from("items")
        .select(ITEM_COLUMNS)
        .eq("owner_id", id)
        .eq("status", ITEM_STATUS.APPROVED)
        .order("created_at", { ascending: false }),
      supabase
        .from("reviews")
        .select(REVIEW_COLUMNS)
        .eq("reviewee_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
    ]).then(([summaryResult, itemsResult, reviewsResult]) => {
      if (!active) return;
      setSummary((summaryResult.data || [])[0] || null);
      setItems(itemsResult.data || []);
      setReviews(reviewsResult.data || []);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [id, isSelf]);

  // Your own profile has its own page, with editing.
  if (isSelf) return <Navigate to="/profile" replace />;

  return (
    <div className="profile-page">
      <AppHeader showSearch={false} />

      <main className="profile-main">
        <Link to="/browse" className="profile-back">
          ‹ Back to browse
        </Link>

        {loading && <p className="profile-state">Loading...</p>}

        {!loading && !summary && (
          <p className="profile-state">We could not find this student.</p>
        )}

        {!loading && summary && (
          <>
            <ProfileHeader summary={summary} />

            <h2 className="profile-section">
              Items {summary.full_name.split(" ")[0]} lends
              <span className="profile-count">{items.length}</span>
            </h2>
            {items.length === 0 ? (
              <p className="reviews-empty">No items available right now.</p>
            ) : (
              <div className="profile-grid">
                {items.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onSelect={setSelectedItem}
                  />
                ))}
              </div>
            )}

            <h2 className="profile-section">
              Ratings
              <span className="profile-count">{summary.rating_count}</span>
            </h2>
            <ReviewList reviews={reviews} emptyText="No ratings yet." />
          </>
        )}
      </main>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
