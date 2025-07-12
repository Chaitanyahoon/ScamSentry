import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types" // We'll create this type later

export const createServerClient = () =>
  createServerComponentClient<Database>({
    cookies,
  })
