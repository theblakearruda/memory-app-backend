export const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

// must match supabase bucket name exactly
export const STORAGE_BUCKET = "envelope-photos";