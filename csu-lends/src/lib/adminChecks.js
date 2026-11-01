// Turns the dashboard numbers into a list of health checks.
// level is "ok", "warning" or "problem".

const hoursSince = (value) => (value ? (Date.now() - new Date(value).getTime()) / 3600000 : 0);
const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export function buildChecks(stats) {
  if (!stats) return [];
  const { users, items, requests } = stats;
  const checks = [];

  // Items waiting for an admin
  const waitingHours = hoursSince(items.oldest_pending_at);
  if (items.pending === 0) {
    checks.push({ id: "queue", level: "ok", title: "Review queue is clear", detail: "No items are waiting for review." });
  } else if (waitingHours > 72) {
    checks.push({
      id: "queue", level: "problem", title: "Items are waiting too long for review",
      detail: `${plural(items.pending, "item is", "items are")} waiting. The oldest has waited over ${Math.floor(waitingHours / 24)} days.`,
      fix: "Open the Review tab and approve or reject them. Students stop lending when nothing gets approved.",
    });
  } else if (waitingHours > 24) {
    checks.push({
      id: "queue", level: "warning", title: "Review queue is getting long",
      detail: `${plural(items.pending, "item is", "items are")} waiting. The oldest has waited over a day.`,
      fix: "Open the Review tab and review the oldest items first.",
    });
  } else {
    checks.push({ id: "queue", level: "ok", title: "Review queue is fresh", detail: `${plural(items.pending, "item is", "items are")} waiting, none for more than a day.` });
  }

  // Loans not returned
  if (requests.overdue > 0) {
    checks.push({
      id: "overdue", level: "warning", title: "Items past their return date",
      detail: `${plural(requests.overdue, "loan is", "loans are")} still marked Accepted after the return date.`,
      fix: "Either the item was returned and the owner forgot to tap Mark as returned, or it is late. Ask the owner.",
    });
  } else {
    checks.push({ id: "overdue", level: "ok", title: "No overdue loans", detail: "Every accepted loan is still within its dates." });
  }

  // Requests nobody answers
  if (requests.stale_pending > 0) {
    checks.push({
      id: "stale", level: "warning", title: "Requests with no reply",
      detail: `${plural(requests.stale_pending, "request has", "requests have")} waited more than 3 days for the owner to answer.`,
      fix: "Owners get no notification yet, so they may not know. Consider adding email alerts for new requests.",
    });
  } else {
    checks.push({ id: "stale", level: "ok", title: "Requests are being answered", detail: "No request has waited more than 3 days." });
  }

  // Accounts that never confirmed their email
  if (users.unconfirmed_old > 0) {
    checks.push({
      id: "unconfirmed", level: "warning", title: "Accounts stuck on email confirmation",
      detail: `${plural(users.unconfirmed_old, "account has", "accounts have")} not confirmed their email after 24 hours.`,
      fix: "Ask them to check their spam folder. If many students are stuck, the free Supabase email limit may be the cause. Set up custom SMTP under Authentication settings.",
    });
  } else {
    checks.push({ id: "unconfirmed", level: "ok", title: "Email confirmation is working", detail: "No account has been waiting more than a day to confirm." });
  }

  // Sign-up trigger failures
  if (users.without_profile > 0) {
    checks.push({
      id: "profiles", level: "problem", title: "Accounts without a profile",
      detail: `${plural(users.without_profile, "account has", "accounts have")} no profile row, so ${users.without_profile === 1 ? "they cannot" : "they cannot"} post items or send requests.`,
      fix: "The sign-up trigger failed. Re-run csulends_profile_trigger_update.sql, then add the missing profiles.",
    });
  } else {
    checks.push({ id: "profiles", level: "ok", title: "Every account has a profile", detail: "The sign-up trigger is working." });
  }

  // Broken photos
  if (items.approved_without_photo > 0) {
    checks.push({
      id: "photos", level: "warning", title: "Live items without a photo",
      detail: `${plural(items.approved_without_photo, "approved item has", "approved items have")} no photo.`,
      fix: "Take them down from the Review tab and ask the student to upload again.",
    });
  } else {
    checks.push({ id: "photos", level: "ok", title: "All live items have photos", detail: "No approved item is missing its photo." });
  }

  // App errors reported by browsers
  if (stats.errors_24h > 20) {
    checks.push({
      id: "errors", level: "problem", title: "Many app errors today",
      detail: `${stats.errors_24h} errors were reported in the last 24 hours.`,
      fix: "Open the error log below. If the same message repeats, something in the app is broken.",
    });
  } else if (stats.errors_24h > 0) {
    checks.push({
      id: "errors", level: "warning", title: "App errors reported",
      detail: `${plural(stats.errors_24h, "error was", "errors were")} reported in the last 24 hours.`,
      fix: "Check the error log below to see what happened.",
    });
  } else {
    checks.push({ id: "errors", level: "ok", title: "No app errors", detail: "No errors were reported in the last 24 hours." });
  }

  return checks;
}

export const countIssues = (checks) => checks.filter((check) => check.level !== "ok").length;
