// "5 min ago", "3 h ago", "2 days ago". Older dates show as a normal date.
export function timeAgo(value) {
  if (!value) return "never";
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// Seen in the last 5 minutes counts as online.
export const isOnline = (lastSeen) =>
  Boolean(lastSeen) && Date.now() - new Date(lastSeen).getTime() < 5 * 60 * 1000;
