import { createClient, SupabaseClient } from "@supabase/supabase-js";

function sanitizeUrl(url?: string): string {
  if (!url) return "";
  let cleaned = url.trim();
  // Hapus trailing slash
  cleaned = cleaned.replace(/\/+$/, "");
  // Hapus /rest/v1 jika tidak sengaja disertakan user
  cleaned = cleaned.replace(/\/rest\/v1\/?$/, "");
  return cleaned;
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const supabaseUrl = sanitizeUrl(rawUrl);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project-id") &&
    !supabaseAnonKey.includes("your-anon-key")
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey!)
  : null;
