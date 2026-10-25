import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import useSession from "../hooks/useSession";
import AppHeader from "../components/Header";
import MyListings from "../components/MyListings";
import {
  CATEGORIES,
  CONDITIONS,
  PICKUP_SPOTS,
  MAX_DAYS_OPTIONS,
  FEE_PRESETS,
  MAX_FEE,
  MAX_PHOTO_MB,
  PHOTO_TYPES,
  ITEM_STATUS,
} from "../lib/Itemoptions";
import "./style/lend.css";

const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export default function Lend() {
  const { session } = useSession();
  const userId = session?.user?.id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [condition, setCondition] = useState("Good");
  const [pickupSpot, setPickupSpot] = useState(PICKUP_SPOTS[0]);
  const [maxDays, setMaxDays] = useState(3);
  const [fee, setFee] = useState("0");
  const [photo, setPhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [listKey, setListKey] = useState(0);

  // Show a preview of the chosen photo, and clean it up afterwards.
  useEffect(() => {
    if (!photo) {
      setPreviewUrl("");
      return undefined;
    }
    const url = URL.createObjectURL(photo);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!PHOTO_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        photo: "Use a JPG, PNG, or WebP photo.",
      }));
      setPhoto(null);
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        photo: `The photo must be under ${MAX_PHOTO_MB} MB.`,
      }));
      setPhoto(null);
      return;
    }
    setErrors((prev) => ({ ...prev, photo: "" }));
    setPhoto(file);
  };

  const validate = () => {
    const next = {};
    const cleanName = name.trim();
    const feeNumber = Number(fee);

    if (!cleanName) next.name = "Give your item a name.";
    else if (cleanName.length > 60)
      next.name = "Keep the name under 60 characters.";

    if (!Number.isInteger(feeNumber) || feeNumber < 0 || feeNumber > MAX_FEE)
      next.fee = `Enter a whole number from 0 to ${MAX_FEE}.`;

    if (!photo) next.photo = "Add a photo so classmates can see the item.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCategory(CATEGORIES[0]);
    setCondition("Good");
    setPickupSpot(PICKUP_SPOTS[0]);
    setMaxDays(3);
    setFee("0");
    setPhoto(null);
    setErrors({});
    setFormError("");
    setSubmitted(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!validate() || !userId) return;

    setSubmitting(true);

    // 1. Upload the photo into a folder named after the student's id.
    const path = `${userId}/${crypto.randomUUID()}.${EXTENSIONS[photo.type]}`;
    const { error: uploadError } = await supabase.storage
      .from("item-photos")
      .upload(path, photo, { contentType: photo.type, upsert: false });

    if (uploadError) {
      setSubmitting(false);
      setFormError("The photo could not be uploaded. Please try again.");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("item-photos")
      .getPublicUrl(path);

    // 2. Save the item. It always starts as "pending" until an admin approves it.
    const { error: insertError } = await supabase.from("items").insert({
      owner_id: userId,
      name: name.trim(),
      description: description.trim() || null,
      category,
      condition,
      pickup_spot: pickupSpot,
      max_days: maxDays,
      fee_per_day: Number(fee),
      photo_url: urlData.publicUrl,
      status: ITEM_STATUS.PENDING,
    });

    if (insertError) {
      await supabase.storage.from("item-photos").remove([path]); // don't leave an orphan photo
      setSubmitting(false);
      setFormError("We could not submit your item. Please try again.");
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
    setListKey((key) => key + 1);
  };

  return (
    <div className="lend-page">
      <main className="lend-layout">
        <section className="lend-main">
          {submitted ? (
            <div className="lend-success" role="status">
              <div className="lend-success-icon" aria-hidden="true">
                ✓
              </div>
              <h1>Submitted for review</h1>
              <p>
                An admin will check your item before it appears on Browse. You
                can follow its status under "Your listings".
              </p>
              <div className="lend-success-actions">
                <button
                  type="button"
                  className="lend-btn lend-btn--primary"
                  onClick={resetForm}
                >
                  Lend another item
                </button>
                <Link to="/browse" className="lend-btn lend-btn--outline">
                  Back to browse
                </Link>
              </div>
            </div>
          ) : (
            <form className="lend-form" onSubmit={handleSubmit} noValidate>
              <h1 className="lend-title">Lend an item</h1>
              <p className="lend-subtitle">
                Share something you are not using. An admin reviews every item
                before it goes live.
              </p>

              {formError && (
                <div className="lend-banner" role="alert">
                  <span className="lend-banner-icon">!</span>
                  {formError}
                </div>
              )}

              <div className="lend-field">
                <span className="lend-label">Photo</span>
                <label
                  className={`lend-upload ${errors.photo ? "lend-upload--error" : ""}`}
                >
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview of your item" />
                  ) : (
                    <span>
                      <strong>Tap to add a photo</strong>
                      <small>JPG, PNG, or WebP, up to {MAX_PHOTO_MB} MB</small>
                    </span>
                  )}
                  <input
                    type="file"
                    accept={PHOTO_TYPES.join(",")}
                    onChange={handlePhoto}
                  />
                </label>
                {errors.photo && (
                  <p className="lend-error-text">{errors.photo}</p>
                )}
              </div>

              <div className="lend-field">
                <label htmlFor="name" className="lend-label">
                  Item name
                </label>
                <input
                  id="name"
                  type="text"
                  maxLength={60}
                  placeholder="e.g. Badminton racket"
                  className={`lend-input ${errors.name ? "lend-input--error" : ""}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && (
                  <p className="lend-error-text">{errors.name}</p>
                )}
              </div>

              <div className="lend-field">
                <label htmlFor="description" className="lend-label">
                  Description <span className="lend-optional">(optional)</span>
                </label>
                <textarea
                  id="description"
                  rows={3}
                  maxLength={300}
                  placeholder="Brand, what is included, anything the borrower should know"
                  className="lend-input lend-textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="lend-row">
                <div className="lend-field">
                  <label htmlFor="category" className="lend-label">
                    Category
                  </label>
                  <select
                    id="category"
                    className="lend-input"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="lend-field">
                  <label htmlFor="pickup" className="lend-label">
                    Pickup spot
                  </label>
                  <select
                    id="pickup"
                    className="lend-input"
                    value={pickupSpot}
                    onChange={(e) => setPickupSpot(e.target.value)}
                  >
                    {PICKUP_SPOTS.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="lend-field">
                <span className="lend-label">Condition</span>
                <div className="lend-seg" role="group" aria-label="Condition">
                  {CONDITIONS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={condition === c ? "is-on" : ""}
                      aria-pressed={condition === c}
                      onClick={() => setCondition(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lend-field">
                <span className="lend-label">Longest loan</span>
                <div
                  className="lend-seg"
                  role="group"
                  aria-label="Longest loan"
                >
                  {MAX_DAYS_OPTIONS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={maxDays === d ? "is-on" : ""}
                      aria-pressed={maxDays === d}
                      onClick={() => setMaxDays(d)}
                    >
                      {d} {d === 1 ? "day" : "days"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="lend-field">
                <label htmlFor="fee" className="lend-label">
                  Fee per day{" "}
                  <span className="lend-optional">
                    (paid in cash at pickup)
                  </span>
                </label>
                <div
                  className="lend-seg lend-seg--presets"
                  role="group"
                  aria-label="Fee presets"
                >
                  {FEE_PRESETS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={
                        Number(fee) === value && fee !== "" ? "is-on" : ""
                      }
                      onClick={() => setFee(String(value))}
                    >
                      {value === 0 ? "Free" : `₱${value}`}
                    </button>
                  ))}
                </div>
                <div className="lend-fee-input">
                  <span aria-hidden="true">₱</span>
                  <input
                    id="fee"
                    type="number"
                    min="0"
                    max={MAX_FEE}
                    step="1"
                    inputMode="numeric"
                    className={`lend-input ${errors.fee ? "lend-input--error" : ""}`}
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    aria-invalid={Boolean(errors.fee)}
                  />
                </div>
                {errors.fee ? (
                  <p className="lend-error-text">{errors.fee}</p>
                ) : (
                  <p className="lend-hint">
                    Keep it small. The most you can charge is ₱{MAX_FEE} a day.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="lend-submit"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit for review"}
              </button>
            </form>
          )}
        </section>

        <aside className="lend-side">
          <div className="lend-info">
            <h2>How review works</h2>
            <ol>
              <li>You submit your item with a photo.</li>
              <li>
                An admin checks that it is appropriate and the photo is clear.
              </li>
              <li>Once approved, it appears on Browse for your classmates.</li>
              <li>If it is not approved, you will see the reason here.</li>
            </ol>
          </div>

          <MyListings refreshKey={listKey} />
        </aside>
      </main>
    </div>
  );
}
