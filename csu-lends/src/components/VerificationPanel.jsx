import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { MAX_PHOTO_MB, PHOTO_TYPES } from "../lib/itemOptions";
import { timeAgo } from "../lib/timeAgo";
import VerifiedBadge from "./VerifiedBadge";
import "./style/verification.css";

const BUCKET = "verification-docs";
const EXTENSIONS = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Where a student asks to be verified, and sees how it is going.
export default function VerificationPanel({ userId, isVerified, onChanged }) {
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [idFile, setIdFile] = useState(null);
  const [scheduleFile, setScheduleFile] = useState(null);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadRequest = useCallback(async () => {
    if (!userId) return;
    const { data, error: fetchError } = await supabase
      .from("verification_requests")
      .select("id, status, rejection_reason, created_at, reviewed_at, id_path, schedule_path")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error("Could not load verification:", fetchError);
      setLoadError("Could not load your verification. Make sure csulends_verification.sql has been run.");
    } else {
      setLoadError("");
      setRequest((data || [])[0] || null);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const pickFile = (setter) => (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      setError("Use a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setError(`Each photo must be under ${MAX_PHOTO_MB} MB.`);
      return;
    }
    setError("");
    setter(file);
  };

  const uploadOne = async (file) => {
    const path = `${userId}/${crypto.randomUUID()}.${EXTENSIONS[file.type]}`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    return uploadError ? null : path;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!idFile && !scheduleFile) return setError("Add a photo of your school ID or your class schedule.");
    if (!consent) return setError("Please tick the box to agree before sending.");

    setBusy(true);
    const idPath = idFile ? await uploadOne(idFile) : null;
    const schedulePath = scheduleFile ? await uploadOne(scheduleFile) : null;
    const uploaded = [idPath, schedulePath].filter(Boolean);

    if ((idFile && !idPath) || (scheduleFile && !schedulePath)) {
      if (uploaded.length) await supabase.storage.from(BUCKET).remove(uploaded);
      setBusy(false);
      return setError("A photo could not be uploaded. Please try again.");
    }

    const { error: insertError } = await supabase.from("verification_requests").insert({
      id_path: idPath,
      schedule_path: schedulePath,
      consent: true,
    });

    if (insertError) {
      await supabase.storage.from(BUCKET).remove(uploaded); // never leave photos behind
      setBusy(false);
      if (insertError.code === "23505") return setError("You already have a request waiting for review.");
      if (insertError.code === "P0001") return setError(insertError.message);
      return setError("We could not send your request. Please try again.");
    }

    setIdFile(null);
    setScheduleFile(null);
    setConsent(false);
    setBusy(false);
    loadRequest();
  };

  const handleCancel = async () => {
    if (!request || !window.confirm("Cancel this request and delete the photos you sent?")) return;
    setBusy(true);
    const paths = [request.id_path, request.schedule_path].filter(Boolean);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
    const { error: deleteError } = await supabase.from("verification_requests").delete().eq("id", request.id);
    setBusy(false);
    if (deleteError) return setError("Could not cancel. Please try again.");
    setRequest(null);
  };

  if (loading) return <p className="verify-state">Loading...</p>;
  if (loadError) return <p className="verify-error" role="alert">{loadError}</p>;

  // Already verified
  if (isVerified) {
    return (
      <div className="verify-card verify-card--done">
        <h2>You are a verified student <VerifiedBadge size="lg" /></h2>
        <p>
          An admin checked your documents. The blue check now shows next to your name on your items,
          requests, and profile, so classmates can trust you.
        </p>
      </div>
    );
  }

  // Waiting for an admin
  if (request?.status === "pending") {
    return (
      <div className="verify-card verify-card--wait">
        <h2>Your documents are being reviewed</h2>
        <p>
          You sent them {timeAgo(request.created_at)}. An admin will check them and the blue check will
          appear on your profile if everything matches. Your photos are deleted right after the review.
        </p>
        {error && <p className="verify-error" role="alert">{error}</p>}
        <button type="button" className="verify-btn verify-btn--plain" onClick={handleCancel} disabled={busy}>
          Cancel request
        </button>
      </div>
    );
  }

  // Not sent yet, or sent before and not accepted
  return (
    <div>
      {request?.status === "rejected" && (
        <div className="verify-card verify-card--rejected" role="status">
          <strong>Your last request was not accepted</strong>
          <p>{request.rejection_reason || "No reason was given."} You can send new photos below.</p>
        </div>
      )}

      <div className="verify-card">
        <h2>Get verified</h2>
        <p>
          Send a photo of your <strong>school ID</strong> and/or your <strong>class schedule or registration form</strong>.
          An admin checks that you are a Caraga State University student and gives you a blue check
          <VerifiedBadge size="sm" />. Verified students get more trust from classmates.
        </p>

        <ul className="verify-tips">
          <li>Your name and school must be easy to read.</li>
          <li>You may cover your ID number, address, and signature. We do not need them.</li>
          <li>Only admins can see your photos, and they are deleted right after the review.</li>
        </ul>

        <form onSubmit={handleSubmit} noValidate>
          <div className="verify-uploads">
            <label className={`verify-upload ${idFile ? "has-file" : ""}`}>
              <span className="verify-upload-title">School ID</span>
              <span className="verify-upload-name">{idFile ? idFile.name : "Tap to choose a photo"}</span>
              <input type="file" accept={PHOTO_TYPES.join(",")} onChange={pickFile(setIdFile)} />
            </label>

            <label className={`verify-upload ${scheduleFile ? "has-file" : ""}`}>
              <span className="verify-upload-title">Class schedule or registration form</span>
              <span className="verify-upload-name">{scheduleFile ? scheduleFile.name : "Tap to choose a photo"}</span>
              <input type="file" accept={PHOTO_TYPES.join(",")} onChange={pickFile(setScheduleFile)} />
            </label>
          </div>
          <p className="verify-hint">One is enough, but sending both makes it faster. JPG, PNG or WebP, up to {MAX_PHOTO_MB} MB each.</p>

          <label className="verify-consent">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              I agree to share these photos with CSULends admins only to check that I am a Caraga State
              University student. I understand they will be deleted after the review.
            </span>
          </label>

          {error && <p className="verify-error" role="alert">{error}</p>}

          <button type="submit" className="verify-btn verify-btn--primary" disabled={busy}>
            {busy ? "Sending..." : "Send for verification"}
          </button>
        </form>
      </div>
    </div>
  );
}
