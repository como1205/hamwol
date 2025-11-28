import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/db'

let client: ReturnType<typeof createBrowserClient<any>> | undefined

export function createClient() {
    if (client) return client

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase Environment Variables missing!', { supabaseUrl, supabaseKey })
        throw new Error('Supabase Environment Variables missing!')
    }

    client = createBrowserClient<any>(
        supabaseUrl,
        supabaseKey
    )

    return client
}
