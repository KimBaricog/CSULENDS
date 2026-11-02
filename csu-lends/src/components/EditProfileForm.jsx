import { useState } from "react";
import { supabase } from "../lib/supabase";

// Lets a student change their name, program and short bio.
export default function EditProfileForm({ userId, summary, onSaved }) {
  const [fullName, setFullName] = useState(summary?.full_name || "");
  const [program, setProgram] = useState(summary?.program || "");
  const [bio, setBio] = useState(summary?.bio || "");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const next = {};
    const name = fullName.trim();
    if (name.length < 2) next.fullName = "Enter your full name (at least 2 letters).";
    else if (name.length > 60) next.fullName = "Keep your name under 60 characters.";
    if (program.length > 80) next.program = "Keep this under 80 characters.";
    if (bio.length > 200) next.bio = "Keep your bio under 200 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSaved(false);
    if (!validate() || !userId) return;

    setBusy(true);
    const { data, error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        program: program.trim() || null,
        bio: bio.trim() || null,
      })
      .eq("id", userId)
      .select("id");
    setBusy(false);

    if (error || !data || data.length === 0) {
      console.error("Could not save profile:", error);
      setFormError("We could not save your profile. Please try again.");
      return;
    }

    // Keep the name in the login account in step, so the header shows the new initial.
    await supabase.auth.updateUser({ data: { full_name: fullName.trim() } }).catch(() => {});

    setSaved(true);
    onSaved();
  };

  return (
    <form className="pform" onSubmit={handleSubmit} noValidate>
      {formError && <p className="pform-banner" role="alert">{formError}</p>}
      {saved && <p className="pform-saved" role="status">Profile saved.</p>}

      <div className="pform-field">
        <label htmlFor="pf-name">Full name</label>
        <input id="pf-name" type="text" maxLength={60} value={fullName} onChange={(e) => setFullName(e.target.value)} aria-invalid={Boolean(errors.fullName)} />
        {errors.fullName && <p className="pform-error">{errors.fullName}</p>}
        <p className="pform-hint">Other students see this name on your items and ratings.</p>
      </div>

      <div className="pform-field">
        <label htmlFor="pf-program">Program <span>(optional)</span></label>
        <input id="pf-program" type="text" maxLength={80} placeholder="e.g. BS Information Technology" value={program} onChange={(e) => setProgram(e.target.value)} />
        {errors.program && <p className="pform-error">{errors.program}</p>}
      </div>

      <div className="pform-field">
        <label htmlFor="pf-bio">About you <span>(optional)</span></label>
        <textarea id="pf-bio" rows={3} maxLength={200} placeholder="A short line so classmates know who you are" value={bio} onChange={(e) => setBio(e.target.value)} />
        <p className="pform-hint">{bio.length}/200</p>
        {errors.bio && <p className="pform-error">{errors.bio}</p>}
      </div>

      <button type="submit" className="pform-submit" disabled={busy}>
        {busy ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
