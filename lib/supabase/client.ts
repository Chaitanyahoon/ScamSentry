import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types" // We'll create this type later

export const createClient = () => createClientComponentClient<Database>()
