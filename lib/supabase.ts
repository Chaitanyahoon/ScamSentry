import { createClient } from "@supabase/supabase-js"

// Ensure these environment variables are set in your .env.local file or Vercel project settings
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fall back to Supabase’s public demo project when env vars aren’t present
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase env vars not found. Falling back to the public demo project. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in production.",
  )
}

export const supabase = createClient(supabaseUrl || "https://demo.supabase.co", supabaseAnonKey || "public-anon-key")
