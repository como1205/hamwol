import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/db'

// Create a Supabase client with service role key for admin operations
export function createServiceClient() {
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!, // This requires the SERVICE_ROLE_KEY environment variable
    )
}