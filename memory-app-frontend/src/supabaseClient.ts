import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !key) {
  // this will show in the browser console
  console.error("missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY (check .env and restart vite)");
}

export const supabase = url && key ? createClient(url, key) : null;