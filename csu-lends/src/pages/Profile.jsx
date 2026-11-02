import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import useSession from "../hooks/useSession";
import AppHeader from "../components/AppHeader";
import ProfileHeader from "../components/ProfileHeader";
import EditProfileForm from "../components/EditProfileForm";
import MyListings from "../components/MyListings";
import ReviewList from "../components/ReviewList";
import "./style/profile.css";

const TABS = [
  { key: "lends", label: "My lends" },
  { key: "ratings", label: "Ratings" },
  { key: "edit", label: "Edit profile" },
];

const REVIEW_COLUMNS =
  "id, rating, comment, reviewee_role, item_name, created_at, reviewer:profiles!reviewer_id(id, full_name)";

// A student's own profile: edit it, see everything they lend, and read their ratings.
export default function Profile() {
  const { session } = useSession();
  const userId = session?.user?.id;
  const fallbackName = session?.user?.user_metadata?.full_name || session?.user?.email;

  const [tab, setTab] = useState("lends");
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadError, setLoadError] = useState("");

  const loadSummary = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase.rpc("student_summaries", { uids: [userId] });
    if (error) {
      console.error("Could not load profile:", error);
      setLoadError("Could not load your profile details. Make sure csulends_profiles_ratings.sql has been run.");
      return;
    }
    setLoadError("");
    setSummary((data || [])[0] || null);
  }, [userId]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    if (!userId) return undefined;
    let active = true;
    supabase
      .from("reviews")
      .select(REVIEW_COLUMNS)
      .eq("reviewee_id", userId)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (active && !error) setReviews(data || []);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return (
    <div className="profile-page">
      <AppHeader showSearch={false} />

      <main className="profile-main">
        {loadError && <p className="profile-error" role="alert">{loadError}</p>}

        <ProfileHeader
          summary={summary}
          fallbackName={fallbackName}
          actions={
            <>
              <button type="button" className="profile-btn profile-btn--primary" onClick={() => setTab("edit")}>
                Edit profile
              </button>
              <Link to="/lend" className="profile-btn profile-btn--outline">+ Lend an item</Link>
            </>
          }
        />

        <nav className="profile-tabs" role="tablist" aria-label="Profile sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={tab === t.key ? "is-on" : ""}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {t.key === "ratings" && summary?.rating_count > 0 && <span className="profile-count">{summary.rating_count}</span>}
            </button>
          ))}
        </nav>

        {tab === "lends" && (
          <section>
            <p className="profile-note">
              This is everything you have shared. Other students see only the items an admin has approved.
            </p>
            <MyListings />
          </section>
        )}

        {tab === "ratings" && (
          <section>
            <p className="profile-note">
              After a loan is marked as returned, you and the other student can each rate each other from the
              Requests page.
            </p>
            <ReviewList reviews={reviews} emptyText="No one has rated you yet. Ratings appear after your first completed loan." />
          </section>
        )}

        {tab === "edit" && (
          <section>
            <EditProfileForm userId={userId} summary={summary} onSaved={loadSummary} key={summary?.id || "new"} />
          </section>
        )}
      </main>
    </div>
  );
}
