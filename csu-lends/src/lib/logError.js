import { supabase } from "./supabase";

// Sends an error to the error_logs table so admins can see it in the dashboard.
// It never throws, never logs the same message twice in a minute, and stops after 5 a minute.

const MAX_PER_MINUTE = 5;
const IGNORED = ["ResizeObserver", "Script error"];
const recent = new Map();
let windowStart = 0;
let countInWindow = 0;

export async function logError(message, source = "", details = "") {
  try {
    const text = String(message || "Unknown error").slice(0, 500);
    if (IGNORED.some((word) => text.includes(word))) return;

    const now = Date.now();
    if (now - windowStart > 60000) {
      windowStart = now;
      countInWindow = 0;
    }
    if (countInWindow >= MAX_PER_MINUTE) return;
    if (recent.has(text) && now - recent.get(text) < 60000) return;
    recent.set(text, now);
    countInWindow += 1;

    const { data } = await supabase.auth.getSession();
    const userId = data?.session?.user?.id;
    if (!userId) return;

    await supabase.from("error_logs").insert({
      user_id: userId,
      message: text,
      source: String(source || window.location.pathname).slice(0, 100),
      details: String(details || "").slice(0, 1000),
      user_agent: navigator.userAgent.slice(0, 300),
    });
  } catch {
    // Logging must never break the app.
  }
}

// Catches errors nobody handled. Returns a function that turns it off again.
export function installGlobalErrorLogging() {
  const onError = (event) =>
    logError(
      event.message || "Script error",
      "window.onerror",
      `${event.filename || ""}:${event.lineno || ""}:${event.colno || ""}`
    );

  const onRejection = (event) => {
    const reason = event.reason;
    logError(reason?.message || String(reason || "Unhandled promise rejection"), "unhandledrejection", reason?.stack || "");
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
  };
}
