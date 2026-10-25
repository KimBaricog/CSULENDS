// Shared choices for item forms and filters.
// The database also enforces these (see csulends_item_approval.sql),
// so if you change a list here, change the SQL check too.

export const CATEGORIES = ["Sports", "Tech", "Books", "Other"];
export const CONDITIONS = ["Like new", "Good", "Worn"];
export const PICKUP_SPOTS = [
  "Library lobby",
  "Student center",
  "Main gate",
  "Canteen",
];
export const MAX_DAYS_OPTIONS = [1, 2, 3, 5, 7];
export const FEE_PRESETS = [0, 10, 20, 50];
export const MAX_FEE = 200;

export const MAX_PHOTO_MB = 5;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const ITEM_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const formatFee = (fee) => (fee > 0 ? `₱${fee}/day` : "Free");
