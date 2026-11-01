// Small helpers for showing people.
export const initialOf = (name) =>
  name && name.trim() ? name.trim()[0].toUpperCase() : "?";

export const memberSince = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
        month: "short",
        year: "numeric",
      })
    : "";
